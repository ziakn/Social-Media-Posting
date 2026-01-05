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
import { getAbsoluteUrl, getTestUrl, needsTestUrl } from "./mediaUtils";

/**
 * Make request to Threads Graph API (Helper)
 */
async function makeThreadsRequest(endpoint, params, accessToken, method = "POST") {
    const url = new URL(`https://graph.threads.net/v1.0${endpoint}`);

    let body = null;
    if (method === "POST") {
        body = new URLSearchParams({
            access_token: accessToken,
            ...params
        });
    } else {
        url.search = new URLSearchParams({
            access_token: accessToken,
            ...params
        }).toString();
    }

    const response = await fetch(url.toString(), {
        method,
        body,
    });

    const data = await response.json();
    if (!response.ok) {
        console.error("Threads API error:", data);
        throw new Error(data.error?.message || "Threads API error");
    }
    return data;
}

/**
 * Get authenticated user (Helper)
 */
async function getAuthenticatedUser() {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    const user = await verifyToken(token);

    if (!user) {
        throw new Error("Invalid or expired token. Please log in again.");
    }

    return user;
}

/**
 * Get Threads account info (Helper)
 */
async function getThreadsAccount(userId, platformUserId) {
    const q = query(
        collection(db, "socialAccounts"),
        where("userId", "==", userId),
        where("accountId", "==", platformUserId),
        where("platform", "==", "threads"),
        where("status", "==", "active")
    );
    const snapshot = await getDocs(q);
    if (snapshot.empty) throw new Error("Threads account not found or inactive");

    const account = snapshot.docs[0].data();
    return { accountId: account.accountId, accessToken: account.accessToken };
}

/**
 * Check Threads Media Container Status (Helper)
 */
async function checkThreadStatus(containerId, accessToken) {
    const data = await makeThreadsRequest(`/${containerId}`, {
        fields: "status,error_message"
    }, accessToken, "GET");
    return data;
}

/**
 * Publish a scheduled Threads post immediately
 */
export async function publishThreadsPostNow(postId) {
    try {
        const user = await getAuthenticatedUser();

        // 1. Get post from Firestore
        const postRef = doc(db, "threads_posts", postId);
        const postSnap = await getDoc(postRef);

        if (!postSnap.exists()) {
            return { success: false, message: "Post not found" };
        }

        const post = postSnap.data();

        if (post.userId !== user.id) {
            return { success: false, message: "Unauthorized" };
        }

        // 2. Get Threads credentials
        const { accountId, accessToken } = await getThreadsAccount(user.id, post.accountId);

        // 3. Re-create media containers (Tokens expire, so we treat it as new)
        const content = post.content || {};
        const media = content.media || [];
        const text = content.text || post.message || "";
        const linkAttachment = content.linkAttachment;

        let threadsPostId = null;
        let creationId = null;

        // Determine if it's a carousel (2-20 items)
        if (media.length > 1) {
            // 3a. Create individual media containers
            const childIds = [];
            for (let i = 0; i < media.length; i++) {
                const item = media[i];
                const mediaUrl = needsTestUrl(item.url) ? getTestUrl(item.type, i) : getAbsoluteUrl(item.url);

                const childParams = {
                    is_carousel_item: true,
                    media_type: item.type?.toUpperCase() || "IMAGE",
                };
                if (childParams.media_type === "IMAGE") childParams.image_url = mediaUrl;
                if (childParams.media_type === "VIDEO") childParams.video_url = mediaUrl;

                const childContainer = await makeThreadsRequest(`/${accountId}/threads`, childParams, accessToken);
                childIds.push(childContainer.id);
            }

            // Poll for all children to be ready
            for (const childId of childIds) {
                let attempts = 0;
                while (attempts < 20) {
                    await new Promise(r => setTimeout(r, 2000));
                    const status = await checkThreadStatus(childId, accessToken);

                    if (status.status === 'FINISHED') break;
                    if (status.status === 'ERROR') {
                        throw new Error(`Thread child media error: ${status.error_message || 'Unknown Error'}`);
                    }
                    attempts++;
                }
            }

            // 3b. Create carousel container
            const carouselParams = {
                media_type: "CAROUSEL",
                children: childIds.join(","),
            };
            if (text) carouselParams.text = text;

            const carouselContainer = await makeThreadsRequest(`/${accountId}/threads`, carouselParams, accessToken);
            creationId = carouselContainer.id;
        } else {
            // Single post (Text, Image, or Video)
            const params = {};

            if (media.length === 1) {
                const item = media[0];
                const mediaUrl = needsTestUrl(item.url) ? getTestUrl(item.type) : getAbsoluteUrl(item.url);

                params.media_type = item.type?.toUpperCase() || "IMAGE";
                if (params.media_type === "IMAGE") params.image_url = mediaUrl;
                if (params.media_type === "VIDEO") params.video_url = mediaUrl;
            } else {
                params.media_type = "TEXT";
            }

            if (text) params.text = text;
            if (params.media_type === "TEXT" && linkAttachment) params.link_attachment = linkAttachment;

            const container = await makeThreadsRequest(`/${accountId}/threads`, params, accessToken);
            creationId = container.id;
        }

        // 4. Poll for container readiness
        if (media.length > 0) {
            let attempts = 0;
            const maxAttempts = 30; // Wait up to 60-90s
            while (attempts < maxAttempts) {
                await new Promise(r => setTimeout(r, 3000));
                const status = await checkThreadStatus(creationId, accessToken);
                console.log(`Container ${creationId} status: ${status.status}`);

                if (status.status === 'FINISHED') break;
                if (status.status === 'ERROR') {
                    throw new Error(`Threads media error: ${status.error_message || 'Unknown Error'}`);
                }
                attempts++;
            }
        }

        // 4. Publish container
        const publishResult = await makeThreadsRequest(`/${accountId}/threads_publish`, {
            creation_id: creationId
        }, accessToken);
        threadsPostId = publishResult.id;

        // 5. Update Firestore
        await updateDoc(postRef, {
            status: "published",
            threadsCreationId: creationId,
            threadsPostId: threadsPostId,
            publishedAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            // Remove scheduling fields if present, or update them to reflect published reality
            scheduledAt: serverTimestamp()
        });

        revalidatePath("/admin/social/threads/posts");

        return { success: true, message: "Thread published successfully", threadsPostId };

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

            const displayDate = data.scheduledAt || data.publishedAt || data.createdAt;
            return {
                id: doc.id,
                ...data,
                scheduledAt: displayDate?.toDate?.().toISOString() || displayDate || null,
                createdAt: data.createdAt?.toDate?.().toISOString() || data.createdAt || null,
                updatedAt: data.updatedAt?.toDate?.().toISOString() || data.updatedAt || null,
                publishedAt: data.publishedAt?.toDate?.().toISOString() || data.publishedAt || null,
                lastAnalyticsUpdate: data.lastAnalyticsUpdate?.toDate?.().toISOString() || data.lastAnalyticsUpdate || null,
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
        revalidatePath("/admin/social/threads/posts");

        return { success: true, message: "Post updated successfully" };
    } catch (error) {
        console.error("Error updating Threads post:", error);
        return { success: false, message: error.message };
    }
}
