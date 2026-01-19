"use server";

import { db } from "@/lib/firebase";
import {
    collection,
    query,
    where,
    orderBy,
    limit,
    startAfter,
    getDocs,
    doc,
    getDoc,
    updateDoc,
    serverTimestamp
} from "firebase/firestore";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { getAbsoluteUrl, getTestUrl, needsTestUrl } from "./mediaUtils";

/**
 * Get all Pinterest posts with status filtering, pagination, and enhanced filtering
 */
export async function getPinterestPosts({
    pageSize = 12,
    lastDocId = null,
    filters = {},
    sortBy = "createdAt",
    sortOrder = "desc"
} = {}) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;
        const user = await verifyToken(token);

        if (!user) {
            return { success: false, message: "Unauthorized", posts: [], hasMore: false };
        }

        let constraints = [
            where("userId", "==", user.id),
            where("platform", "==", "pinterest"),
            where("delete", "==", 0)
        ];

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

        // Search Query (Client-side filtering usually if not using Algolia, but here we can try basic)
        // Firestore doesn't support full text search easily. We will filter post-fetch if needed or rely on exact match if implemented differently.
        // For now, consistent with threads, we fetch and filter or just ignore if complex. 
        // Threads implementation fetched more and filtered in memory for search.

        const orderField = sortBy === "date" ? "createdAt" : sortBy;
        constraints.push(orderBy(orderField, sortOrder));

        if (lastDocId) {
            const lastDocRef = doc(db, "pinterest_posts", lastDocId);
            const lastDocSnap = await getDoc(lastDocRef);
            if (lastDocSnap.exists()) {
                constraints.push(startAfter(lastDocSnap));
            }
        }

        const fetchLimit = filters.searchQuery ? pageSize * 5 : pageSize;
        constraints.push(limit(fetchLimit));

        const q = query(collection(db, "pinterest_posts"), ...constraints);
        const snapshot = await getDocs(q);

        let posts = [];
        snapshot.forEach(docSnap => {
            const data = docSnap.data();

            // Search filter
            if (filters.searchQuery) {
                const text = (data.title || data.message || data.description || "").toLowerCase();
                if (!text.includes(filters.searchQuery.toLowerCase())) return;
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
        const hasMore = snapshot.docs.length >= fetchLimit || (posts.length === pageSize && snapshot.size > pageSize); // Approximation

        return {
            success: true,
            posts,
            hasMore: posts.length === pageSize, // Simple check
            lastPostId: lastVisibleDoc
        };

    } catch (error) {
        console.error("Error in getPinterestPosts:", error);
        return { success: false, message: error.message, posts: [], hasMore: false };
    }
}

/**
 * Get aggregate stats for Pinterest posts
 */
export async function getPinterestPostsStats({ accountId = null } = {}) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;
        const user = await verifyToken(token);

        if (!user) return { success: false, message: "Unauthorized" };

        let constraints = [
            where("userId", "==", user.id),
            where("platform", "==", "pinterest"),
            where("status", "==", "published"),
            where("delete", "==", 0)
        ];

        if (accountId && accountId !== "all") {
            constraints.push(where("accountId", "==", accountId));
        }

        constraints.push(limit(2000));
        const q = query(collection(db, "pinterest_posts"), ...constraints);
        const snapshot = await getDocs(q);

        let stats = {
            totalPosts: snapshot.size,
            totalLikes: 0,
            totalReplies: 0, // Saves/Comments
            totalEngagement: 0,
            avgEngagement: 0
        };

        snapshot.docs.forEach(docSnap => {
            const data = docSnap.data();
            const metrics = data.metrics || {};
            // Map Pinterest metrics
            // likes usually not available, maybe saves?
            stats.totalLikes += (metrics.saves || 0); // treating saves as likes equivalent for summary
            stats.totalReplies += (metrics.clicks || 0); // or comments?
        });

        stats.totalEngagement = stats.totalLikes + stats.totalReplies;
        if (stats.totalPosts > 0) {
            stats.avgEngagement = parseFloat((stats.totalEngagement / stats.totalPosts).toFixed(1));
        }

        return { success: true, stats };
    } catch (error) {
        console.error("Error in getPinterestPostsStats:", error);
        return { success: false, message: error.message };
    }
}

/**
 * Helper: Make Pinterest Request
 */
async function makePinterestRequest(endpoint, body, accessToken, method = "POST") {
    const PINTEREST_API_URL = process.env.PINTEREST_API_URL || "https://api.pinterest.com/v5";
    console.log("Using Pinterest API URL:", PINTEREST_API_URL);

    // Ensure endpoint starts with slash if not present
    const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    const url = `${PINTEREST_API_URL}${path}`;
    const headers = {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
    };
    const options = { method, headers };
    if (body && (method === "POST" || method === "PATCH")) {
        options.body = JSON.stringify(body);
    }
    const response = await fetch(url, options);
    const data = await response.json();
    if (!response.ok) {
        // Handle Trial Access Error specifically
        if (data.code === 29) {
            throw new Error("Pinterest Trial Mode Restriction: You cannot post Pins in Production until you add your account as a 'Tester' in your Pinterest Developer App settings.");
        }
        throw new Error(data.message || "Pinterest API error");
    }
    return data;
}

/**
 * Helper: Get Account
 */
async function getPinterestAccount(userId, platformUserId) {
    const q = query(
        collection(db, "socialAccounts"),
        where("userId", "==", userId),
        where("accountId", "==", platformUserId),
        where("platform", "==", "pinterest"),
        where("status", "==", "active")
    );
    const snapshot = await getDocs(q);
    if (snapshot.empty) throw new Error("Pinterest account not found");
    return snapshot.docs[0].data();
}

/**
 * Publish a scheduled Pinterest post immediately
 */
export async function publishPinterestPostNow(postId) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;
        const user = await verifyToken(token);

        const postRef = doc(db, "pinterest_posts", postId);
        const postSnap = await getDoc(postRef);

        if (!postSnap.exists()) return { success: false, message: "Post not found" };
        const post = postSnap.data();

        if (post.userId !== user.id) return { success: false, message: "Unauthorized" };

        const { accessToken } = await getPinterestAccount(user.id, post.accountId);

        // Prepare Pin data
        let mediaSource = {};
        const media = post.content?.media || [];
        const postType = post.postType || (media.length > 1 ? "carousel" : "standard");

        if (postType === "carousel" && media.length > 1) {
            mediaSource = {
                source_type: "multiple_image_urls",
                items: media.map(item => ({
                    title: post.title || "",
                    description: post.message || post.description || "",
                    link: post.link || "",
                    source: {
                        source_type: "image_url",
                        url: needsTestUrl(item.url) ? getTestUrl("image") : getAbsoluteUrl(item.url)
                    }
                }))
            };
        } else {
            const item = media[0] || { url: post.imageUrl, type: "IMAGE" };
            const mediaUrl = needsTestUrl(item.url) ? getTestUrl(item.type) : getAbsoluteUrl(item.url);

            mediaSource = {
                source_type: "image_url",
                url: mediaUrl
            };
        }

        const pinData = {
            board_id: post.boardId,
            title: post.title || "",
            description: post.message || post.description || "",
            link: post.link || "",
            media_source: mediaSource
        };

        const result = await makePinterestRequest("/pins", pinData, accessToken, "POST");

        await updateDoc(postRef, {
            status: "published",
            pinterestPinId: result.id,
            publishedAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            scheduledAt: serverTimestamp(), // Clears future schedule
            delete: 0
        });

        revalidatePath("/admin/social/pinterest/posts");
        return { success: true, message: "Pin published successfully", pinId: result.id };
    } catch (error) {
        console.error("Error publishing Pinterest Pin now:", error);
        return { success: false, message: error.message };
    }
}

/**
 * Delete a Pinterest post (Soft Delete)
 */
export async function deletePinterestPost(postId) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;
        const user = await verifyToken(token);

        const postRef = doc(db, "pinterest_posts", postId);
        const postSnap = await getDoc(postRef);

        if (!postSnap.exists()) return { success: false, message: "Post not found" };
        const postData = postSnap.data();
        if (postData.userId !== user.id) return { success: false, message: "Unauthorized" };

        let apiDeleteSuccess = false;
        let apiError = null;

        // 1. Delete from Pinterest API if published
        if (postData.status === "published" && postData.pinterestPinId && postData.accountId) {
            try {
                const { accessToken } = await getPinterestAccount(user.id, postData.accountId);
                await makePinterestRequest(`/pins/${postData.pinterestPinId}`, null, accessToken, "DELETE");
                apiDeleteSuccess = true;
            } catch (error) {
                console.error("Pinterest API Delete Error:", error);
                apiError = error.message;
                // If it's already deleted on Pinterest, we can consider it a success for our records
                if (error.message?.includes("not found")) {
                    apiDeleteSuccess = true;
                }
            }
        }

        // 2. Soft delete in Firestore
        await updateDoc(postRef, {
            delete: 1,
            deletedAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            apiDeleteSuccess,
            apiDeleteError: apiError
        });

        revalidatePath("/admin/social/pinterest/posts");
        return {
            success: true,
            message: apiDeleteSuccess || !postData.pinterestPinId
                ? "Post deleted successfully"
                : "Post deleted from dashboard (Pinterest API deletion failed)"
        };
    } catch (error) {
        console.error("Error deleting Pinterest post:", error);
        return { success: false, message: error.message };
    }
}

/**
 * Update a scheduled Pinterest post
 */
export async function updatePinterestPost({
    postId,
    title,
    message,
    media,
    scheduling,
    boardId,
    link,
    accountId
}) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;
        const user = await verifyToken(token);

        const postRef = doc(db, "pinterest_posts", postId);
        const postSnap = await getDoc(postRef);

        if (!postSnap.exists()) return { success: false, message: "Post not found" };
        const postData = postSnap.data();

        if (postData.userId !== user.id) return { success: false, message: "Unauthorized" };
        if (postData.status === "published") return { success: false, message: "Cannot edit published posts" };

        const updates = {
            title,
            message,
            description: message, // Synced
            content: { media },
            accountId,
            boardId,
            link,
            updatedAt: serverTimestamp()
        };

        if (scheduling) {
            updates.scheduledAt = new Date(scheduling);
            updates.status = "scheduled";
        }

        await updateDoc(postRef, updates);
        revalidatePath("/admin/social/pinterest/posts");

        return { success: true, message: "Post updated successfully" };
    } catch (error) {
        console.error("Error updating Pinterest post:", error);
        return { success: false, message: error.message };
    }
}

/**
 * Get all Pinterest posts for calendar (date range)
 * Re-included for calendar view compatibility
 */
export async function getAllPinterestCalendarPosts({ startDate, endDate }) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;
        const user = await verifyToken(token);

        if (!user) return { success: false, posts: [] };

        let constraints = [
            where("userId", "==", user.id),
            where("platform", "==", "pinterest"),
            where("delete", "==", 0)
        ];

        // Simple optimization: if dates are provided, try to filter? 
        // Firestore inequalities on multiple fields are tricky. Use broad fetch.

        const q = query(collection(db, "pinterest_posts"), ...constraints);
        const snapshot = await getDocs(q);

        const posts = snapshot.docs.map(docSnap => {
            const data = docSnap.data();
            return {
                id: docSnap.id,
                ...data,
                scheduledAt: data.scheduledAt?.toDate?.().toISOString() || data.scheduledAt || null,
                createdAt: data.createdAt?.toDate?.().toISOString() || data.createdAt || null,
                publishedAt: data.publishedAt?.toDate?.().toISOString() || data.publishedAt || null,
            };
        }).filter(post => {
            const dateToCheck = new Date(post.scheduledAt || post.createdAt);
            return dateToCheck >= new Date(startDate) && dateToCheck <= new Date(endDate);
        });

        return { success: true, posts };
    } catch (error) {
        console.error("Error in getAllPinterestCalendarPosts:", error);
        return { success: false, message: error.message };
    }
}
