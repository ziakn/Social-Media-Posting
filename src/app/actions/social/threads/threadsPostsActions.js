// app/actions/social/threads/threadsPostsActions.js
"use server";

import { db } from "@/lib/firebase";
import {
    collection,
    query,
    where,
    orderBy,
    getDocs,
    doc,
    getDoc,
    updateDoc,
    serverTimestamp
} from "firebase/firestore";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

/**
 * Get all Threads posts with status filtering, pagination, and enhanced filtering
 */
export async function getThreadsPosts({
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
            where("platform", "==", "threads")
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

        // Date range filters
        if (filters.dateFrom) {
            constraints.push(where("createdAt", ">=", new Date(filters.dateFrom)));
        }
        if (filters.dateTo) {
            constraints.push(where("createdAt", "<=", new Date(filters.dateTo)));
        }

        // Sorting
        constraints.push(orderBy(sortBy, sortOrder));

        const q = query(collection(db, "threads_posts"), ...constraints);
        const snapshot = await getDocs(q);

        let allPosts = [];
        snapshot.forEach(docSnap => {
            const data = docSnap.data();

            // Soft-delete check
            if (data.deleted === 1) return;

            // Search filter
            if (filters.searchQuery) {
                const message = (data.message || data.caption || data.content?.text || "").toLowerCase();
                if (!message.includes(filters.searchQuery.toLowerCase())) return;
            }

            const serializedPost = {
                id: docSnap.id,
                ...data,
                createdAt: data.createdAt?.toDate?.().toISOString() || data.createdAt || null,
                updatedAt: data.updatedAt?.toDate?.().toISOString() || data.updatedAt || null,
                scheduledAt: data.scheduledAt?.toDate?.().toISOString() || data.scheduledAt || null,
                publishedAt: data.publishedAt?.toDate?.().toISOString() || data.publishedAt || null,
                lastAnalyticsUpdate: data.lastAnalyticsUpdate?.toDate?.().toISOString() || data.lastAnalyticsUpdate || null,
            };

            // Ensure no raw Timestamps remain if they were nested or added later
            // (Though Threads posts currently only have these top-level ones)
            allPosts.push(serializedPost);
        });

        // Manual Pagination (matching Instagram pattern)
        let startIndex = 0;
        if (lastDocId) {
            const index = allPosts.findIndex(p => p.id === lastDocId);
            if (index !== -1) startIndex = index + 1;
        }

        const posts = allPosts.slice(startIndex, startIndex + pageSize);
        const hasMore = startIndex + pageSize < allPosts.length;
        const nextLastDocId = posts.length > 0 ? posts[posts.length - 1].id : null;

        return {
            success: true,
            posts,
            hasMore,
            lastPostId: nextLastDocId
        };

    } catch (error) {
        console.error("Error in getThreadsPosts:", error);
        return { success: false, message: error.message, posts: [], hasMore: false };
    }
}

/**
 * Get aggregate stats for Threads posts
 */
export async function getThreadsPostsStats({ accountId = null } = {}) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;
        const user = await verifyToken(token);

        if (!user) return { success: false, message: "Unauthorized" };

        let constraints = [
            where("userId", "==", user.id),
            where("platform", "==", "threads"),
            where("status", "==", "published")
        ];

        if (accountId && accountId !== "all") {
            constraints.push(where("accountId", "==", accountId));
        }

        const q = query(collection(db, "threads_posts"), ...constraints);
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
            if (data.deleted === 1) return;

            stats.totalPosts++;
            stats.totalLikes += data.metrics?.likes || 0;
            stats.totalReplies += data.metrics?.replies || 0;
        });

        stats.totalEngagement = stats.totalLikes + stats.totalReplies;
        stats.avgEngagement = stats.totalPosts > 0 ? Math.round(stats.totalEngagement / stats.totalPosts) : 0;

        return { success: true, stats };
    } catch (error) {
        console.error("Error in getThreadsPostsStats:", error);
        return { success: false, message: error.message };
    }
}

/**
 * Publish a scheduled Threads post immediately
 */
export async function publishThreadsPostNow(postId) {
    // This would involve calling the Threads API create endpoint
    // similar to createPost.js but for an existing record.
    return { success: false, message: "Not yet implemented" };
}

/**
 * Get all Threads posts for calendar
 */
export async function getAllThreadsCalendarPosts({ startDate, endDate } = {}) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;
        const user = await verifyToken(token);

        if (!user) return { success: false, posts: [] };

        let constraints = [
            where("userId", "==", user.id),
            where("platform", "==", "threads")
        ];

        // Add date range filters if provided
        if (startDate && endDate) {
            constraints.push(where("createdAt", ">=", new Date(startDate)));
            constraints.push(where("createdAt", "<=", new Date(endDate)));
        }

        const q = query(
            collection(db, "threads_posts"),
            ...constraints,
            orderBy("createdAt", "desc")
        );

        const snapshot = await getDocs(q);
        const posts = snapshot.docs.map(doc => {
            const data = doc.data();
            if (data.deleted === 1) return null;

            const date = data.scheduledAt || data.createdAt;

            return {
                id: doc.id,
                ...data,
                scheduledAt: data.scheduledAt?.toDate?.().toISOString() || data.scheduledAt || null,
                createdAt: data.createdAt?.toDate?.().toISOString() || data.createdAt || null,
                updatedAt: data.updatedAt?.toDate?.().toISOString() || data.updatedAt || null,
                publishedAt: data.publishedAt?.toDate?.().toISOString() || data.publishedAt || null,
                status: data.status || "published"
            };
        }).filter(Boolean);

        return { success: true, posts };
    } catch (error) {
        console.error("Error in getAllThreadsCalendarPosts:", error);
        return { success: false, posts: [] };
    }
}
/**
 * Delete a Threads post (Soft Delete)
 */
export async function deleteThreadsPost(postId) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;
        const user = await verifyToken(token);

        if (!user) {
            return { success: false, message: "Unauthorized" };
        }

        const postRef = doc(db, "threads_posts", postId);
        const postSnap = await getDoc(postRef);

        if (!postSnap.exists()) {
            return { success: false, message: "Post not found" };
        }

        if (postSnap.data().userId !== user.id) {
            return { success: false, message: "Unauthorized" };
        }

        // Soft delete
        await updateDoc(postRef, {
            deleted: 1,
            updatedAt: serverTimestamp()
        });

        revalidatePath("/admin/social/threads/posts");

        return { success: true, message: "Post deleted successfully" };
    } catch (error) {
        console.error("Error deleting Threads post:", error);
        return { success: false, message: error.message };
    }
}
