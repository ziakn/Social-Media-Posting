"use server";

import { db } from "@/lib/firebase";
import {
    collection,
    query,
    where,
    getDocs,
    orderBy,
    limit,
    startAfter,
    deleteDoc,
    doc,
    getCountFromServer,
    Timestamp
} from "firebase/firestore";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { revalidatePath } from "next/cache";

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
            where("platform", "==", "twitter")
        );

        const snapshot = await getDocs(q);
        const accounts = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

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
                createdAt: data.createdAt?.toDate?.() || null,
                updatedAt: data.updatedAt?.toDate?.() || null,
                scheduledAt: data.scheduledAt?.toDate?.() || data.scheduledAt,
            };
        });

        const statistics = {
            totalPosts: totalCount,
            totalLikes: 0,
            totalRetweets: 0
        };

        return {
            success: true,
            posts: posts, // Returned posts are already filtered by the query
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
                createdAt: data.createdAt?.toDate?.() || null,
                updatedAt: data.updatedAt?.toDate?.() || null,
                scheduledAt: data.scheduledAt?.toDate?.() || data.scheduledAt,
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
        console.error("Error fetching Twitter scheduled posts:", err);
        return { success: false, message: err.message };
    }
}

/**
 * Delete a Twitter post from Firestore
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
        await deleteDoc(postRef);

        revalidatePath("/admin/twitter/published");
        return { success: true, message: "Post deleted successfully" };
    } catch (err) {
        console.error("Error deleting Twitter post:", err);
        return { success: false, message: err.message };
    }
}
