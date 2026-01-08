"use server";

import { BskyAgent } from "@atproto/api";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, orderBy, limit, startAfter, doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

/**
 * Get authenticated user (Helper)
 */
async function getAuthenticatedUser() {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    const user = await verifyToken(token);

    if (!user) {
        throw new Error("Invalid or expired token. Please log in again.");
    }

    return user;
}

/**
 * Get BlueSky account info (Helper)
 */
async function getBlueSkyAccount(userId, accountId) {
    const q = query(
        collection(db, "socialAccounts"),
        where("userId", "==", userId),
        where("platform", "==", "bluesky"),
        where("accountId", "==", accountId),
        where("status", "==", "active")
    );
    const snapshot = await getDocs(q);
    if (snapshot.empty) throw new Error("BlueSky account not found or inactive");

    return snapshot.docs[0].data();
}

/**
 * Publish a scheduled BlueSky post immediately
 */
export async function publishBlueSkyPostNow(postId) {
    try {
        const user = await getAuthenticatedUser();
        const postRef = doc(db, "bluesky_posts", postId);
        const postSnap = await getDoc(postRef);

        if (!postSnap.exists()) return { success: false, message: "Post not found" };
        const post = postSnap.data();

        if (post.userId !== user.id) return { success: false, message: "Unauthorized" };

        const account = await getBlueSkyAccount(user.id, post.accountId);
        const agent = new BskyAgent({ service: "https://bsky.social" });
        await agent.login({ identifier: account.identifier, password: account.password });

        // Logic to construct post (similar to createPost but from stored data)
        const record = {
            text: post.content.text || "",
            createdAt: new Date().toISOString()
        };
        // Note: For full fidelity, we'd need to re-upload media or store blobs properly. 
        // For now, assuming text-only or basic media handling similar to createPost.

        const res = await agent.post(record);

        await updateDoc(postRef, {
            status: "published",
            blueskyUri: res.uri,
            blueskyCid: res.cid,
            publishedAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            delete: 0
        });

        revalidatePath("/admin/social/bluesky/posts");
        return { success: true, message: "Post published successfully", blueskyUri: res.uri };

    } catch (error) {
        console.error("Publish BlueSky Post Now Error:", error);
        return { success: false, message: error.message };
    }
}

/**
 * Delete a BlueSky post (Soft Delete)
 */
export async function deleteBlueSkyPost(postId) {
    try {
        const user = await getAuthenticatedUser();
        const postRef = doc(db, "bluesky_posts", postId);
        const postSnap = await getDoc(postRef);

        if (!postSnap.exists()) return { success: false, message: "Post not found" };
        if (postSnap.data().userId !== user.id) return { success: false, message: "Unauthorized" };

        await updateDoc(postRef, {
            delete: 1,
            updatedAt: serverTimestamp()
        });

        revalidatePath("/admin/social/bluesky/posts");
        return { success: true, message: "Post deleted successfully" };
    } catch (error) {
        return { success: false, message: error.message };
    }
}

/**
 * Update a scheduled BlueSky post
 */
export async function updateBlueSkyPost({ postId, text, media, scheduling, accountId }) {
    try {
        const user = await getAuthenticatedUser();
        const postRef = doc(db, "bluesky_posts", postId);
        const postSnap = await getDoc(postRef);

        if (!postSnap.exists()) return { success: false, message: "Post not found" };
        const postData = postSnap.data();

        if (postData.userId !== user.id) return { success: false, message: "Unauthorized" };
        if (postData.status === "published") return { success: false, message: "Cannot edit published posts" };

        const updates = {
            content: { text, media },
            accountId,
            updatedAt: serverTimestamp()
        };

        if (scheduling) {
            updates.scheduledAt = scheduling;
            updates.status = "scheduled";
        }

        await updateDoc(postRef, updates);
        revalidatePath("/admin/social/bluesky/posts");

        return { success: true, message: "Post updated successfully" };
    } catch (error) {
        return { success: false, message: error.message };
    }
}

/**
 * Get all BlueSky posts for calendar
 */
export async function getAllBlueSkyCalendarPosts({ startDate, endDate } = {}) {
    try {
        const user = await getAuthenticatedUser();

        let constraints = [
            where("userId", "==", user.id),
            where("platform", "==", "bluesky"),
            where("delete", "==", 0)
        ];

        if (startDate && endDate) {
            constraints.push(where("createdAt", ">=", new Date(startDate)));
            constraints.push(where("createdAt", "<=", new Date(endDate)));
        }

        const q = query(
            collection(db, "bluesky_posts"),
            ...constraints,
            orderBy("createdAt", "desc"),
            limit(1000)
        );

        const snapshot = await getDocs(q);
        const posts = snapshot.docs.map(doc => {
            const data = doc.data();
            const displayDate = data.scheduledAt || data.publishedAt || data.createdAt;
            return {
                id: doc.id,
                ...data,
                scheduledAt: displayDate?.toDate?.().toISOString() || displayDate || null,
                createdAt: data.createdAt?.toDate?.().toISOString() || data.createdAt || null,
                updatedAt: data.updatedAt?.toDate?.().toISOString() || data.updatedAt || null,
                publishedAt: data.publishedAt?.toDate?.().toISOString() || data.publishedAt || null,
                status: data.status || "published"
            };
        }).filter(Boolean);

        return { success: true, posts };
    } catch (error) {
        return { success: false, posts: [] };
    }
}
