"use server";

import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, query, where, getDocs, doc, updateDoc } from "firebase/firestore";
import { verifyToken } from "@/lib/auth";
import { getValidPinterestAccessToken } from "./connectAccount";
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
 * Create Pinterest Post (Queue-First)
 */
export async function createPinterestPost({
    pageId,
    title,
    message,
    link,
    boardId,
    media = [],
    postType = "image",
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
        const { accountId } = await getValidPinterestAccessToken(user.id, pageId);

        // 3. Save to Firestore
        const postData = {
            userId: user.id,
            accountId: accountId,
            platform: "pinterest",
            title: title || "",
            message: message || "",
            description: message || "",
            link: link || "",
            boardId: boardId,
            content: { media },
            postType,
            status: scheduling ? "scheduled" : "queued",
            scheduledAt: scheduling ? new Date(scheduling) : serverTimestamp(),
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            delete: 0
        };

        const postRef = await addDoc(collection(db, "pinterest_posts"), postData);

        // 4. Increment Usage
        await incrementUsage(user.id);

        // 5. Sync with Queue
        const delay = scheduling ? Math.max(0, new Date(scheduling).getTime() - Date.now()) : 0;
        await syncPostJob("pinterest", postRef.id, {
            postId: postRef.id,
            userId: user.id,
            userEmail: user.email,
            pageId: accountId
        }, { delay });

        return {
            success: true,
            message: scheduling ? "Pin scheduled successfully" : "Pin queued for publication",
            firestoreId: postRef.id
        };

    } catch (error) {
        console.error("Create Pinterest Post Error:", error);
        return { success: false, message: error.message };
    }
}
