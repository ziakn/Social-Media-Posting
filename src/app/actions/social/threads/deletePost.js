// app/actions/social/threads/deletePost.js
"use server";

import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { revalidatePath } from "next/cache";

/**
 * Delete a Threads post
 */
export async function deleteThreadsPost(postId) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;
        const user = await verifyToken(token);

        if (!user) {
            return { success: false, message: "Unauthorized" };
        }

        const postRef = doc(db, "threads_posts", postId);
        const postSnap = await getDoc(postRef);

        if (!postSnap.exists()) {
            return { success: false, message: "Post not found" };
        }

        const postData = postSnap.data();
        if (postData.userId !== user.id) {
            return { success: false, message: "Unauthorized" };
        }

        // Potential hard delete from Threads API if supported (needs research into Threads API v1.0)
        // For now, we perform a soft delete in our DB.

        await updateDoc(postRef, {
            deleted: 1,
            updatedAt: new Date().toISOString()
        });

        revalidatePath("/admin/social/threads/posts");

        return { success: true, message: "Post deleted successfully" };

    } catch (error) {
        console.error("Error deleting Threads post:", error);
        return { success: false, message: error.message };
    }
}
