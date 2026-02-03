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
    getDoc,
    doc,
    updateDoc,
    deleteDoc,
    serverTimestamp
} from "firebase/firestore";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { createLinkedinPost } from "./createPost";

/**
 * Helper to serialize Firestore document data
 */
function serializeDoc(docSnap) {
    const data = docSnap.data();
    const serialized = {
        id: docSnap.id,
        ...data
    };

    // Convert all known timestamp fields to ISO strings
    const timestampFields = ['createdAt', 'updatedAt', 'scheduledAt', 'publishedAt', 'tokenExpiresAt'];
    timestampFields.forEach(field => {
        if (data[field]) {
            if (typeof data[field].toDate === 'function') {
                serialized[field] = data[field].toDate().toISOString();
            } else if (data[field] instanceof Date) {
                serialized[field] = data[field].toISOString();
            } else if (typeof data[field] === 'string') {
                serialized[field] = data[field];
            }
        } else {
            serialized[field] = null;
        }
    });

    return serialized;
}

/**
 * Get all LinkedIn posts with status filtering, pagination, and enhanced filtering
 */
export async function getLinkedinPosts({
    pageSize = 12,
    lastDocId = null,
    filters = {},
    sortBy = "createdAt",
    sortOrder = "desc"
} = {}) {
    try {
        const user = await verifyToken();

        if (!user) {
            return { success: false, message: "Unauthorized", posts: [], hasMore: false };
        }

        let constraints = [
            where("userId", "==", user.id),
            where("platform", "==", "linkedin"),
            // where("delete", "==", 0) // LinkedIn posts don't seem to have a delete field in existing code, but I'll add it for consistency if needed
        ];

        // Status filter
        if (filters.status && filters.status !== "all") {
            const status = filters.status === "published" ? "posted" : filters.status;
            constraints.push(where("status", "==", status));
        }

        // Account filter
        if (filters.accountId && filters.accountId !== "all") {
            constraints.push(where("accountId", "==", filters.accountId));
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
            const lastDocRef = doc(db, "linkedin_posts", lastDocId);
            const lastDocSnap = await getDoc(lastDocRef);
            if (lastDocSnap.exists()) {
                constraints.push(startAfter(lastDocSnap));
            }
        }

        // Limit
        const fetchLimit = filters.searchQuery ? pageSize * 10 : pageSize * 2;
        constraints.push(limit(fetchLimit));

        const q = query(collection(db, "linkedin_posts"), ...constraints);
        const snapshot = await getDocs(q);

        // Fetch user's LinkedIn accounts to enrich post data
        const accountsQuery = query(
            collection(db, "socialAccounts"),
            where("userId", "==", user.id)
            // Robustness: intentionally fetching all user accounts to match by accountId, ignoring platform filter
        );
        const accountsSnapshot = await getDocs(accountsQuery);
        const accountMap = {};
        accountsSnapshot.forEach(doc => {
            const data = doc.data();
            // Store by ID. Ensure string key.
            const id = data.accountId || doc.id;
            if (id) {
                accountMap[String(id)] = {
                    displayName: data.displayName || data.username || "LinkedIn Member",
                    profilePicture: data.profilePicture || data.image || data.avatar,
                    headline: data.headline || "Professional"
                };
            }
        });

        let posts = [];
        snapshot.forEach(docSnap => {
            const data = docSnap.data();


            // Skip soft-deleted posts
            if (data.delete === 1) return;

            // Search filter
            if (filters.searchQuery) {
                const text = (data.text || "").toLowerCase();
                if (!text.includes(filters.searchQuery.toLowerCase())) return;
            }

            // Post Type Filter logic
            if (filters.postType && filters.postType !== "all") {
                const hasVideo = !!data.videoUrl;
                const hasImage = !!data.imageUrl;
                const matchesUrl = /(https?:\/\/[^\s]+)/g.test(data.text || "");

                let type = "text";
                if (hasVideo) type = "video";
                else if (hasImage) type = "image";
                else if (matchesUrl) type = "link";

                if (filters.postType === "link" && type !== "link") return;
                if (filters.postType === "video" && type !== "video") return;
                if (filters.postType === "image" && type !== "image") return;
                if (filters.postType === "text" && type !== "text") return;
            }

            if (posts.length < pageSize) {
                const serializedPost = serializeDoc(docSnap);
                // Look up account robustly
                const account = accountMap[String(serializedPost.accountId)];

                // Enrich post with account data
                if (account) {
                    serializedPost.displayName = account.displayName;
                    serializedPost.profilePicture = account.profilePicture;
                    serializedPost.headline = account.headline;
                }

                posts.push(serializedPost);
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
        console.error("Error in getLinkedinPosts:", error);
        return { success: false, message: error.message, posts: [], hasMore: false };
    }
}

/**
 * Get aggregate stats for LinkedIn posts
 */
export async function getLinkedinPostsStats({ accountId = null } = {}) {
    try {
        const user = await verifyToken();

        if (!user) return { success: false, message: "Unauthorized" };

        let constraints = [
            where("userId", "==", user.id),
            where("platform", "==", "linkedin"),
            where("status", "==", "posted")
        ];

        if (accountId && accountId !== "all") {
            constraints.push(where("accountId", "==", accountId));
        }

        constraints.push(limit(2000));
        const q = query(collection(db, "linkedin_posts"), ...constraints);
        const snapshot = await getDocs(q);

        let stats = {
            totalPosts: 0,
            totalLikes: 0,
            totalComments: 0,
            totalEngagement: 0,
            avgEngagement: 0
        };

        snapshot.forEach(docSnap => {
            const data = docSnap.data();
            stats.totalPosts++;
            // Note: metrics structure might differ, adjusting based on common patterns
            stats.totalLikes += data.metrics?.likes || 0;
            stats.totalComments += data.metrics?.comments || 0;
        });

        stats.totalEngagement = stats.totalLikes + stats.totalComments;
        stats.avgEngagement = stats.totalPosts > 0 ? Math.round(stats.totalEngagement / stats.totalPosts) : 0;

        return { success: true, stats };
    } catch (error) {
        console.error("Error in getLinkedinPostsStats:", error);
        return { success: false, message: error.message };
    }
}

/**
 * Publish a scheduled LinkedIn post immediately
 */
export async function publishLinkedinPostNow(postId) {
    try {
        const user = await verifyToken();

        if (!user) return { success: false, message: "Unauthorized" };

        // 1. Get post from Firestore
        const postRef = doc(db, "linkedin_posts", postId);
        const postSnap = await getDoc(postRef);

        if (!postSnap.exists()) {
            return { success: false, message: "Post not found" };
        }

        const post = postSnap.data();

        // 2. Publish using createLinkedinPost (which handles immediate logic)
        const result = await createLinkedinPost({
            text: post.text,
            imageUrl: post.imageUrl,
            videoUrl: post.videoUrl,
            accountId: post.accountId,
        });

        if (result.success) {
            // Update the existing document with publication details
            await updateDoc(postRef, {
                status: "posted",
                publishedAt: serverTimestamp(),
                scheduledAt: serverTimestamp(), // Sync with current publish time
                updatedAt: serverTimestamp(),
                linkedinPostId: result.postId || null // Ensure postId is captured if returned
            });

            revalidatePath("/portal/social/linkedin/posts");
            return { success: true, message: "Post published successfully" };
        } else {
            return { success: false, message: result.message };
        }
    } catch (error) {
        console.error("Error publishing LinkedIn post now:", error);
        return { success: false, message: error.message };
    }
}

/**
 * Get all LinkedIn posts for calendar
 */
export async function getAllLinkedinCalendarPosts({ startDate, endDate } = {}) {
    try {
        const user = await verifyToken();

        if (!user) return { success: false, posts: [] };

        let constraints = [
            where("userId", "==", user.id),
            where("platform", "==", "linkedin")
        ];

        const q = query(
            collection(db, "linkedin_posts"),
            ...constraints,
            orderBy("createdAt", "desc"),
            limit(1000)
        );

        const snapshot = await getDocs(q);
        // Filter out soft-deleted posts
        const posts = snapshot.docs
            .filter(docSnap => docSnap.data().delete !== 1)
            .map(docSnap => serializeDoc(docSnap));

        return { success: true, posts };
    } catch (error) {
        console.error("Error in getAllLinkedinCalendarPosts:", error);
        return { success: false, posts: [] };
    }
}

/**
 * Delete a LinkedIn post
 */
export async function deleteLinkedinPost(postId) {
    try {
        const user = await verifyToken();

        if (!user) return { success: false, message: "Unauthorized" };

        const postRef = doc(db, "linkedin_posts", postId);
        const postSnap = await getDoc(postRef);

        if (!postSnap.exists()) return { success: false, message: "Post not found" };

        if (postSnap.data().userId !== user.id) return { success: false, message: "Unauthorized" };

        // Soft delete: set delete flag instead of actually removing the document
        // This matches the pattern used in Facebook and Instagram modules
        await updateDoc(postRef, {
            delete: 1,
            deletedAt: serverTimestamp()
        });

        revalidatePath("/portal/social/linkedin/posts");
        return { success: true, message: "Post deleted successfully" };
    } catch (error) {
        console.error("Error deleting LinkedIn post:", error);
        return { success: false, message: error.message };
    }
}

/**
 * Update a scheduled LinkedIn post
 */
export async function updateLinkedinPostAction({
    postId,
    text,
    imageUrl,
    videoUrl,
    scheduledAt,
    accountId
}) {
    try {
        const user = await verifyToken();

        if (!user) return { success: false, message: "Unauthorized" };

        const postRef = doc(db, "linkedin_posts", postId);
        const postSnap = await getDoc(postRef);

        if (!postSnap.exists()) return { success: false, message: "Post not found" };

        const postData = postSnap.data();
        if (postData.userId !== user.id) return { success: false, message: "Unauthorized" };

        if (postData.status === "posted") {
            return { success: false, message: "Cannot edit published posts" };
        }

        const updates = {
            text,
            imageUrl,
            videoUrl,
            accountId,
            updatedAt: serverTimestamp()
        };

        if (scheduledAt) {
            updates.scheduledAt = new Date(scheduledAt);
            updates.status = "scheduled";
        }

        await updateDoc(postRef, updates);
        revalidatePath("/portal/social/linkedin/posts");

        return { success: true, message: "Post updated successfully" };
    } catch (error) {
        console.error("Error updating LinkedIn post:", error);
        return { success: false, message: error.message };
    }
}

/**
 * Fetch all connected LinkedIn accounts for the current user
 */
export async function fetchLinkedinAccounts() {
    try {
        const user = await verifyToken();

        if (!user) return { success: false, message: "Unauthorized" };

        const q = query(
            collection(db, "socialAccounts"),
            where("userId", "==", user.id),
            where("platform", "==", "linkedin"),
            where("status", "==", "active")
        );

        const snapshot = await getDocs(q);
        const accounts = snapshot.docs.map(docSnap => serializeDoc(docSnap));

        return { success: true, accounts };
    } catch (error) {
        console.error("Error fetching LinkedIn accounts:", error);
        return { success: false, message: error.message };
    }
}
