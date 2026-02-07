"use server";

import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import {
    getInstagramAccount,
    createMediaContainer,
    publishMediaContainer,
    checkMediaStatus
} from "./createPost";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { getAbsoluteUrl, needsTestUrl, getTestUrl } from "./mediaUtils";

/**
 * Publish a scheduled Instagram post immediately via the background worker
 * @param {string} postId - Firestore document ID
 */
export async function publishInstagramPostNow(postId) {
    try {
        // 1. Authenticate
        const user = await verifyToken();

        if (!user) {
            return { success: false, message: "Unauthorized" };
        }

        // 2. Get post from Firestore
        const postRef = doc(db, "instagram_posts", postId);
        const postSnap = await getDoc(postRef);

        if (!postSnap.exists()) {
            return { success: false, message: "Post not found" };
        }

        const post = postSnap.data();

        if (post.userId !== user.id) {
            return { success: false, message: "Unauthorized to publish this post" };
        }

        // 3. Update Firestore to 'scheduled' for NOW
        await updateDoc(postRef, {
            status: "scheduled",
            scheduledAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });

        // 4. Synchronize with Queue (Immediate Promotion)
        await syncPostJob("instagram", postId, {
            postId,
            pageId: post.pageId,
            userId: user.id,
            userEmail: user.email
        }, { delay: 0 });

        return { success: true, message: "Publication queued for immediate processing." };

    } catch (error) {
        console.error("Error publishing Instagram post now:", error);
        return { success: false, message: error.message };
    }
}
