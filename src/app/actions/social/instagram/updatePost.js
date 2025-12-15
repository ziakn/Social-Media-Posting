"use server";

import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { fetchInstagramAccounts } from "./getPages";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

/**
 * Update an Instagram post's caption
 * @param {string} postId - Firestore document ID
 * @param {string} newCaption - New caption text
 */
export async function updateInstagramPost(postId, newCaption) {
    try {
        // 1. Authenticate
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;
        const user = await verifyToken(token);

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
            return { success: false, message: "Unauthorized to edit this post" };
        }

        if (!post.instagramPostId) {
            return { success: false, message: "Cannot edit a post that hasn't been published to Instagram yet" };
        }

        // 3. Get Page Access Token
        const accountsResult = await fetchInstagramAccounts();
        if (!accountsResult.success) {
            return { success: false, message: "Failed to fetch accounts" };
        }

        const account = accountsResult.accounts.find(acc => acc.igUserId === post.pageId);
        if (!account) {
            return { success: false, message: "Page not found for this post" };
        }

        // 4. Update on Instagram
        // verified: Instagram API DOES NOT support updating captions for published media.
        // verified: The endpoint POST /{media-id} only supports comment_enabled.
        // We will only update Firestore locally and warn the user.
        console.warn("Skipping Instagram API call: Caption update not supported by Instagram API.");


        // 5. Update Firestore
        await updateDoc(postRef, {
            "content.caption": newCaption, // Update nested field
            caption: newCaption, // Update distinct field if it exists (legacy support)
            updatedAt: serverTimestamp()
        });

        return {
            success: true,
            message: "Post updated locally (Instagram does not support editing captions via API)",
            warning: true
        };

    } catch (error) {
        console.error("Error updating Instagram post:", error);
        return { success: false, message: error.message };
    }
}
