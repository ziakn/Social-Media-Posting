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
    Timestamp
} from "firebase/firestore";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { revalidatePath } from "next/cache";

/**
 * Fetch connected Telegram accounts for the current user
 */
export async function getUserTelegramAccounts() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;
        const user = await verifyToken(token);

        if (!user) {
            return { success: false, message: "Invalid or expired token" };
        }

        const q = query(
            collection(db, "socialAccounts"),
            where("userId", "==", user.id),
            where("platform", "==", "telegram")
        );

        const snapshot = await getDocs(q);
        const accounts = snapshot.docs.map(doc => ({
            id: doc.id,
            accountId: doc.id,
            ...doc.data()
        }));

        return { success: true, accounts };
    } catch (error) {
        console.error("Error fetching Telegram accounts:", error);
        return { success: false, message: "Failed to fetch Telegram accounts" };
    }
}

/**
 * Fetch published Telegram posts
 */
export async function getTelegramPublishedPosts({
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

        if (filters.accountId && filters.accountId !== "all") {
            constraints.push(where("accountId", "==", filters.accountId));
        }

        if (filters.postType && filters.postType !== "all") {
            constraints.push(where("postType", "==", filters.postType));
        }

        if (filters.startDate) {
            constraints.push(where("createdAt", ">=", Timestamp.fromDate(new Date(filters.startDate))));
        }

        if (sortBy === "oldest") {
            constraints.push(orderBy("createdAt", "asc"));
        } else {
            constraints.push(orderBy("createdAt", "desc"));
        }

        const postsCollection = collection(db, "telegram_posts");
        
        const countQuery = query(postsCollection, ...constraints);
        const countSnapshot = await getCountFromServer(countQuery);
        const totalCount = countSnapshot.data().count;

        constraints.push(limit(pageSize));

        if (lastDocId) {
            const lastDocRef = await getDocs(query(postsCollection, where("__name__", "==", lastDocId)));
            if (!lastDocRef.empty) {
                constraints.push(startAfter(lastDocRef.docs[0]));
            }
        }

        const q = query(postsCollection, ...constraints);
        const snapshot = await getDocs(q);

        const posts = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate?.() || null,
            updatedAt: doc.data().updatedAt?.toDate?.() || null,
        }));

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
        console.error("Error fetching Telegram posts:", err);
        return { success: false, message: err.message };
    }
}

/**
 * Fetch scheduled Telegram posts
 */
export async function getTelegramScheduledPosts({
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

        if (sortBy === "oldest") {
            constraints.push(orderBy("scheduledAt", "asc"));
        } else {
            constraints.push(orderBy("scheduledAt", "desc"));
        }

        const postsCollection = collection(db, "telegram_posts");
        constraints.push(limit(pageSize));

        if (lastDocId) {
            const lastDocRef = await getDocs(query(postsCollection, where("__name__", "==", lastDocId)));
            if (!lastDocRef.empty) {
                constraints.push(startAfter(lastDocRef.docs[0]));
            }
        }

        const q = query(postsCollection, ...constraints);
        const snapshot = await getDocs(q);

        const posts = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate?.() || null,
            scheduledAt: doc.data().scheduledAt?.toDate?.() || null,
        }));

        return {
            success: true,
            posts,
            pagination: {
                hasMore: posts.length === pageSize,
                lastVisible: snapshot.docs[snapshot.docs.length - 1]?.id || null
            }
        };
    } catch (err) {
        console.error("Error fetching scheduled Telegram posts:", err);
        return { success: false, message: err.message };
    }
}

/**
 * Delete a Telegram post (from Firestore and API if possible)
 */
export async function deleteTelegramPost(postId) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;
        const user = await verifyToken(token);

        if (!user) {
            return { success: false, message: "Invalid or expired token" };
        }

        const postRef = doc(db, "telegram_posts", postId);
        const postSnap = await getDoc(postRef);

        if (!postSnap.exists()) {
            return { success: false, message: "Post not found" };
        }

        const postData = postSnap.data();
        if (postData.userId !== user.id) {
            return { success: false, message: "Unauthorized" };
        }

        // Try to delete from Telegram API if published
        if (postData.status === "posted" && postData.telegramMessageId && postData.accountId) {
            try {
                const accountSnap = await getDoc(doc(db, "socialAccounts", postData.accountId));
                if (accountSnap.exists()) {
                    const { botToken, chatId } = accountSnap.data();
                    await fetch(`https://api.telegram.org/bot${botToken}/deleteMessage`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            chat_id: chatId,
                            message_id: postData.telegramMessageId
                        })
                    });
                }
            } catch (e) {
                console.error("Failed to delete from Telegram API, continuing with Firestore deletion", e);
            }
        }

        await updateDoc(postRef, {
            deleted: 1,
            status: "deleted",
            updatedAt: new Date()
        });

        revalidatePath("/admin/social/telegram/posts");
        return { success: true, message: "Post removed successfully" };
    } catch (err) {
        console.error("Error deleting Telegram post:", err);
        return { success: false, message: err.message };
    }
}

/**
 * Update a Telegram post (Scheduled only for now)
 */
export async function updateTelegramPost(postId, message) {
    try {
        const postRef = doc(db, "telegram_posts", postId);
        await updateDoc(postRef, {
            message,
            updatedAt: new Date()
        });
        revalidatePath("/admin/social/telegram/posts");
        return { success: true, message: "Post updated successfully" };
    } catch (err) {
        console.error("Error updating Telegram post:", err);
        return { success: false, message: err.message };
    }
}
