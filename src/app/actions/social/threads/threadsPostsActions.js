// app/actions/social/threads/threadsPostsActions.js
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
import { serializeTimestamp } from "@/lib/utils";
import { decrementUsage } from "../../usage/decrementUsage";
import { syncPostJob, removePostJob } from "@/lib/queue/queues";


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
        const user = await verifyToken();

        if (!user) {
            return { success: false, message: "Unauthorized", posts: [], hasMore: false };
        }

        let constraints = [
            where("userId", "==", user.id),
            where("platform", "==", "threads"),
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

        // Date range filters (Note: Only one field can have inequalities in Firestore)
        // If sorting by createdAt, we can range on it.
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
            const lastDocRef = doc(db, "threads_posts", lastDocId);
            const lastDocSnap = await getDoc(lastDocRef);
            if (lastDocSnap.exists()) {
                constraints.push(startAfter(lastDocSnap));
            }
        }

        // Limit the window for scalability (allow more for search/deleted filtering)
        const fetchLimit = filters.searchQuery ? pageSize * 10 : pageSize * 2;
        constraints.push(limit(fetchLimit));

        const q = query(collection(db, "threads_posts"), ...constraints);
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
                    createdAt: serializeTimestamp(data.createdAt),
                    updatedAt: serializeTimestamp(data.updatedAt),
                    scheduledAt: serializeTimestamp(data.scheduledAt),
                    publishedAt: serializeTimestamp(data.publishedAt),
                    lastAnalyticsUpdate: serializeTimestamp(data.lastAnalyticsUpdate),
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
        console.error("Error in getThreadsPosts:", error);
        return { success: false, message: error.message, posts: [], hasMore: false };
    }
}

/**
 * Get aggregate stats for Threads posts
 */
export async function getThreadsPostsStats({ accountId = null } = {}) {
    try {
        const user = await verifyToken();

        if (!user) return { success: false, message: "Unauthorized" };

        let constraints = [
            where("userId", "==", user.id),
            where("platform", "==", "threads"),
            where("status", "==", "published"),
            where("delete", "==", 0)
        ];

        if (accountId && accountId !== "all") {
            constraints.push(where("accountId", "==", accountId));
        }

        // Limit to 2000 posts for stats to prevent massive fetches. 
        // For larger scales, an aggregation document strategy is recommended.
        constraints.push(limit(2000));
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

export async function publishThreadsPostNow(postId) {
    try {
        const user = await verifyToken();
        if (!user) return { success: false, message: "Unauthorized" };

        const postRef = doc(db, "threads_posts", postId);
        const postSnap = await getDoc(postRef);
        if (!postSnap.exists()) return { success: false, message: "Post not found" };

        const post = postSnap.data();
        if (post.userId !== user.id) return { success: false, message: "Unauthorized" };

        // 2. Update Firestore for immediate processing
        const updates = {
            status: "scheduled",
            scheduledAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        };
        await updateDoc(postRef, updates);

        // 3. Sync with Queue
        await syncPostJob("threads", postId, {
            postId,
            userId: user.id,
            userEmail: user.email,
            pageId: post.accountId
        }, { delay: 0 });

        revalidatePath("/portal/social/threads/posts");
        return { success: true, message: "Publication queued for immediate processing." };

    } catch (error) {
        console.error("Error publishing Threads post now:", error);
        return { success: false, message: error.message };
    }
}

/**
 * Get all Threads posts for calendar
 */
export async function getAllThreadsCalendarPosts({ startDate, endDate } = {}) {
    try {
        const user = await verifyToken();

        if (!user) return { success: false, posts: [] };

        let constraints = [
            where("userId", "==", user.id),
            where("platform", "==", "threads"),
            where("delete", "==", 0)
        ];

        // Add date range filters if provided
        if (startDate && endDate) {
            constraints.push(where("createdAt", ">=", new Date(startDate)));
            constraints.push(where("createdAt", "<=", new Date(endDate)));
        }

        const q = query(
            collection(db, "threads_posts"),
            ...constraints,
            orderBy("createdAt", "desc"),
            limit(1000) // Safety limit for calendar view
        );

        const snapshot = await getDocs(q);
        const posts = snapshot.docs.map(doc => {
            const data = doc.data();

            return {
                id: doc.id,
                ...data,
                scheduledAt: serializeTimestamp(data.scheduledAt || data.publishedAt || data.createdAt),
                createdAt: serializeTimestamp(data.createdAt),
                updatedAt: serializeTimestamp(data.updatedAt),
                publishedAt: serializeTimestamp(data.publishedAt),
                lastAnalyticsUpdate: serializeTimestamp(data.lastAnalyticsUpdate),
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
        const user = await verifyToken();

        if (!user) {
            return { success: false, message: "Unauthorized" };
        }

        const postRef = doc(db, "threads_posts", postId);
        const postSnap = await getDoc(postRef);

        if (!postSnap.exists()) {
            return { success: false, message: "Post not found" };
        }

        const postData = postSnap.data();
        if (postData.userId !== user.id) {
            return { success: false, message: "Unauthorized" };
        }

        // Quota Restore (if scheduled)
        if (postData.status === "scheduled") {
            await decrementUsage(user.id);
        }

        // Soft delete
        await updateDoc(postRef, {
            delete: 1,
            updatedAt: serverTimestamp()
        });

        // 5. Queue Cleanup
        await removePostJob("threads", postId);

        revalidatePath("/portal/social/threads/posts");

        return { success: true, message: "Post deleted successfully" };
    } catch (error) {
        console.error("Error deleting Threads post:", error);
        return { success: false, message: error.message };
    }
}

/**
 * Update a scheduled Threads post
 */
export async function updateThreadsPost({
    postId,
    text,
    media,
    scheduling,
    accountId
}) {
    try {
        const user = await verifyToken();

        if (!user) {
            return { success: false, message: "Unauthorized" };
        }

        const postRef = doc(db, "threads_posts", postId);
        const postSnap = await getDoc(postRef);

        if (!postSnap.exists()) {
            return { success: false, message: "Post not found" };
        }

        const postData = postSnap.data();
        if (postData.userId !== user.id) {
            return { success: false, message: "Unauthorized" };
        }

        if (postData.status === "published") {
            return { success: false, message: "Cannot edit published posts" };
        }

        const updates = {
            content: { text, media },
            accountId, // Allow changing account if needed, or keep same
            updatedAt: serverTimestamp()
        };

        if (scheduling) {
            updates.scheduledAt = scheduling;
            updates.status = "scheduled";
        }

        await updateDoc(postRef, updates);

        // 4. Sync with Queue
        const effectiveScheduledAt = updates.scheduledAt || postData.scheduledAt;
        const delay = effectiveScheduledAt ? Math.max(0, new Date(effectiveScheduledAt).getTime() - Date.now()) : 0;

        await syncPostJob("threads", postId, {
            postId,
            userId: user.id,
            userEmail: user.email,
            pageId: updates.accountId || postData.accountId
        }, { delay });

        revalidatePath("/portal/social/threads/posts");

        return { success: true, message: "Post updated successfully" };
    } catch (error) {
        console.error("Error updating Threads post:", error);
        return { success: false, message: error.message };
    }
}
