// src/app/actions/social/tiktok/tiktokPostsActions.js
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

/**
 * Get all TikTok posts with filtering and pagination
 */
export async function getTiktokPosts({
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
            where("platform", "==", "tiktok"),
            where("delete", "==", 0)
        ];

        if (filters.status && filters.status !== "all") {
            constraints.push(where("status", "==", filters.status));
        }

        if (filters.accountId && filters.accountId !== "all") {
            constraints.push(where("accountId", "==", filters.accountId));
        }

        const orderField = sortBy === "date" ? "createdAt" : sortBy;
        constraints.push(orderBy(orderField, sortOrder));

        if (lastDocId) {
            const lastDocRef = doc(db, "tiktok_posts", lastDocId);
            const lastDocSnap = await getDoc(lastDocRef);
            if (lastDocSnap.exists()) {
                constraints.push(startAfter(lastDocSnap));
            }
        }

        constraints.push(limit(pageSize + 1));

        const q = query(collection(db, "tiktok_posts"), ...constraints);
        const snapshot = await getDocs(q);

        let posts = snapshot.docs.map(docSnap => {
            const data = docSnap.data();
            return {
                id: docSnap.id,
                ...data,
                createdAt: data.createdAt?.toDate?.().toISOString() || data.createdAt || null,
                updatedAt: data.updatedAt?.toDate?.().toISOString() || data.updatedAt || null,
                scheduledAt: data.scheduledAt?.toDate?.().toISOString() || data.scheduledAt || null,
                publishedAt: data.publishedAt?.toDate?.().toISOString() || data.publishedAt || null,
            };
        });

        const hasMore = posts.length > pageSize;
        if (hasMore) posts.pop();

        return {
            success: true,
            posts,
            hasMore,
            lastPostId: snapshot.docs[posts.length - 1]?.id || null
        };
    } catch (error) {
        console.error("Error in getTiktokPosts:", error);
        return { success: false, message: error.message, posts: [], hasMore: false };
    }
}

/**
 * Delete a TikTok post (Soft Delete)
 */
export async function deleteTiktokPost(postId) {
    try {
        const user = await verifyToken();

        if (!user) {
            return { success: false, message: "Unauthorized" };
        }

        const postRef = doc(db, "tiktok_posts", postId);
        const postSnap = await getDoc(postRef);

        if (!postSnap.exists()) {
            return { success: false, message: "Post not found" };
        }

        if (postSnap.data().userId !== user.id) {
            return { success: false, message: "Unauthorized" };
        }

        await updateDoc(postRef, {
            delete: 1,
            updatedAt: serverTimestamp()
        });

        revalidatePath("/admin/social/tiktok/posts");

        return { success: true, message: "Post deleted successfully" };
    } catch (error) {
        console.error("Error deleting TikTok post:", error);
        return { success: false, message: error.message };
    }
}

/**
 * Get aggregate stats for TikTok posts
 */
export async function getTiktokPostsStats({ accountId = null } = {}) {
    try {
        const user = await verifyToken();

        if (!user) return { success: false, message: "Unauthorized" };

        let constraints = [
            where("userId", "==", user.id),
            where("platform", "==", "tiktok"),
            where("status", "==", "published"),
            where("delete", "==", 0)
        ];

        if (accountId && accountId !== "all") {
            constraints.push(where("accountId", "==", accountId));
        }

        const q = query(collection(db, "tiktok_posts"), ...constraints);
        const snapshot = await getDocs(q);

        let stats = {
            totalPosts: snapshot.size,
            totalLikes: 0,
            totalComments: 0,
            totalShares: 0,
            totalViews: 0,
        };

        snapshot.forEach(docSnap => {
            const data = docSnap.data();
            stats.totalLikes += data.metrics?.likes || 0;
            stats.totalComments += data.metrics?.comments || 0;
            stats.totalShares += data.metrics?.shares || 0;
            stats.totalViews += data.metrics?.views || 0;
        });

        return { success: true, stats };
    } catch (error) {
        console.error("Error in getTiktokPostsStats:", error);
        return { success: false, message: error.message };
    }
}

/**
 * Publish a scheduled TikTok post immediately
 */
export async function publishTiktokPostNow(postId) {
    try {
        const user = await verifyToken();

        if (!user) return { success: false, message: "Unauthorized" };

        const postRef = doc(db, "tiktok_posts", postId);
        const postSnap = await getDoc(postRef);

        if (!postSnap.exists()) return { success: false, message: "Post not found" };

        const postData = postSnap.data();
        if (postData.userId !== user.id) return { success: false, message: "Unauthorized" };

        // In a real app, trigger TikTok Content Posting API here
        // For now, we update Firestore status
        await updateDoc(postRef, {
            status: "published",
            publishedAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });

        revalidatePath("/admin/social/tiktok/posts");
        return { success: true, message: "Post published successfully" };
    } catch (error) {
        console.error("Error publishing TikTok post:", error);
        return { success: false, message: error.message };
    }
}

/**
 * Update a scheduled TikTok post
 */
export async function updateTiktokPost({ postId, text, media, scheduling, accountId }) {
    try {
        const user = await verifyToken();

        if (!user) return { success: false, message: "Unauthorized" };

        const postRef = doc(db, "tiktok_posts", postId);
        const postSnap = await getDoc(postRef);

        if (!postSnap.exists()) return { success: false, message: "Post not found" };

        const postData = postSnap.data();
        if (postData.userId !== user.id) return { success: false, message: "Unauthorized" };

        if (postData.status === "published") {
            return { success: false, message: "Cannot edit published posts" };
        }

        const updates = {
            content: { text, media },
            accountId,
            updatedAt: serverTimestamp()
        };

        if (scheduling) {
            updates.scheduledAt = scheduling;
            updates.status = "scheduled";
        } else {
            updates.status = "published";
            updates.publishedAt = serverTimestamp();
        }

        await updateDoc(postRef, updates);
        revalidatePath("/admin/social/tiktok/posts");

        return { success: true, message: "Post updated successfully" };
    } catch (error) {
        console.error("Error updating TikTok post:", error);
        return { success: false, message: error.message };
    }
}

/**
 * Get all TikTok posts for calendar
 */
export async function getAllTiktokCalendarPosts({ startDate, endDate, accountId = "all" } = {}) {
    try {
        const user = await verifyToken();

        if (!user) return { success: false, posts: [] };

        let constraints = [
            where("userId", "==", user.id),
            where("platform", "==", "tiktok"),
            where("delete", "==", 0)
        ];

        if (accountId && accountId !== "all") {
            constraints.push(where("accountId", "==", accountId));
        }

        const q = query(
            collection(db, "tiktok_posts"),
            ...constraints,
            orderBy("createdAt", "desc"),
            limit(500)
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
            };
        });

        return { success: true, posts };
    } catch (error) {
        console.error("Error in getAllTiktokCalendarPosts:", error);
        return { success: false, posts: [] };
    }
}
