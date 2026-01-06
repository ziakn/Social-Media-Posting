// src/app/actions/social/tiktok/createPost.js
"use server";

import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, doc, getDoc, query, where, getDocs } from "firebase/firestore";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

/**
 * Get authenticated user
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
 * Get TikTok account info
 */
async function getTiktokAccount(userId, platformUserId) {
    const q = query(
        collection(db, "socialAccounts"),
        where("userId", "==", userId),
        where("accountId", "==", platformUserId),
        where("platform", "==", "tiktok"),
        where("status", "==", "active")
    );
    const snapshot = await getDocs(q);
    if (snapshot.empty) throw new Error("TikTok account not found or inactive");

    const account = snapshot.docs[0].data();
    return { accountId: snapshot.docs[0].id, platformUserId: account.accountId, accessToken: account.accessToken };
}

/**
 * Create TikTok Post
 */
export async function createTiktokPost({
    pageId,
    text = "",
    media = [],
    scheduling = null
}) {
    try {
        const user = await getAuthenticatedUser();
        const { accountId, platformUserId, accessToken } = await getTiktokAccount(user.id, pageId);

        // For now, TikTok just saves to Firestore (Simulating API or using a background job)
        // In a real app, you'd use TikTok Content Posting API here

        const postData = {
            userId: user.id,
            accountId: pageId, // Platform user ID
            internalAccountId: accountId, // Firestore doc ID
            platform: "tiktok",
            content: { text, media },
            status: scheduling ? "scheduled" : "published",
            scheduledAt: scheduling || null,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            delete: 0,
            metrics: {
                likes: 0,
                comments: 0,
                shares: 0,
                views: 0
            }
        };

        if (!scheduling) {
            postData.publishedAt = serverTimestamp();
            // Here you would trigger the actual TikTok API upload
        }

        const postRef = await addDoc(collection(db, "tiktok_posts"), postData);

        return { success: true, message: scheduling ? "TikTok video scheduled" : "TikTok video published", firestoreId: postRef.id };
    } catch (error) {
        console.error("Create TikTok Post Error:", error);
        return { success: false, message: error.message };
    }
}
