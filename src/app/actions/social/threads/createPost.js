// app/actions/social/threads/createPost.js
"use server";

import fs from "fs";
import { db, storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, addDoc, serverTimestamp, query, where, getDocs } from "firebase/firestore";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { getAbsoluteUrl, getTestUrl, needsTestUrl } from "./mediaUtils";

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

/**
 * Create Threads Post
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
        const { accountId, accessToken } = await getThreadsAccount(user.id, pageId);

        // If scheduling, save to Firestore and exit
        if (scheduling) {
            const postRef = await addDoc(collection(db, "threads_posts"), {
                userId: user.id,
                accountId: accountId,
                platform: "threads",
                content: { text, media, linkAttachment },
                status: "scheduled",
                scheduledAt: scheduling,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });
            return { success: true, message: "Thread scheduled successfully", firestoreId: postRef.id };
        }

        let threadsPostId = null;
        let creationId = null;

        // Determine if it's a carousel (2-20 items)
        if (media.length > 1) {
            // 1. Create individual media containers
            const childIds = [];
            for (let i = 0; i < media.length; i++) {
                const item = media[i];
                const mediaUrl = needsTestUrl(item.url) ? getTestUrl(item.type, i) : getAbsoluteUrl(item.url);

                const childParams = {
                    is_carousel_item: true,
                    media_type: item.type?.toUpperCase() || "IMAGE",
                };
                if (childParams.media_type === "IMAGE") childParams.image_url = mediaUrl;
                if (childParams.media_type === "VIDEO") childParams.video_url = mediaUrl;

                const childContainer = await makeThreadsRequest(`/${accountId}/threads`, childParams, accessToken);
                childIds.push(childContainer.id);
            }

            // Carousel processing wait
            await new Promise(r => setTimeout(r, 15000));

            // 2. Create carousel container
            const carouselParams = {
                media_type: "CAROUSEL",
                children: childIds.join(","),
            };
            if (text) carouselParams.text = text;

            const carouselContainer = await makeThreadsRequest(`/${accountId}/threads`, carouselParams, accessToken);
            creationId = carouselContainer.id;
        } else {
            // Single post (Text, Image, or Video)
            const params = {};

            if (media.length === 1) {
                const item = media[0];
                const mediaUrl = needsTestUrl(item.url) ? getTestUrl(item.type) : getAbsoluteUrl(item.url);

                params.media_type = item.type?.toUpperCase() || "IMAGE";
                if (params.media_type === "IMAGE") params.image_url = mediaUrl;
                if (params.media_type === "VIDEO") params.video_url = mediaUrl;
            } else {
                params.media_type = "TEXT";
            }

            if (text) params.text = text;
            if (params.media_type === "TEXT" && linkAttachment) params.link_attachment = linkAttachment;

            const container = await makeThreadsRequest(`/${accountId}/threads`, params, accessToken);
            creationId = container.id;
        }

        // Wait for media processing (Threads recommends ~30s, we'll wait 20s)
        if (media.length > 0) {
            console.log("Waiting for Threads media processing...");
            await new Promise(r => setTimeout(r, 20000));
        }

        // 3. Publish container
        const publishResult = await makeThreadsRequest(`/${accountId}/threads_publish`, {
            creation_id: creationId
        }, accessToken);
        threadsPostId = publishResult.id;

        // 4. Save to Firestore
        const postRef = await addDoc(collection(db, "threads_posts"), {
            userId: user.id,
            accountId: accountId,
            platform: "threads",
            content: { text, media, linkAttachment },
            threadsCreationId: creationId,
            threadsPostId: threadsPostId,
            status: "published",
            publishedAt: serverTimestamp(),
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });

        return { success: true, threadsPostId: threadsPostId, firestoreId: postRef.id };
    } catch (error) {
        console.error("Create Threads Post Error:", error);
        return { success: false, message: error.message };
    }
}
