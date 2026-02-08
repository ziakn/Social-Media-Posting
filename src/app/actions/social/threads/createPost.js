// app/actions/social/threads/createPost.js
"use server";

import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, query, where, getDocs } from "firebase/firestore";
import { verifyToken } from "@/lib/auth";
import { serializeTimestamp } from "@/lib/utils";
import { checkUsageLimitAction } from "../../usage/usageActions";
import { incrementUsage } from "../../usage/incrementUsage";
import { syncPostJob } from "@/lib/queue/queues";

/**
 * Get authenticated user
 */
async function getAuthenticatedUser() {
    const user = await verifyToken();

    if (!user) {
        throw new Error("Invalid or expired token. Please log in again.");
    }

    return user;
}

/**
 * Get Threads account info
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
 * Get all connected Threads accounts for the current user
 */
export async function getUserThreadsAccounts() {
    try {
        const user = await getAuthenticatedUser();
        const q = query(
            collection(db, "socialAccounts"),
            where("userId", "==", user.id),
            where("platform", "==", "threads"),
            where("status", "==", "active")
        );
        const snapshot = await getDocs(q);
        const accounts = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                tokenExpiresAt: serializeTimestamp(data.tokenExpiresAt),
                createdAt: serializeTimestamp(data.createdAt),
                updatedAt: serializeTimestamp(data.updatedAt),
            };
        });
        return { success: true, accounts };
    } catch (error) {
        return { success: false, message: error.message };
    }
}

/**
 * Create Threads Post (Queue-First)
 */
export async function createThreadsPost({
    pageId,
    text = "",
    media = [],
    linkAttachment = null,
    scheduling = null
}) {
    try {
        const user = await getAuthenticatedUser();

        // 1. Check Usage Limit
        const usageCheck = await checkUsageLimitAction('post');
        if (!usageCheck.success) {
            return { success: false, message: usageCheck.error };
        }

        // 2. Resolve Account
        const { accountId } = await getThreadsAccount(user.id, pageId);

        // 3. Save to Firestore
        const postData = {
            userId: user.id,
            accountId: accountId,
            pageId: accountId, // Consistent with other platforms
            platform: "threads",
            content: { text, media, linkAttachment },
            status: scheduling ? "scheduled" : "queued",
            scheduledAt: scheduling ? new Date(scheduling) : serverTimestamp(),
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            delete: 0
        };

        const postRef = await addDoc(collection(db, "threads_posts"), postData);

        // 4. Increment Usage
        await incrementUsage(user.id);

        // 5. Sync with Queue
        const delay = scheduling ? Math.max(0, new Date(scheduling).getTime() - Date.now()) : 0;
        await syncPostJob("threads", postRef.id, {
            postId: postRef.id,
            userId: user.id,
            userEmail: user.email,
            pageId: accountId
        }, { delay });

        return {
            success: true,
            message: scheduling ? "Thread scheduled successfully" : "Thread queued for publication",
            firestoreId: postRef.id
        };
    } catch (error) {
        console.error("Create Threads Post Error:", error);
        return { success: false, message: error.message };
    }
}
