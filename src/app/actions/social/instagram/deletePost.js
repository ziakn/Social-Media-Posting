"use server";

import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { fetchInstagramAccounts } from "./getPages";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { removePostJob } from "@/lib/queue/queues";

/**
 * Delete an Instagram post
 * 1. Try to delete from Instagram API
 * 2. Soft delete in Firestore (set delete = 1)
 * 
 * @param {string} postId - Firestore document ID
 */
export async function deleteInstagramPost(postId) {
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
            return { success: false, message: "Unauthorized to delete this post" };
        }

        // 3. Attempt to delete from Instagram API
        // Note: This might fail if the API doesn't allow deleting published posts, 
        // but we'll proceed with soft delete regardless.
        let apiDeleteSuccess = false;
        let apiError = null;

        if (post.instagramPostId) {
            try {
                // Get Page Access Token
                const accountsResult = await fetchInstagramAccounts();
                if (accountsResult.success) {
                    const account = accountsResult.accounts.find(acc => acc.igUserId === post.pageId);

                    if (account) {
                        const response = await fetch(
                            `https://graph.instagram.com/v24.0/${post.instagramPostId}?access_token=${account.accessToken}`,
                            { method: "DELETE" }
                        );

                        const data = await response.json();

                        if (response.ok) {
                            apiDeleteSuccess = true;
                        } else {
                            console.warn("Instagram API Delete Warning:", data);
                            apiError = data.error?.message;
                        }
                    }
                }
            } catch (err) {
                console.error("Instagram API Delete Error:", err);
                apiError = err.message;
            }
        } else if (post.instagramContainerId) {
            // It's likely a scheduled post (container)
            try {
                // Get Page Access Token
                const accountsResult = await fetchInstagramAccounts();
                if (accountsResult.success) {
                    const account = accountsResult.accounts.find(acc => acc.igUserId === post.pageId);

                    if (account) {
                        const response = await fetch(
                            `https://graph.instagram.com/v24.0/${post.instagramContainerId}?access_token=${account.accessToken}`,
                            { method: "DELETE" }
                        );

                        const data = await response.json();

                        if (response.ok) {
                            apiDeleteSuccess = true;
                        } else {
                            console.warn("Instagram API Container Delete Warning:", data);
                            apiError = data.error?.message;
                        }
                    }
                }
            } catch (err) {
                console.error("Instagram API Container Delete Error:", err);
                apiError = err.message;
            }
        }

        // 4. Queue Cleanup
        await removePostJob("instagram", postId);

        // 5. Soft Delete in Firestore
        await updateDoc(postRef, {
            delete: 1,
            deletedAt: serverTimestamp(),
            apiDeleteSuccess: apiDeleteSuccess,
            apiDeleteError: apiError
        });

        return {
            success: true,
            message: apiDeleteSuccess
                ? "Post deleted successfully"
                : "Post deleted from dashboard (Instagram API deletion failed or not supported)"
        };

    } catch (error) {
        console.error("Error deleting Instagram post:", error);
        return { success: false, message: error.message };
    }
}
