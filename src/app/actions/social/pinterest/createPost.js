"use server";

import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, query, where, getDocs, doc, updateDoc } from "firebase/firestore";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { getAbsoluteUrl, getTestUrl, needsTestUrl } from "./mediaUtils";

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
 * Get Pinterest account info
 */
async function getPinterestAccount(userId, platformUserId) {
    const q = query(
        collection(db, "socialAccounts"),
        where("userId", "==", userId),
        where("accountId", "==", platformUserId),
        where("platform", "==", "pinterest"),
        where("status", "==", "active")
    );
    const snapshot = await getDocs(q);
    if (snapshot.empty) throw new Error("Pinterest account not found or inactive");

    const account = snapshot.docs[0].data();
    return { accountId: account.accountId, accessToken: account.accessToken };
}

/**
 * Make Pinterest API Request
 */
async function makePinterestRequest(endpoint, body, accessToken, method = "POST") {
    const url = `https://api.pinterest.com/v5${endpoint}`;
    const headers = {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
    };
    const options = { method, headers };

    if (body && (method === "POST" || method === "PATCH")) {
        options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);
    const data = await response.json();

    if (!response.ok) {
        console.error("Pinterest API error:", data);
        throw new Error(data.message || "Pinterest API error");
    }
    return data;
}

/**
 * Create Pinterest Post
 */
export async function createPinterestPost({
    pageId,
    title,
    message,
    link,
    boardId,
    media = [],
    postType = "image", // Default to image
    scheduling = null
}) {
    try {
        const user = await getAuthenticatedUser();
        const { accountId, accessToken } = await getPinterestAccount(user.id, pageId);

        // If scheduling, save to Firestore and exit
        if (scheduling) {
            const postRef = await addDoc(collection(db, "pinterest_posts"), {
                userId: user.id,
                accountId: accountId,
                platform: "pinterest",
                title,
                message,
                description: message,
                link,
                boardId,
                content: { media },
                postType,
                status: "scheduled",
                scheduledAt: scheduling,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                delete: 0
            });
            return { success: true, message: "Pin scheduled successfully", firestoreId: postRef.id };
        }

        // Immediate Publishing
        let mediaSource = {};

        if (postType === "carousel") {
            mediaSource = {
                source_type: "multiple_image_urls",
                items: media.map(item => ({
                    title: title || "",
                    description: message || "",
                    link: link || "",
                    source: {
                        source_type: "image_url",
                        url: needsTestUrl(item.url) ? getTestUrl("image") : getAbsoluteUrl(item.url)
                    }
                }))
            };
        } else if (postType === "video") {
            // NOTE: Pinterest API requires videos to be uploaded via /v5/media first to get a media_id.
            // Passing a video URL directly in 'source_type' is not supported for creating Pins directly.
            // For now, we return an error since the upload flow is complex.
            throw new Error("Video publishing requires media upload flow. Currently only Image and Carousel are fully supported via API.");
        } else {
            // Default: Image
            const item = media[0] || { url: "", type: "image" };
            const mediaUrl = needsTestUrl(item.url) ? getTestUrl(item.type) : getAbsoluteUrl(item.url);

            mediaSource = {
                source_type: "image_url",
                url: mediaUrl
            };
        }

        const pinData = {
            board_id: boardId,
            title: title || "",
            description: message || "",
            link: link || "",
            media_source: mediaSource
        };

        const result = await makePinterestRequest("/pins", pinData, accessToken, "POST");

        // Save to Firestore as published
        const postRef = await addDoc(collection(db, "pinterest_posts"), {
            userId: user.id,
            accountId: accountId,
            platform: "pinterest",
            title,
            message,
            description: message,
            link,
            boardId,
            content: { media },
            postType,
            pinterestPinId: result.id,
            status: "published",
            publishedAt: serverTimestamp(),
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            delete: 0
        });

        return { success: true, message: "Pin published successfully", pinId: result.id, firestoreId: postRef.id };

    } catch (error) {
        console.error("Create Pinterest Post Error:", error);
        return { success: false, message: error.message };
    }
}
