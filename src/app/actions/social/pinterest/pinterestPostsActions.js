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
    serverTimestamp,
    addDoc
} from "firebase/firestore";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { getAbsoluteUrl, getTestUrl, needsTestUrl } from "../threads/mediaUtils";

/**
 * Get authenticated user (Helper)
 */
async function getAuthenticatedUser() {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    const user = await verifyToken(token);

    if (!user) {
        throw new Error("Unauthorized: Please log in again.");
    }

    return user;
}

/**
 * Get Pinterest account info (Helper)
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
    if (snapshot.empty) throw new Error("Pinterest account not found or inactive");

    const account = snapshot.docs[0].data();
    return { accountId: account.accountId, accessToken: account.accessToken };
}

/**
 * Make request to Pinterest API (Helper)
 */
async function makePinterestRequest(endpoint, body, accessToken, method = "POST") {
    const url = `https://api.pinterest.com/v5${endpoint}`;

    const headers = {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
    };

    const options = {
        method,
        headers,
    };

    if (body && (method === "POST" || method === "PATCH" || method === "PUT")) {
        options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);
    const data = await response.json();

    if (!response.ok) {
        console.error("Pinterest API error:", data);
        throw new Error(data.message || "Pinterest API error");
    }
    return data;
}

/**
 * Get all Pinterest posts with status filtering
 */
export async function getPinterestPosts({
    pageSize = 12,
    lastDocId = null,
    filters = {},
    sortBy = "createdAt",
    sortOrder = "desc"
} = {}) {
    try {
        const user = await getAuthenticatedUser();

        let constraints = [
            where("userId", "==", user.id),
            where("platform", "==", "pinterest"),
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
            const lastDocRef = doc(db, "pinterest_posts", lastDocId);
            const lastDocSnap = await getDoc(lastDocRef);
            if (lastDocSnap.exists()) {
                constraints.push(startAfter(lastDocSnap));
            }
        }

        constraints.push(limit(pageSize));

        const q = query(collection(db, "pinterest_posts"), ...constraints);
        const snapshot = await getDocs(q);

        const posts = snapshot.docs.map(docSnap => {
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

        const lastVisibleDoc = snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1].id : null;
        const hasMore = snapshot.docs.length === pageSize;

        return { success: true, posts, hasMore, lastPostId: lastVisibleDoc };
    } catch (error) {
        console.error("Error in getPinterestPosts:", error);
        return { success: false, message: error.message, posts: [], hasMore: false };
    }
}

/**
 * Fetch available boards for a Pinterest account
 */
export async function getPinterestBoards(platformUserId) {
    try {
        const user = await getAuthenticatedUser();
        const { accessToken } = await getPinterestAccount(user.id, platformUserId);

        const data = await makePinterestRequest("/boards", null, accessToken, "GET");
        return { success: true, boards: data.items || [] };
    } catch (error) {
        console.error("Error fetching Pinterest boards:", error);
        return { success: false, message: error.message };
    }
}

/**
 * Publish a Pin now
 */
export async function publishPinterestPostNow(postId) {
    try {
        const user = await getAuthenticatedUser();

        const postRef = doc(db, "pinterest_posts", postId);
        const postSnap = await getDoc(postRef);

        if (!postSnap.exists()) return { success: false, message: "Post not found" };
        const post = postSnap.data();

        if (post.userId !== user.id) return { success: false, message: "Unauthorized" };

        const { accessToken } = await getPinterestAccount(user.id, post.accountId);

        // Prepare Pin data
        const item = post.content?.media?.[0] || { url: post.imageUrl, type: "IMAGE" };
        const mediaUrl = needsTestUrl(item.url) ? getTestUrl(item.type) : getAbsoluteUrl(item.url);

        const pinData = {
            board_id: post.boardId,
            title: post.title || "",
            description: post.message || post.description || "",
            link: post.link || "",
            media_source: {
                source_type: "image_url",
                url: mediaUrl
            }
        };

        const result = await makePinterestRequest("/pins", pinData, accessToken, "POST");

        await updateDoc(postRef, {
            status: "published",
            pinterestPinId: result.id,
            publishedAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            delete: 0
        });

        revalidatePath("/admin/social/pinterest/posts");
        return { success: true, message: "Pin published successfully", pinId: result.id };
    } catch (error) {
        console.error("Error publishing Pinterest Pin:", error);
        return { success: false, message: error.message };
    }
}

/**
 * Delete a Pinterest post (Soft delete)
 */
export async function deletePinterestPost(postId) {
    try {
        const user = await getAuthenticatedUser();
        const postRef = doc(db, "pinterest_posts", postId);
        const postSnap = await getDoc(postRef);

        if (!postSnap.exists()) return { success: false, message: "Post not found" };
        if (postSnap.data().userId !== user.id) return { success: false, message: "Unauthorized" };

        await updateDoc(postRef, {
            delete: 1,
            updatedAt: serverTimestamp()
        });

        revalidatePath("/admin/social/pinterest/posts");
        return { success: true, message: "Post deleted successfully" };
    } catch (error) {
        console.error("Error deleting Pinterest post:", error);
        return { success: false, message: error.message };
    }
}

/**
 * Create or Update a Pinterest post
 */
export async function savePinterestPost({
    postId = null,
    title,
    message,
    link,
    boardId,
    media,
    scheduling,
    accountId,
    status = "draft"
}) {
    try {
        const user = await getAuthenticatedUser();

        const postData = {
            userId: user.id,
            platform: "pinterest",
            accountId,
            boardId,
            title,
            message,
            link,
            content: { media },
            status: scheduling ? "scheduled" : status,
            scheduledAt: scheduling ? new Date(scheduling) : null,
            updatedAt: serverTimestamp(),
            delete: 0
        };

        if (postId) {
            const postRef = doc(db, "pinterest_posts", postId);
            await updateDoc(postRef, postData);
        } else {
            postData.createdAt = serverTimestamp();
            await addDoc(collection(db, "pinterest_posts"), postData);
        }

        revalidatePath("/admin/social/pinterest/posts");
        return { success: true, message: postId ? "Post updated" : "Post created" };
    } catch (error) {
        console.error("Error saving Pinterest post:", error);
        return { success: false, message: error.message };
    }
}

/**
 * Fetch all connected Pinterest accounts for the current user
 */
export async function getPinterestAccounts() {
    try {
        const user = await getAuthenticatedUser();

        const q = query(
            collection(db, "socialAccounts"),
            where("userId", "==", user.id),
            where("platform", "==", "pinterest"),
            where("status", "==", "active")
        );

        const snapshot = await getDocs(q);
        const accounts = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            tokenExpiresAt: doc.data().tokenExpiresAt?.toDate?.().toISOString() || doc.data().tokenExpiresAt,
            createdAt: doc.data().createdAt?.toDate?.().toISOString() || doc.data().createdAt,
        }));

        return { success: true, accounts };

    } catch (error) {
        console.error("Error fetching Pinterest accounts:", error);
        return { success: false, message: error.message };
    }
}
/**
 * Get aggregate stats for Pinterest posts
 */
export async function getPinterestPostsStats({ accountId = null } = {}) {
    try {
        const user = await getAuthenticatedUser();

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
            totalReplies: 0,
            avgEngagement: 0
        };

        snapshot.docs.forEach(docSnap => {
            const data = docSnap.data();
            stats.totalLikes += (data.metrics?.likes || 0);
            stats.totalReplies += (data.metrics?.replies || 0);
        });

        if (stats.totalPosts > 0) {
            stats.avgEngagement = parseFloat(((stats.totalLikes + stats.totalReplies) / stats.totalPosts).toFixed(1));
        }

        return { success: true, stats };
    } catch (error) {
        console.error("Error in getPinterestPostsStats:", error);
        return { success: false, message: error.message };
    }
}

/**
 * Get all Pinterest posts for calendar within date range
 */
export async function getAllPinterestCalendarPosts({ startDate, endDate }) {
    try {
        const user = await getAuthenticatedUser();

        let constraints = [
            where("userId", "==", user.id),
            where("platform", "==", "pinterest"),
            where("delete", "==", 0)
        ];

        const q = query(collection(db, "pinterest_posts"), ...constraints);
        const snapshot = await getDocs(q);

        const posts = snapshot.docs.map(docSnap => {
            const data = docSnap.data();
            return {
                id: docSnap.id,
                ...data,
                createdAt: data.createdAt?.toDate?.().toISOString() || data.createdAt || null,
                updatedAt: data.updatedAt?.toDate?.().toISOString() || data.updatedAt || null,
                scheduledAt: data.scheduledAt?.toDate?.().toISOString() || data.scheduledAt || null,
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
