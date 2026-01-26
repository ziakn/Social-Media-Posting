"use server";

import { BskyAgent } from "@atproto/api";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, orderBy, limit, startAfter, doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { verifyToken } from "@/lib/auth";
// import { cookies } from "next/headers"; // Removed as no longer needed for token extraction
import { revalidatePath } from "next/cache";
import { uploadMedia, getLinkMetadata } from "./createPost";
import { RichText } from "@atproto/api";

/**
 * Get authenticated user (Helper)
 */
async function getAuthenticatedUser() {
    const user = await verifyToken();

    if (!user) {
        throw new Error("Invalid or expired token. Please log in again.");
    }

    return user;
}

/**
 * Get BlueSky account info (Helper)
 */
async function getBlueSkyAccount(userId, accountId) {
    const q = query(
        collection(db, "socialAccounts"),
        where("userId", "==", userId),
        where("platform", "==", "bluesky"),
        where("accountId", "==", accountId),
        where("status", "==", "active")
    );
    const snapshot = await getDocs(q);
    if (snapshot.empty) throw new Error("BlueSky account not found or inactive");

    return snapshot.docs[0].data();
}

/**
 * Get all BlueSky posts with status filtering, pagination, and enhanced filtering
 */
export async function getBlueSkyPosts({
    pageSize = 12,
    lastDocId = null,
    filters = {},
    sortBy = "createdAt",
    sortOrder = "desc"
} = {}) {
    try {
        const user = await getAuthenticatedUser();

        let constraints = [
            where("platform", "==", "bluesky"),
            where("delete", "==", 0)
        ];

        // Filter by User ID unless Administrator
        if (user.role !== 'Administrator') {
            constraints.push(where("userId", "==", user.id));
        }

        // Status filter
        if (filters.status && filters.status !== "all") {
            constraints.push(where("status", "==", filters.status));
        }

        // Account filter
        if (filters.accountId && filters.accountId !== "all") {
            constraints.push(where("accountId", "==", filters.accountId));
        }

        // Post type filter
        if (filters.postType && filters.postType !== "all") {
            constraints.push(where("postType", "==", filters.postType));
        }

        // Date range filters
        const orderField = sortBy === "date" ? "createdAt" : sortBy;
        if (filters.dateFrom && orderField === "createdAt") {
            constraints.push(where("createdAt", ">=", new Date(filters.dateFrom)));
        }
        if (filters.dateTo && orderField === "createdAt") {
            constraints.push(where("createdAt", "<=", new Date(filters.dateTo)));
        }

        // Sorting
        constraints.push(orderBy(orderField, sortOrder));

        // Cursor for pagination
        if (lastDocId) {
            const lastDocRef = doc(db, "bluesky_posts", lastDocId);
            const lastDocSnap = await getDoc(lastDocRef);
            if (lastDocSnap.exists()) {
                constraints.push(startAfter(lastDocSnap));
            }
        }

        const fetchLimit = filters.searchQuery ? pageSize * 10 : pageSize * 2;
        constraints.push(limit(fetchLimit));

        const q = query(collection(db, "bluesky_posts"), ...constraints);
        const snapshot = await getDocs(q);

        let posts = [];
        snapshot.forEach(docSnap => {
            const data = docSnap.data();

            // Search filter
            if (filters.searchQuery) {
                const message = (data.message || data.caption || data.content?.text || "").toLowerCase();
                if (!message.includes(filters.searchQuery.toLowerCase())) return;
            }

            if (posts.length < pageSize) {
                posts.push({
                    id: docSnap.id,
                    ...data,
                    createdAt: data.createdAt?.toDate?.().toISOString() || data.createdAt || null,
                    updatedAt: data.updatedAt?.toDate?.().toISOString() || data.updatedAt || null,
                    scheduledAt: data.scheduledAt?.toDate?.().toISOString() || data.scheduledAt || null,
                    publishedAt: data.publishedAt?.toDate?.().toISOString() || data.publishedAt || null,
                });
            }
        });

        const lastVisibleDoc = snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1].id : null;
        const hasMore = snapshot.docs.length >= fetchLimit;

        return {
            success: true,
            posts,
            hasMore,
            lastPostId: lastVisibleDoc
        };

    } catch (error) {
        console.error("Error in getBlueSkyPosts:", error);
        return { success: false, message: error.message, posts: [], hasMore: false };
    }
}

/**
 * Get aggregate stats for BlueSky posts
 */
export async function getBlueSkyPostsStats({ accountId = null } = {}) {
    try {
        const user = await getAuthenticatedUser();

        let constraints = [
            where("platform", "==", "bluesky"),
            where("status", "==", "published"),
            where("delete", "==", 0)
        ];

        // Filter by User ID unless Administrator
        if (user.role !== 'Administrator') {
            constraints.push(where("userId", "==", user.id));
        }

        if (accountId && accountId !== "all") {
            constraints.push(where("accountId", "==", accountId));
        }

        constraints.push(limit(2000));
        const q = query(collection(db, "bluesky_posts"), ...constraints);
        const snapshot = await getDocs(q);

        let stats = {
            totalPosts: 0,
            totalLikes: 0,
            totalReplies: 0,
            totalEngagement: 0,
            avgEngagement: 0
        };

        snapshot.forEach(docSnap => {
            const data = docSnap.data();

            stats.totalPosts++;
            stats.totalLikes += data.metrics?.likes || 0;
            stats.totalReplies += data.metrics?.replies || 0;
        });

        stats.totalEngagement = stats.totalLikes + stats.totalReplies;
        stats.avgEngagement = stats.totalPosts > 0 ? Math.round(stats.totalEngagement / stats.totalPosts) : 0;

        return { success: true, stats };
    } catch (error) {
        console.error("Error in getBlueSkyPostsStats:", error);
        return { success: false, message: error.message };
    }
}

/**
 * Publish a scheduled BlueSky post immediately
 */
export async function publishBlueSkyPostNow(postId) {
    try {
        const user = await getAuthenticatedUser();
        const postRef = doc(db, "bluesky_posts", postId);
        const postSnap = await getDoc(postRef);

        if (!postSnap.exists()) return { success: false, message: "Post not found" };
        const post = postSnap.data();

        if (post.userId !== user.id && user.role !== 'Administrator') return { success: false, message: "Unauthorized" };

        const account = await getBlueSkyAccount(post.userId, post.accountId); // Use post.userId to get account owner's credentials
        const agent = new BskyAgent({ service: "https://bsky.social" });
        await agent.login({ identifier: account.identifier, password: account.password });

        // Process Rich Text (Facets for mentions/links)
        const rt = new RichText({ text: post.content.text || "" });
        await rt.detectFacets(agent);

        const record = {
            text: rt.text,
            facets: rt.facets,
            createdAt: new Date().toISOString()
        };

        const media = post.content.media || [];
        const link = post.content.link || null;

        // Handle Media
        if (media.length > 0) {
            const uploadedMedia = [];
            for (const item of media) {
                const result = await uploadMedia(agent, item);
                uploadedMedia.push(result);
            }

            const images = uploadedMedia.filter(m => m.$type === "app.bsky.embed.images#image");
            const video = uploadedMedia.find(m => m.$type === "app.bsky.embed.video");

            if (video) {
                record.embed = video;
            } else if (images.length > 0) {
                record.embed = {
                    $type: "app.bsky.embed.images",
                    images: images
                };
            }
        }

        // Handle Link Card (External Embed)
        if (link && !record.embed) {
            record.embed = await getLinkMetadata(agent, link);
        }

        const res = await agent.post(record);

        await updateDoc(postRef, {
            status: "published",
            blueskyUri: res.uri,
            blueskyCid: res.cid,
            publishedAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            scheduledAt: serverTimestamp(), // Sync with current publish time
            delete: 0
        });

        revalidatePath("/admin/social/bluesky/posts");
        revalidatePath("/admin/social/bluesky/calendar");

        return { success: true, message: "Post published successfully", blueskyUri: res.uri };

    } catch (error) {
        console.error("Publish BlueSky Post Now Error:", error);
        return { success: false, message: error.message };
    }
}

/**
 * Delete a BlueSky post (Soft Delete)
 */
export async function deleteBlueSkyPost(postId) {
    try {
        const user = await getAuthenticatedUser();
        const postRef = doc(db, "bluesky_posts", postId);
        const postSnap = await getDoc(postRef);

        if (!postSnap.exists()) return { success: false, message: "Post not found" };
        if (postSnap.data().userId !== user.id && user.role !== 'Administrator') return { success: false, message: "Unauthorized" };

        await updateDoc(postRef, {
            delete: 1,
            updatedAt: serverTimestamp()
        });

        revalidatePath("/admin/social/bluesky/posts");
        return { success: true, message: "Post deleted successfully" };
    } catch (error) {
        return { success: false, message: error.message };
    }
}

/**
 * Update a scheduled BlueSky post
 */
export async function updateBlueSkyPost({ postId, text, media, link, scheduling, accountId }) {
    try {
        const user = await getAuthenticatedUser();
        const postRef = doc(db, "bluesky_posts", postId);
        const postSnap = await getDoc(postRef);

        if (!postSnap.exists()) return { success: false, message: "Post not found" };
        const postData = postSnap.data();

        if (postData.userId !== user.id && user.role !== 'Administrator') return { success: false, message: "Unauthorized" };
        if (postData.status === "published") return { success: false, message: "Cannot edit published posts" };

        const updates = {
            content: { text, media, link },
            accountId,
            updatedAt: serverTimestamp()
        };

        if (scheduling) {
            updates.scheduledAt = scheduling;
            updates.status = "scheduled";
        }

        await updateDoc(postRef, updates);
        revalidatePath("/admin/social/bluesky/posts");

        return { success: true, message: "Post updated successfully" };
    } catch (error) {
        return { success: false, message: error.message };
    }
}

/**
 * Get all BlueSky posts for calendar
 */
export async function getAllBlueSkyCalendarPosts({ startDate, endDate } = {}) {
    try {
        const user = await getAuthenticatedUser();

        let constraints = [
            where("platform", "==", "bluesky"),
            where("delete", "==", 0)
        ];

        // Filter by User ID unless Administrator
        if (user.role !== 'Administrator') {
            constraints.push(where("userId", "==", user.id));
        }

        if (startDate && endDate) {
            constraints.push(where("createdAt", ">=", new Date(startDate)));
            constraints.push(where("createdAt", "<=", new Date(endDate)));
        }

        const q = query(
            collection(db, "bluesky_posts"),
            ...constraints,
            orderBy("createdAt", "desc"),
            limit(1000)
        );

        const snapshot = await getDocs(q);
        const posts = snapshot.docs.map(doc => {
            const data = doc.data();
            const displayDate = data.scheduledAt || data.publishedAt || data.createdAt;
            return {
                id: doc.id,
                ...data,
                scheduledAt: displayDate?.toDate?.().toISOString() || displayDate || null,
                createdAt: data.createdAt?.toDate?.().toISOString() || data.createdAt || null,
                updatedAt: data.updatedAt?.toDate?.().toISOString() || data.updatedAt || null,
                publishedAt: data.publishedAt?.toDate?.().toISOString() || data.publishedAt || null,
                status: data.status || "published"
            };
        }).filter(Boolean);

        return { success: true, posts };
    } catch (error) {
        return { success: false, posts: [] };
    }
}
