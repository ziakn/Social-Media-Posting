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
    deleteDoc,
    doc,
    getCountFromServer,
    Timestamp,
    serverTimestamp
} from "firebase/firestore";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { refreshTwitterToken } from "./tokenRefresh";
import { handleTwitterMediaUpload } from "./createPost";

/**
 * Helper to handle Twitter API responses and errors
 */
async function handleTwitterResponse(res, context = "Twitter API") {
    if (res.status === 204) return { success: true }; // No content usually means success for DELETE

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
        let message = data.errors?.[0]?.message || data.detail || `Failed to ${context}`;

        if (res.status === 429) {
            const resetTime = res.headers.get("x-rate-limit-reset");
            if (resetTime) {
                const date = new Date(parseInt(resetTime) * 1000);
                const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                message = `Twitter rate limit exceeded. You can try again after ${timeString}.`;
            }
        }

        const error = new Error(message);
        error.status = res.status;
        error.data = data;
        throw error;
    }

    return data;
}

/**
 * Fetch connected Twitter accounts for the current user
 */
export async function getUserTwitterAccounts() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;
        const user = await verifyToken(token);

        if (!user) {
            return { success: false, message: "Invalid or expired token" };
        }

        // Fetch from socialAccounts collection
        const q = query(
            collection(db, "socialAccounts"),
            where("userId", "==", user.id),
            where("platform", "==", "twitter"),
            where("status", "==", "active")
        );

        const snapshot = await getDocs(q);
        const accounts = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                tokenExpiresAt: data.tokenExpiresAt?.toDate?.().toISOString() || null,
                updatedAt: data.updatedAt?.toDate?.().toISOString() || null,
                createdAt: data.createdAt?.toDate?.().toISOString() || null
            };
        });

        return { success: true, accounts };
    } catch (error) {
        console.error("Error fetching Twitter accounts:", error);
        return { success: false, message: "Failed to fetch Twitter accounts" };
    }
}

/**
 * Fetch published tweets with filtering, sorting, and pagination
 */
export async function getTwitterPublishedPosts({
    pageSize = 12,
    lastDocId = null,
    filters = {},
    sortBy = "newest"
} = {}) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;
        const user = await verifyToken(token);

        if (!user) {
            return { success: false, message: "Invalid or expired token" };
        }

        let constraints = [
            where("userId", "==", user.id),
            where("status", "==", "posted")
        ];

        // Apply filters
        if (filters.accountId && filters.accountId !== "all") {
            constraints.push(where("accountId", "==", filters.accountId));
        }

        // Server-side postType filtering
        // Note: This assumes 'postType' field exists on the document.
        // If data is inconsistent (legacy posts), this might exclude valid posts.
        if (filters.postType && filters.postType !== "all") {
            constraints.push(where("postType", "==", filters.postType));
        }

        if (filters.startDate) {
            const startDate = new Date(filters.startDate);
            constraints.push(where("createdAt", ">=", Timestamp.fromDate(startDate)));
        }

        if (filters.endDate) {
            const endDate = new Date(filters.endDate);
            // Set to end of day
            endDate.setHours(23, 59, 59, 999);
            constraints.push(where("createdAt", "<=", Timestamp.fromDate(endDate)));
        }

        // Apply sorting
        if (sortBy === "oldest") {
            constraints.push(orderBy("createdAt", "asc"));
        } else {
            constraints.push(orderBy("createdAt", "desc"));
        }

        // Build main query
        const postsCollection = collection(db, "twitter_posts");

        // Calculate statistics (count) for the current filter set
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

            // Normalize post type logic for display (fallback)
            let postType = data.postType || "text";
            if (!data.postType && data.mediaUrls?.length > 0) {
                const type = data.mediaUrls[0].type;
                if (type === "image") postType = "image";
                else if (type === "video") postType = "video";
            }

            return {
                id: doc.id,
                ...data,
                postType,
                createdAt: data.createdAt?.toDate?.().toISOString() || data.createdAt?.toISOString?.() || null,
                updatedAt: data.updatedAt?.toDate?.().toISOString() || data.updatedAt?.toISOString?.() || null,
                scheduledAt: data.scheduledAt?.toDate?.().toISOString() || data.scheduledAt?.toISOString?.() || data.scheduledAt || null,
                publishedAt: data.publishedAt?.toDate?.().toISOString() || data.publishedAt?.toISOString?.() || data.publishedAt || null,
                lastAnalyticsUpdate: data.lastAnalyticsUpdate?.toDate?.().toISOString() || data.lastAnalyticsUpdate?.toISOString?.() || null,
                tokenExpiresAt: data.tokenExpiresAt?.toDate?.().toISOString() || data.tokenExpiresAt?.toISOString?.() || null,
                deleted: data.deleted || 0
            };
        });

        const statistics = {
            totalPosts: totalCount,
            totalLikes: 0,
            totalRetweets: 0
        };

        // Filter out deleted posts in memory for legacy support
        const activePosts = posts.filter(p => p.deleted !== 1);

        return {
            success: true,
            posts: activePosts,
            pagination: {
                hasMore: posts.length === pageSize,
                lastVisible: snapshot.docs[snapshot.docs.length - 1]?.id || null,
                total: totalCount
            },
            statistics
        };
    } catch (err) {
        console.error("Error fetching Twitter published posts:", err);
        return { success: false, message: err.message };
    }
}

/**
 * Fetch scheduled tweets for the current user with filtering, sorting, and pagination
 */
export async function getTwitterScheduledPosts({
    pageSize = 12,
    lastDocId = null,
    filters = {},
    sortBy = "newest"
} = {}) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;
        const user = await verifyToken(token);

        if (!user) {
            return { success: false, message: "Invalid or expired token" };
        }

        let constraints = [
            where("userId", "==", user.id),
            where("status", "==", "scheduled")
        ];

        // Apply filters
        if (filters.accountId && filters.accountId !== "all") {
            constraints.push(where("accountId", "==", filters.accountId));
        }

        if (filters.postType && filters.postType !== "all") {
            // Support both "image" and "images" for robustness
            if (filters.postType === "image") {
                // Since Firestore doesn't support 'in' with range filters, 
                // we'll assume new posts use "image" and legacy might use "images".
                // For simplicity, we'll try to match "image" or "images" if we can,
                // but since we only have one where field, we'll just use the filter value.
                constraints.push(where("postType", "==", "image"));
            } else {
                constraints.push(where("postType", "==", filters.postType));
            }
        }

        if (filters.startDate) {
            const startDate = new Date(filters.startDate);
            constraints.push(where("createdAt", ">=", Timestamp.fromDate(startDate)));
        }

        // Apply sorting
        if (sortBy === "oldest") {
            constraints.push(orderBy("scheduledAt", "asc"));
        } else {
            constraints.push(orderBy("scheduledAt", "desc"));
        }

        const postsCollection = collection(db, "twitter_posts");

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
            let postType = data.postType || "text";
            // Normalize "images" to "image" for UI consistency
            if (postType === "images") postType = "image";

            return {
                id: doc.id,
                ...data,
                postType,
                createdAt: data.createdAt?.toDate?.().toISOString() || data.createdAt?.toISOString?.() || null,
                updatedAt: data.updatedAt?.toDate?.().toISOString() || data.updatedAt?.toISOString?.() || null,
                scheduledAt: data.scheduledAt?.toDate?.().toISOString() || data.scheduledAt?.toISOString?.() || data.scheduledAt || null,
                publishedAt: data.publishedAt?.toDate?.().toISOString() || data.publishedAt?.toISOString?.() || data.publishedAt || null,
                tokenExpiresAt: data.tokenExpiresAt?.toDate?.().toISOString() || data.tokenExpiresAt?.toISOString?.() || null,
                deleted: data.deleted || 0
            };
        });

        // Filter out deleted posts in memory
        const activePosts = posts.filter(p => p.deleted !== 1);

        return {
            success: true,
            posts: activePosts,
            pagination: {
                hasMore: posts.length === pageSize,
                lastVisible: snapshot.docs[snapshot.docs.length - 1]?.id || null
            }
        };
    } catch (err) {
        console.error("Error fetching Twitter scheduled posts:", err);
        return { success: false, message: err.message };
    }
}

/**
 * Delete a Twitter post (Soft delete + API deletion for published posts)
 */
export async function deleteTwitterPost(postId) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;
        const user = await verifyToken(token);

        if (!user) {
            return { success: false, message: "Invalid or expired token" };
        }

        const postRef = doc(db, "twitter_posts", postId);
        const postSnap = await getDoc(postRef);

        if (!postSnap.exists()) {
            return { success: false, message: "Post not found" };
        }

        const postData = postSnap.data();
        if (postData.userId !== user.id) {
            return { success: false, message: "Unauthorized" };
        }

        // 1. Delete from Twitter API if published
        if (postData.status === "posted" && postData.twitterPostId && postData.accountId) {
            try {
                console.log(`[Twitter] Attempting to delete tweet: ${postData.twitterPostId}`);

                // Get Account for tokens
                const accountSnap = await getDoc(doc(db, "socialAccounts", postData.accountId));
                if (!accountSnap.exists()) {
                    return { success: false, message: "Twitter account not found" };
                }

                const accountData = accountSnap.data();
                let accessToken = accountData.accessToken;
                const refreshToken = accountData.refreshToken;

                // Check if token needs refresh before attempting delete
                const isExpired = accountData.tokenExpiresAt && (accountData.tokenExpiresAt.toDate().getTime() < Date.now() + 5 * 60 * 1000);
                if (isExpired && refreshToken) {
                    console.log("[Twitter] Token likely expired, refreshing before delete...");
                    const refreshResult = await refreshTwitterToken(postData.accountId, refreshToken);
                    accessToken = refreshResult.access_token;
                }

                const performDelete = async (token) => {
                    const res = await fetch(`https://api.twitter.com/2/tweets/${postData.twitterPostId}`, {
                        method: "DELETE",
                        headers: {
                            "Authorization": `Bearer ${token}`,
                        },
                    });
                    return await handleTwitterResponse(res, "delete tweet");
                };

                try {
                    await performDelete(accessToken);
                    console.log("[Twitter] Successfully deleted tweet from API");
                } catch (error) {
                    // Handle 401 Unauthorized (Expired Token) - retry once
                    if (error.status === 401 && refreshToken) {
                        console.log("[Twitter] Token expired during delete, refreshing and retrying...");
                        const refreshResult = await refreshTwitterToken(postData.accountId, refreshToken);
                        await performDelete(refreshResult.access_token);
                        console.log("[Twitter] Successfully deleted tweet after token refresh");
                    } else {
                        // Return error to user instead of silently continuing
                        console.error("[Twitter] API Delete Error:", error);
                        return {
                            success: false,
                            message: `Failed to delete tweet from Twitter: ${error.message}`
                        };
                    }
                }
            } catch (apiError) {
                console.error("[Twitter] API Delete Error:", apiError);
                return {
                    success: false,
                    message: `Failed to delete tweet from Twitter: ${apiError.message}`
                };
            }
        }

        // 2. Soft delete in Firestore
        await updateDoc(postRef, {
            deleted: 1,
            updatedAt: new Date()
        });

        revalidatePath("/admin/twitter/published");
        revalidatePath("/admin/twitter/scheduled");

        return { success: true, message: "Post deleted successfully" };
    } catch (err) {
        console.error("Error deleting Twitter post:", err);
        return { success: false, message: err.message || "Failed to delete post" };
    }
}

/**
 * Update Twitter post message
 * For published posts: implements delete-then-repost strategy
 * For scheduled posts: updates Firestore only
 */
export async function updateTwitterPost(postId, message) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;
        const user = await verifyToken(token);

        if (!user) {
            return { success: false, message: "Invalid or expired token" };
        }

        const postRef = doc(db, "twitter_posts", postId);
        const postSnap = await getDoc(postRef);

        if (!postSnap.exists()) {
            return { success: false, message: "Post not found" };
        }

        const postData = postSnap.data();
        if (postData.userId !== user.id) {
            return { success: false, message: "Unauthorized" };
        }

        // For scheduled posts, just update Firestore
        if (postData.status === "scheduled") {
            await updateDoc(postRef, {
                message: message,
                updatedAt: new Date()
            });

            revalidatePath("/admin/twitter/scheduled");
            return { success: true, message: "Scheduled post updated successfully" };
        }

        // For published posts: implement delete-then-repost strategy
        // Twitter API v2 doesn't support native editing for most tiers
        if (postData.status === "posted" && postData.twitterPostId && postData.accountId) {
            try {
                console.log(`[Twitter] Implementing edit via delete-then-repost for tweet: ${postData.twitterPostId}`);

                // Get Account for tokens
                const accountSnap = await getDoc(doc(db, "socialAccounts", postData.accountId));
                if (!accountSnap.exists()) {
                    return { success: false, message: "Twitter account not found" };
                }

                const accountData = accountSnap.data();
                let accessToken = accountData.accessToken;
                const refreshToken = accountData.refreshToken;

                // Check if token needs refresh
                const isExpired = accountData.tokenExpiresAt && (accountData.tokenExpiresAt.toDate().getTime() < Date.now() + 5 * 60 * 1000);
                if (isExpired && refreshToken) {
                    console.log("[Twitter] Token likely expired, refreshing before edit...");
                    const refreshResult = await refreshTwitterToken(postData.accountId, refreshToken);
                    accessToken = refreshResult.access_token;
                }

                const performEditViaDeleteRepost = async (token) => {
                    // Step 1: Delete the old tweet
                    console.log("[Twitter] Step 1: Deleting old tweet...");
                    const deleteRes = await fetch(`https://api.twitter.com/2/tweets/${postData.twitterPostId}`, {
                        method: "DELETE",
                        headers: {
                            "Authorization": `Bearer ${token}`,
                        },
                    });
                    await handleTwitterResponse(deleteRes, "delete old tweet");
                    console.log("[Twitter] Old tweet deleted successfully");

                    // Step 2: Create new tweet with updated message and same media
                    console.log("[Twitter] Step 2: Creating new tweet with updated message...");

                    // Prepare the new tweet body
                    let finalMessage = message?.trim() || "";
                    if (postData.link) {
                        finalMessage = finalMessage ? `${finalMessage}\n\n${postData.link}` : postData.link;
                    }

                    // Step 1.5: Re-upload media to get fresh media IDs (Twitter consumes media IDs upon tweet creation)
                    let newMediaIds = [];
                    if (postData.mediaUrls?.length > 0) {
                        console.log(`[Twitter] Re-uploading ${postData.mediaUrls.length} media items...`);
                        for (const media of postData.mediaUrls) {
                            try {
                                const mId = await handleTwitterMediaUpload(media, token);
                                newMediaIds.push(String(mId));
                            } catch (uploadError) {
                                console.error("[Twitter] Media re-upload failed during edit:", uploadError);
                                // Optional: continue or throw? Better to throw so we don't post without media if intended.
                                throw uploadError;
                            }
                        }
                    }

                    const tweetBody = {
                        text: finalMessage,
                        ...(newMediaIds.length > 0 && { media: { media_ids: newMediaIds } })
                    };

                    const createRes = await fetch("https://api.twitter.com/2/tweets", {
                        method: "POST",
                        headers: {
                            "Authorization": `Bearer ${token}`,
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify(tweetBody),
                    });

                    const createData = await handleTwitterResponse(createRes, "create new tweet");
                    console.log("[Twitter] New tweet created successfully with ID:", createData.data.id);

                    return { tweetId: createData.data.id, mediaIds: newMediaIds };
                };

                let newTweetId;
                let currentMediaIds = [];
                try {
                    const result = await performEditViaDeleteRepost(accessToken);
                    newTweetId = result.tweetId;
                    currentMediaIds = result.mediaIds;
                } catch (error) {
                    // Handle 401 Unauthorized (Expired Token) - retry once
                    if (error.status === 401 && refreshToken) {
                        console.log("[Twitter] Token expired during edit, refreshing and retrying...");
                        const refreshResult = await refreshTwitterToken(postData.accountId, refreshToken);
                        const result = await performEditViaDeleteRepost(refreshResult.access_token);
                        newTweetId = result.tweetId;
                        currentMediaIds = result.mediaIds;
                    } else {
                        throw error;
                    }
                }

                // Step 3: Update Firestore with new tweet ID and message
                await updateDoc(postRef, {
                    message: message,
                    twitterPostId: newTweetId,
                    mediaIds: currentMediaIds || [], // Store new IDs
                    updatedAt: new Date()
                });

                revalidatePath("/admin/twitter/published");
                return {
                    success: true,
                    message: "Tweet updated successfully (deleted and reposted with new content)"
                };

            } catch (apiError) {
                console.error("[Twitter] API Edit Error:", apiError);
                return {
                    success: false,
                    message: `Failed to update tweet on Twitter: ${apiError.message}`
                };
            }
        }

        // Fallback: just update Firestore if no Twitter API interaction needed
        await updateDoc(postRef, {
            message: message,
            updatedAt: new Date()
        });

        revalidatePath("/admin/twitter/published");
        revalidatePath("/admin/twitter/scheduled");

        return { success: true, message: "Post updated successfully" };
    } catch (err) {
        console.error("Error updating Twitter post:", err);
        return { success: false, message: err.message || "Failed to update post" };
    }
}

/**
 * Update Twitter post schedule
 */
export async function updateTwitterPostSchedule(postId, scheduledAt) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;
        const user = await verifyToken(token);

        if (!user) {
            return { success: false, message: "Invalid or expired token" };
        }

        const postRef = doc(db, "twitter_posts", postId);
        const postSnap = await getDoc(postRef);

        if (!postSnap.exists()) {
            return { success: false, message: "Post not found" };
        }

        if (postSnap.data().userId !== user.id) {
            return { success: false, message: "Unauthorized" };
        }

        await updateDoc(postRef, {
            scheduledAt: new Date(scheduledAt),
            updatedAt: new Date(),
            status: 'scheduled'
        });

        revalidatePath("/admin/twitter/scheduled");

        return { success: true, message: "Post schedule updated successfully" };
    } catch (err) {
        console.error("Error updating Twitter post schedule:", err);
        return { success: false, message: err.message };
    }
}

/**
 * Fetch tweets for calendar view (both published and scheduled)
 */
export async function getAllTwitterCalendarPosts({ startDate, endDate }) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;
        const user = await verifyToken(token);

        if (!user) {
            return { success: false, message: "Invalid or expired token" };
        }

        const startTimestamp = Timestamp.fromDate(new Date(startDate));
        const endTimestamp = Timestamp.fromDate(new Date(endDate));

        // Query for scheduled posts in range
        const scheduledQuery = query(
            collection(db, "twitter_posts"),
            where("userId", "==", user.id),
            where("status", "==", "scheduled"),
            where("scheduledAt", ">=", startTimestamp),
            where("scheduledAt", "<=", endTimestamp)
        );

        // Query for published posts in range
        const publishedQuery = query(
            collection(db, "twitter_posts"),
            where("userId", "==", user.id),
            where("status", "==", "posted"),
            where("createdAt", ">=", startTimestamp),
            where("createdAt", "<=", endTimestamp)
        );

        const [scheduledSnap, publishedSnap] = await Promise.all([
            getDocs(scheduledQuery),
            getDocs(publishedQuery)
        ]);

        const scheduledPosts = scheduledSnap.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            scheduledAt: doc.data().scheduledAt?.toDate?.().toISOString() || null,
            createdAt: doc.data().createdAt?.toDate?.().toISOString() || null,
            updatedAt: doc.data().updatedAt?.toDate?.().toISOString() || null,
            tokenExpiresAt: doc.data().tokenExpiresAt?.toDate?.().toISOString() || null,
        }));

        const publishedPosts = publishedSnap.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            scheduledAt: doc.data().scheduledAt?.toDate?.().toISOString() || null,
            createdAt: doc.data().createdAt?.toDate?.().toISOString() || null,
            updatedAt: doc.data().updatedAt?.toDate?.().toISOString() || null,
            tokenExpiresAt: doc.data().tokenExpiresAt?.toDate?.().toISOString() || null,
        }));

        const allPosts = [...scheduledPosts, ...publishedPosts]
            .filter(p => p.deleted !== 1)
            .sort((a, b) => {
                const dateA = new Date(a.scheduledAt || a.createdAt);
                const dateB = new Date(b.scheduledAt || b.createdAt);
                return dateA - dateB;
            });

        return { success: true, posts: allPosts };
    } catch (error) {
        console.error("Error fetching calendar tweets:", error);
        return { success: false, message: "Failed to fetch calendar tweets" };
    }
}

/**
 * Publishes a scheduled tweet immediately
 */
export async function publishTwitterPostNow(postId) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;
        const user = await verifyToken(token);

        if (!user) {
            return { success: false, message: "Invalid or expired token" };
        }

        const postRef = doc(db, "twitter_posts", postId);
        const postSnap = await getDoc(postRef);

        if (!postSnap.exists()) {
            return { success: false, message: "Post not found" };
        }

        const postData = postSnap.data();
        if (postData.userId !== user.id) {
            return { success: false, message: "Unauthorized" };
        }

        // Get Account
        const accountSnap = await getDoc(doc(db, "socialAccounts", postData.accountId));
        if (!accountSnap.exists()) {
            return { success: false, message: "Twitter account not found" };
        }

        const accountData = accountSnap.data();
        let accessToken = accountData.accessToken;
        const refreshToken = accountData.refreshToken;

        // Check token
        const isExpired = accountData.tokenExpiresAt && (accountData.tokenExpiresAt.toDate().getTime() < Date.now() + 5 * 60 * 1000);
        if (isExpired && refreshToken) {
            const refreshResult = await refreshTwitterToken(postData.accountId, refreshToken);
            accessToken = refreshResult.access_token;
        }

        // Re-upload media if needed (Twitter requires fresh media IDs for new tweets)
        // Wait, if it was scheduled, did we store mediaIds? Twitter media IDs expire. 
        // Best practice is to re-upload.

        let mediaIds = [];
        if (postData.mediaUrls?.length > 0) {
            console.log(`[Twitter] Re-uploading media for immediate publish...`);
            for (const media of postData.mediaUrls) {
                const mId = await handleTwitterMediaUpload(media, accessToken);
                mediaIds.push(String(mId));
            }
        }

        // Construct Tweet
        let finalMessage = postData.message?.trim() || "";
        if (postData.link) {
            finalMessage = finalMessage ? `${finalMessage}\n\n${postData.link}` : postData.link;
        }

        const tweetBody = {
            text: finalMessage,
            ...(mediaIds.length > 0 && { media: { media_ids: mediaIds } })
        };

        const res = await fetch("https://api.twitter.com/2/tweets", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(tweetBody),
        });

        const data = await handleTwitterResponse(res, "publish tweet now");

        // Update Firestore
        await updateDoc(postRef, {
            status: "posted",
            twitterPostId: data.data.id,
            mediaIds: mediaIds,
            publishedAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });

        revalidatePath("/admin/twitter/published");
        revalidatePath("/admin/twitter/scheduled");

        return { success: true, message: "Tweet published successfully" };

    } catch (error) {
        console.error("Error publishing tweet now:", error);
        return { success: false, message: error.message };
    }
}

/**
 * Unified fetch for Twitter posts (Published & Scheduled)
 */
export async function getTwitterPosts({
    pageSize = 12,
    lastDocId = null,
    filters = {},
    sortBy = "newest"
} = {}) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;
        const user = await verifyToken(token);

        if (!user) {
            return { success: false, message: "Invalid or expired token" };
        }

        let constraints = [
            where("userId", "==", user.id)
        ];

        // Apply filters
        if (filters.accountId && filters.accountId !== "all") {
            constraints.push(where("accountId", "==", filters.accountId));
        }

        if (filters.status && filters.status !== "all") {
            if (filters.status === "published") {
                constraints.push(where("status", "==", "posted"));
            } else if (filters.status === "scheduled") {
                constraints.push(where("status", "==", "scheduled"));
            }
        }

        if (filters.postType && filters.postType !== "all") {
            // Adjust for legacy "images" vs "image" if needed
            if (filters.postType === "image") {
                // We'll trust the query for now, or use "in" if supported but simple equality is safer
                constraints.push(where("postType", "==", "image"));
            } else {
                constraints.push(where("postType", "==", filters.postType));
            }
        }

        if (filters.startDate) {
            const startDate = new Date(filters.startDate);
            constraints.push(where("createdAt", ">=", Timestamp.fromDate(startDate)));
        }

        // Apply sorting
        // Default to createdAt desc
        if (sortBy === "oldest") {
            constraints.push(orderBy("createdAt", "asc"));
        } else {
            constraints.push(orderBy("createdAt", "desc"));
        }

        const postsCollection = collection(db, "twitter_posts");

        // Calculate total count (simplified)
        // Note: This count ignores client-side filters like search and delete, which is an approximation
        const countQuery = query(postsCollection, ...constraints);
        const countSnapshot = await getCountFromServer(countQuery);
        const totalCount = countSnapshot.data().count;

        // Apply pagination
        constraints.push(limit(pageSize * 2)); // Fetch extra for filtering

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
            let postType = data.postType || "text";
            // Normalize
            if (postType === "images") postType = "image";
            if (!data.postType && data.mediaUrls?.length > 0) {
                const type = data.mediaUrls[0].type;
                if (type === "image") postType = "image";
                else if (type === "video") postType = "video";
            }

            return {
                id: doc.id,
                ...data,
                postType,
                createdAt: data.createdAt?.toDate?.().toISOString() || null,
                updatedAt: data.updatedAt?.toDate?.().toISOString() || null,
                publishedAt: data.publishedAt?.toDate?.().toISOString() || null,
                scheduledAt: data.scheduledAt?.toDate ? data.scheduledAt.toDate().toISOString() : (data.scheduledAt || null),
                tokenExpiresAt: data.tokenExpiresAt?.toDate?.().toISOString() || null,
                deleted: data.deleted || 0
            };
        });

        // Fetch Accounts for these posts to display Name/Avatar
        const accountIds = [...new Set(posts.map(p => p.accountId).filter(Boolean))];
        let accountsMap = {};

        if (accountIds.length > 0) {
            // Firestore 'in' query works with chunks of 10 max usually, but let's assume low volume or handle simpler
            // For simplicity/robustness with small number of accounts, fetching all user accounts is often easier/cheaper than multiple batched queries
            // But 'where documentId in [...]' is better.

            // Actually, we can just fetch all "twitter" accounts for this user, we already presumably have them cached in client? 
            // Better to fetch specific ones here to be safe.
            const chunks = [];
            for (let i = 0; i < accountIds.length; i += 10) {
                chunks.push(accountIds.slice(i, i + 10));
            }

            for (const chunk of chunks) {
                const accountsQuery = query(
                    collection(db, "socialAccounts"),
                    where("__name__", "in", chunk)
                );
                const accountsSnap = await getDocs(accountsQuery);
                accountsSnap.docs.forEach(doc => {
                    const d = doc.data();
                    accountsMap[doc.id] = {
                        id: doc.id,
                        name: d.name || d.username || "Twitter User",
                        username: d.username,
                        picture: d.profilePictureUrl || d.picture, // Normalize
                    };
                });
            }
        }

        // Attach account to posts and Filter
        const activePosts = posts.map(p => {
            const account = accountsMap[p.accountId] || {};
            return {
                ...p,
                // Flatten account details for easier access in view components
                name: account.name || account.username || "X User",
                username: account.username || "user",
                profilePicture: account.picture || null,
                account: account // Keep nested object just in case
            };
        }).filter(p => {
            if (p.deleted === 1) return false;
            if (filters.searchQuery) {
                const q = filters.searchQuery.toLowerCase();
                return (p.message || "").toLowerCase().includes(q);
            }
            return true;
        });

        // Slice to page size
        const paginatedPosts = activePosts.slice(0, pageSize);
        const hasMore = activePosts.length > pageSize; // Rough check

        // Stats
        const statistics = {
            totalPosts: totalCount,
            publishedPosts: totalCount, // Placeholder
            totalLikes: 0,
            totalRetweets: 0
        };

        return {
            success: true,
            posts: paginatedPosts,
            pagination: {
                hasMore: hasMore || (snapshot.docs.length === pageSize * 2), // If we fetched full limit, likely more
                lastVisible: paginatedPosts.length > 0 ? paginatedPosts[paginatedPosts.length - 1].id : null,
                total: totalCount
            },
            statistics
        };

    } catch (err) {
        console.error("Error fetching Twitter posts:", err);
        return { success: false, message: err.message };
    }
}
