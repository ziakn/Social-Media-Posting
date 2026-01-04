// app/actions/social/threads/createPost.js
"use server";

import fs from "fs";
import { db, storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, addDoc, serverTimestamp, query, where, getDocs } from "firebase/firestore";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

/**
 * Make request to Threads Graph API
 */
async function makeThreadsRequest(endpoint, params, accessToken, method = "POST") {
    const url = new URL(`https://graph.threads.net/v1.0${endpoint}`);

    let body = null;
    if (method === "POST") {
        body = new URLSearchParams({
            access_token: accessToken,
            ...params
        });
    } else {
        url.search = new URLSearchParams({
            access_token: accessToken,
            ...params
        }).toString();
    }

    const response = await fetch(url.toString(), {
        method,
        body,
    });

    const data = await response.json();
    if (!response.ok) {
        console.error("Threads API error:", data);
        throw new Error(data.error?.message || "Threads API error");
    }
    return data;
}

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
 * Create Threads Post
 */

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
                tokenExpiresAt: data.tokenExpiresAt?.toDate?.().toISOString() || data.tokenExpiresAt || null,
                createdAt: data.createdAt?.toDate?.().toISOString() || data.createdAt || null,
                updatedAt: data.updatedAt?.toDate?.().toISOString() || data.updatedAt || null,
            };
        });
        return { success: true, accounts };
    } catch (error) {
        return { success: false, message: error.message };
    }
}

export async function createThreadsPost({ pageId, text, mediaUrl, mediaType, scheduling }) {
    const user = await getAuthenticatedUser();
    const { accountId, accessToken } = await getThreadsAccount(user.id, pageId);

    // 1. Create Media Container
    const params = {
        media_type: mediaType || "TEXT",
    };

    if (text) params.text = text;
    if (mediaUrl) {
        if (mediaType === "IMAGE") params.image_url = mediaUrl;
        if (mediaType === "VIDEO") params.video_url = mediaUrl;
    }

    const container = await makeThreadsRequest(`/${accountId}/threads`, params, accessToken);
    const creationId = container.id;

    // Threads recommends waiting ~30s for media processing, 
    // but for text it's instant. For media we might need to poll.
    if (mediaType === "IMAGE" || mediaType === "VIDEO") {
        console.log("Waiting for Threads media processing...");
        await new Promise(r => setTimeout(r, 10000)); // Wait 10s initially
    }

    // 2. Publish container
    const publishResult = await makeThreadsRequest(`/${accountId}/threads_publish`, {
        creation_id: creationId
    }, accessToken);

    // 3. Save to Firestore
    const postRef = await addDoc(collection(db, "threads_posts"), {
        userId: user.id,
        accountId: accountId,
        platform: "threads",
        content: { text, mediaUrl, mediaType },
        threadsCreationId: creationId,
        threadsPostId: publishResult.id,
        status: "published",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });

    return { success: true, threadsPostId: publishResult.id, firestoreId: postRef.id };
}
