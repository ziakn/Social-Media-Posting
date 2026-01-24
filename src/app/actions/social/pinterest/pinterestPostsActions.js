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
import { uploadPinterestVideo } from "./videoUtils";
import { getValidPinterestAccessToken } from "./connectAccount";

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
        const user = await verifyToken();

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
        const user = await verifyToken();

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
    // Proactively refresh token if needed ensure actions don't fail
    const { accessToken } = await getValidPinterestAccessToken(userId, platformUserId);
    return { accessToken };
}

/**
 * Publish a scheduled Pinterest post immediately
 */
export async function publishPinterestPostNow(postId) {
    try {
        const user = await verifyToken();

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

        // Sanitize Link for API compatibility (no localhost)
        let finalLink = post.link || "";
        if (finalLink && (finalLink.includes("localhost") || finalLink.includes("127.0.0.1"))) {
            console.warn("Removing localhost link for Pinterest API compatibility (Scheduled Publish)");
            finalLink = "";
        }

        if (postType === "carousel" && media.length > 1) {
            const items = await Promise.all(media.map(async (item, index) => {
                const mediaUrl = needsTestUrl(item.url) ? getTestUrl("image", index) : await getAbsoluteUrl(item.url);
                return {
                    title: post.title || "",
                    description: post.message || post.description || "",
                    link: finalLink,
                    url: mediaUrl
                };
            }));

            mediaSource = {
                source_type: "multiple_image_urls",
                items: items
            };
        } else if (postType === "video") {
            const item = media[0] || { url: "", type: "video" };

            // Upload Video to Pinterest
            // This process registers, uploads, and waits for processing
            const mediaId = await uploadPinterestVideo(accessToken, item.url);

            // Get Cover Image URL if available (optional but recommended)
            let coverImageUrl = item.coverUrl || null;
            if (coverImageUrl) {
                coverImageUrl = needsTestUrl(coverImageUrl) ? getTestUrl("image") : await getAbsoluteUrl(coverImageUrl);
            }

            mediaSource = {
                source_type: "video_id",
                media_id: mediaId,
                ...(coverImageUrl
                    ? { cover_image_url: coverImageUrl }
                    : { cover_image_key_frame_time: 0 } // Fallback to first frame if no cover image
                )
            };
        } else {
            const item = media[0] || { url: post.imageUrl, type: "image" };
            const mediaUrl = needsTestUrl(item.url) ? getTestUrl(String(item.type).toLowerCase()) : await getAbsoluteUrl(item.url);

            mediaSource = {
                source_type: "image_url",
                url: mediaUrl
            };
        }

        const pinData = {
            board_id: post.boardId,
            title: post.title || "",
            description: post.message || post.description || "",
            // Only include link if it's not empty
            ...(finalLink ? { link: finalLink } : {}),
            media_source: mediaSource
        };

        console.log("Pinterest Scheduled Publish Data:", JSON.stringify(pinData, null, 2));

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
 * Get all Pinterest posts for calendar within a date range
 */
export async function getPinterestCalendarPosts({ startDate, endDate } = {}) {
    try {
        const user = await verifyToken();

        if (!user) return { success: false, posts: [] };

        let constraints = [
            where("userId", "==", user.id),
            where("platform", "==", "pinterest"),
            where("delete", "==", 0)
        ];

        // Add date range filters if provided
        // Note: Similar to Threads, we use the display date logic
        // We filter by createdAt but since we might be looking at scheduled times, 
        // we'll fetch a wider range or just rely on a recent window for now.
        // Actually, let's use scheduledAt if we want to be precise, 
        // but status: 'all' usually works for simple calendars.

        const q = query(
            collection(db, "pinterest_posts"),
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
                createdAt: data.createdAt?.toDate?.().toISOString() || data.createdAt || null,
                updatedAt: data.updatedAt?.toDate?.().toISOString() || data.updatedAt || null,
                scheduledAt: data.scheduledAt?.toDate?.().toISOString() || data.scheduledAt || null,
                publishedAt: data.publishedAt?.toDate?.().toISOString() || data.publishedAt || null,
            };
        });

        // Client-side filtering if needed, or refine Firestore query if field is consistent
        let filteredPosts = posts;
        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            filteredPosts = posts.filter(post => {
                const date = new Date(post.scheduledAt || post.publishedAt || post.createdAt);
                return date >= start && date <= end;
            });
        }

        return { success: true, posts: filteredPosts };
    } catch (error) {
        console.error("Error in getPinterestCalendarPosts:", error);
        return { success: false, posts: [] };
    }
}

/**
 * Delete a Pinterest post (Soft Delete)
 */
export async function deletePinterestPost(postId) {
    try {
        const user = await verifyToken();

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
        const user = await verifyToken();

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
        const user = await verifyToken();

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
