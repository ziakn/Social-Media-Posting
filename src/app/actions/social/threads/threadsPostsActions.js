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
 * Get all Threads posts with status filtering
 */
export async function getThreadsPosts({ status = "all", accountId = null } = {}) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;
        const user = await verifyToken(token);

        if (!user) {
            return { success: false, message: "Unauthorized" };
        }

        let constraints = [
            where("userId", "==", user.id),
            where("platform", "==", "threads")
        ];

        if (status !== "all") {
            constraints.push(where("status", "==", status));
        }

        if (accountId) {
            constraints.push(where("accountId", "==", accountId));
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

            return {
                id: doc.id,
                ...data,
                createdAt: data.createdAt?.toDate?.().toISOString() || data.createdAt || null,
                updatedAt: data.updatedAt?.toDate?.().toISOString() || data.updatedAt || null,
                scheduledAt: data.scheduledAt?.toDate?.().toISOString() || data.scheduledAt || null,
                publishedAt: data.publishedAt?.toDate?.().toISOString() || data.publishedAt || null,
                lastAnalyticsUpdate: data.lastAnalyticsUpdate?.toDate?.().toISOString() || data.lastAnalyticsUpdate || null,
            };
        }).filter(Boolean);

        return { success: true, posts };

    } catch (error) {
        console.error("Error in getThreadsPosts:", error);
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

        const q = query(
            collection(db, "threads_posts"),
            where("userId", "==", user.id),
            where("platform", "==", "threads"),
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
                scheduledAt: date?.toDate?.().toISOString() || date || null,
                createdAt: data.createdAt?.toDate?.().toISOString() || data.createdAt || null,
                status: data.status || "published"
            };
        }).filter(Boolean);

        return { success: true, posts };
    } catch (error) {
        console.error("Error in getAllThreadsCalendarPosts:", error);
        return { success: false, posts: [] };
    }
}
