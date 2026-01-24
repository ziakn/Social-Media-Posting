"use server";

import { db } from "@/lib/firebase";
import {
    collection,
    query,
    where,
    getDocs,
    getDoc,
    updateDoc,
    orderBy,
    limit,
    startAfter,
    doc,
    getCountFromServer,
    Timestamp,
    serverTimestamp
} from "firebase/firestore";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { refreshYoutubeToken } from "./tokenRefresh";

/**
 * Helper to handle YouTube API responses and errors
 */
async function handleYoutubeResponse(res, context = "YouTube API") {
    if (res.status === 204) return { success: true };

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
        let message = data.error?.message || `Failed to ${context}`;
        const error = new Error(message);
        error.status = res.status;
        error.data = data;
        throw error;
    }

    return data;
}

/**
 * Fetch connected YouTube accounts for the current user
 */
export async function getUserYoutubeAccounts() {
    try {
        const user = await verifyToken();

        if (!user) {
            return { success: false, message: "Invalid or expired token" };
        }

        const q = query(
            collection(db, "socialAccounts"),
            where("userId", "==", user.id),
            where("platform", "==", "youtube"),
            where("status", "==", "active")
        );

        const snapshot = await getDocs(q);
        const accounts = snapshot.docs.map(doc => ({
            id: doc.id,
            accountId: doc.id,
            name: doc.data().displayName,
            username: doc.data().username,
            profilePicture: doc.data().profilePicture
        }));

        return { success: true, accounts };
    } catch (error) {
        console.error("Error fetching YouTube accounts:", error);
        return { success: false, message: "Failed to fetch YouTube accounts" };
    }
}

/**
 * Fetch published YouTube posts
 */
export async function getYoutubePublishedPosts({
    pageSize = 12,
    lastDocId = null,
    filters = {},
    sortBy = "newest"
} = {}) {
    try {
        const user = await verifyToken();

        if (!user) {
            return { success: false, message: "Invalid or expired token" };
        }

        let constraints = [
            where("userId", "==", user.id),
            where("status", "==", "posted"),
            where("delete", "==", 0)
        ];

        if (filters.accountId && filters.accountId !== "all") {
            constraints.push(where("accountId", "==", filters.accountId));
        }

        if (filters.startDate) {
            const startDate = new Date(filters.startDate);
            constraints.push(where("createdAt", ">=", Timestamp.fromDate(startDate)));
        }

        // Apply sorting
        if (sortBy === "oldest") {
            constraints.push(orderBy("createdAt", "asc"));
        } else {
            constraints.push(orderBy("createdAt", "desc"));
        }

        const postsCollection = collection(db, "youtube_posts");

        // Count for current filter
        const countQuery = query(postsCollection, ...constraints);
        const countSnapshot = await getCountFromServer(countQuery);
        const totalCount = countSnapshot.data().count;

        // Apply pagination
        constraints.push(limit(pageSize));

        if (lastDocId) {
            const lastDocRef = await getDocs(query(postsCollection, where("__name__", "==", lastDocId)));
            if (!lastDocRef.empty) {
                constraints.push(startAfter(lastDocRef.docs[0]));
            }
        }

        const q = query(postsCollection, ...constraints);
        const snapshot = await getDocs(q);

        const posts = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                createdAt: data.createdAt?.toDate?.().toISOString() || null,
                updatedAt: data.updatedAt?.toDate?.().toISOString() || null,
                scheduledAt: data.scheduledAt?.toDate?.().toISOString() || data.scheduledAt || null,
            };
        });

        return {
            success: true,
            posts,
            pagination: {
                hasMore: posts.length === pageSize,
                lastVisible: snapshot.docs[snapshot.docs.length - 1]?.id || null,
                total: totalCount
            }
        };
    } catch (err) {
        console.error("Error fetching YouTube published posts:", err);
        return { success: false, message: err.message };
    }
}

/**
 * Fetch scheduled YouTube posts
 */
export async function getYoutubeScheduledPosts({
    pageSize = 12,
    lastDocId = null,
    filters = {},
    sortBy = "newest"
} = {}) {
    try {
        const user = await verifyToken();

        if (!user) {
            return { success: false, message: "Invalid or expired token" };
        }

        let constraints = [
            where("userId", "==", user.id),
            where("status", "==", "scheduled"),
            where("delete", "==", 0)
        ];

        if (filters.accountId && filters.accountId !== "all") {
            constraints.push(where("accountId", "==", filters.accountId));
        }

        if (sortBy === "oldest") {
            constraints.push(orderBy("scheduledAt", "asc"));
        } else {
            constraints.push(orderBy("scheduledAt", "desc"));
        }

        const postsCollection = collection(db, "youtube_posts");
        constraints.push(limit(pageSize));

        if (lastDocId) {
            const lastDocRef = await getDocs(query(postsCollection, where("__name__", "==", lastDocId)));
            if (!lastDocRef.empty) {
                constraints.push(startAfter(lastDocRef.docs[0]));
            }
        }

        const q = query(postsCollection, ...constraints);
        const snapshot = await getDocs(q);

        const posts = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                createdAt: data.createdAt?.toDate?.().toISOString() || null,
                updatedAt: data.updatedAt?.toDate?.().toISOString() || null,
                scheduledAt: data.scheduledAt?.toDate?.().toISOString() || data.scheduledAt || null,
            };
        });

        return {
            success: true,
            posts,
            pagination: {
                hasMore: posts.length === pageSize,
                lastVisible: snapshot.docs[snapshot.docs.length - 1]?.id || null
            }
        };
    } catch (err) {
        console.error("Error fetching YouTube scheduled posts:", err);
        return { success: false, message: err.message };
    }
}

/**
 * Delete a YouTube post
 */
export async function deleteYoutubePost(postId) {
    try {
        const user = await verifyToken();

        if (!user) {
            return { success: false, message: "Invalid or expired token" };
        }

        const postRef = doc(db, "youtube_posts", postId);
        const postSnap = await getDoc(postRef);

        if (!postSnap.exists()) {
            return { success: false, message: "Post not found" };
        }

        const postData = postSnap.data();
        if (postData.userId !== user.id) {
            return { success: false, message: "Unauthorized" };
        }

        // If it's already posted, try to delete from YouTube
        if (postData.status === "posted" && postData.videoId && postData.accountId) {
            const accountSnap = await getDoc(doc(db, "socialAccounts", postData.accountId));
            if (accountSnap.exists()) {
                const accountData = accountSnap.data();
                let accessToken = accountData.accessToken;
                const refreshToken = accountData.refreshToken;

                const performDelete = async (token) => {
                    const res = await fetch(`https://www.googleapis.com/youtube/v3/videos?id=${postData.videoId}`, {
                        method: "DELETE",
                        headers: {
                            "Authorization": `Bearer ${token}`,
                        },
                    });
                    return await handleYoutubeResponse(res, "delete video");
                };

                try {
                    await performDelete(accessToken);
                } catch (error) {
                    if (error.status === 401 && refreshToken) {
                        const refreshResult = await refreshYoutubeToken(postData.accountId, refreshToken);
                        await performDelete(refreshResult.access_token);
                    } else {
                        console.error("[YouTube] API Delete Error:", error);
                        // We still proceed with local deletion even if API fails (maybe video was already deleted)
                    }
                }
            }
        }

        // Soft delete in Firestore
        await updateDoc(postRef, {
            delete: 1,
            updatedAt: serverTimestamp()
        });

        revalidatePath("/admin/social/youtube/posts");

        return { success: true, message: "Post deleted successfully" };
    } catch (err) {
        console.error("Error deleting YouTube post:", err);
        return { success: false, message: err.message || "Failed to delete post" };
    }
}

/**
 * Update YouTube post (metadata only)
 */
export async function updateYoutubePost(postId, updates) {
    try {
        const user = await verifyToken();

        if (!user) {
            return { success: false, message: "Invalid or expired token" };
        }

        const postRef = doc(db, "youtube_posts", postId);
        const postSnap = await getDoc(postRef);

        if (!postSnap.exists()) {
            return { success: false, message: "Post not found" };
        }

        const postData = postSnap.data();
        if (postData.userId !== user.id) {
            return { success: false, message: "Unauthorized" };
        }

        // If posted, update on YouTube too
        if (postData.status === "posted" && postData.videoId && postData.accountId) {
            const accountSnap = await getDoc(doc(db, "socialAccounts", postData.accountId));
            if (accountSnap.exists()) {
                const accountData = accountSnap.data();
                let accessToken = accountData.accessToken;
                const refreshToken = accountData.refreshToken;

                const performUpdate = async (token) => {
                    const body = {
                        id: postData.videoId,
                        snippet: {
                            title: updates.title || postData.title,
                            description: updates.description || postData.description,
                            categoryId: postData.categoryId || "22"
                        }
                    };

                    const res = await fetch("https://www.googleapis.com/youtube/v3/videos?part=snippet", {
                        method: "PUT",
                        headers: {
                            "Authorization": `Bearer ${token}`,
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify(body)
                    });
                    return await handleYoutubeResponse(res, "update video");
                };

                try {
                    await performUpdate(accessToken);
                } catch (error) {
                    if (error.status === 401 && refreshToken) {
                        const refreshResult = await refreshYoutubeToken(postData.accountId, refreshToken);
                        await performUpdate(refreshResult.access_token);
                    }
                }
            }
        }

        // Update Firestore
        await updateDoc(postRef, {
            ...updates,
            updatedAt: serverTimestamp()
        });

        revalidatePath("/admin/social/youtube/posts");
        return { success: true, message: "Post updated successfully" };
    } catch (err) {
        console.error("Error updating YouTube post:", err);
        return { success: false, message: err.message || "Failed to update post" };
    }
}

/**
 * Update YouTube post schedule
 */
export async function updateYoutubePostSchedule(postId, scheduledAt) {
    try {
        const user = await verifyToken();

        if (!user) {
            return { success: false, message: "Invalid or expired token" };
        }

        const postRef = doc(db, "youtube_posts", postId);
        const postSnap = await getDoc(postRef);

        if (!postSnap.exists()) {
            return { success: false, message: "Post not found" };
        }

        if (postSnap.data().userId !== user.id) {
            return { success: false, message: "Unauthorized" };
        }

        await updateDoc(postRef, {
            scheduledAt: new Date(scheduledAt),
            updatedAt: serverTimestamp(),
            status: 'scheduled'
        });

        revalidatePath("/admin/social/youtube/posts");

        return { success: true, message: "Post schedule updated successfully" };
    } catch (err) {
        console.error("Error updating YouTube post schedule:", err);
        return { success: false, message: err.message };
    }
}
