// src/app/actions/social/tiktok/createPost.js
"use server";

import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, doc, getDoc, updateDoc, query, where, getDocs } from "firebase/firestore";
import { triggerTiktokPublish } from "./publishUtils";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { getAuthenticatedUser, getTiktokAccount } from "./accountUtils";

/**
 * Create TikTok Post (Direct Publish)
 */
export async function createTiktokPost({
    pageId,
    text = "",
    media = [],
    scheduling = null
}) {
    try {
        const user = await getAuthenticatedUser();
        const { accountId, accessToken } = await getTiktokAccount(user.id, pageId);

        if (media.length === 0) throw new Error("No video provided for TikTok post");

        const postData = {
            userId: user.id,
            accountId: pageId,
            internalAccountId: accountId,
            platform: "tiktok",
            content: { text, media },
            status: scheduling ? "scheduled" : "publishing",
            scheduledAt: scheduling || null,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            delete: 0,
            metrics: { likes: 0, comments: 0, shares: 0, views: 0 }
        };

        const postRef = await addDoc(collection(db, "tiktok_posts"), postData);

        // 2. If not scheduled, trigger Direct Post API
        if (!scheduling) {
            await triggerTiktokPublish(accessToken, postRef, text, media[0].url);
        }

        return {
            success: true,
            message: scheduling ? "TikTok video scheduled" : "TikTok video published successfully!",
            firestoreId: postRef.id
        };
    } catch (error) {
        console.error("Create TikTok Post Error:", error);
        return { success: false, message: error.message };
    }
}
