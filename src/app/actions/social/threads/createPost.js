// app/actions/social/threads/createPost.js
"use server";

import fs from "fs";
import { db, storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, addDoc, serverTimestamp, query, where, getDocs } from "firebase/firestore";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { getAbsoluteUrl, getTestUrl, needsTestUrl } from "./mediaUtils";
import path from "path";
import { checkVideoMetadata, validatePlatformCompliance, convertVideoForPlatform } from "@/lib/media/videoProcessor";
import { serializeTimestamp } from "@/lib/utils";
import { checkUsageLimitAction } from "../../usage/usageActions";
import { incrementUsage } from "../../usage/incrementUsage";

/**
 * Check Threads Media Container Status
 */
async function checkThreadStatus(containerId, accessToken, accountId) {
    const data = await makeThreadsRequest(`/${containerId}`, {
        fields: "status,error_message"
    }, accessToken, "GET");
    return data;
}

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
    const user = await verifyToken();

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
                tokenExpiresAt: serializeTimestamp(data.tokenExpiresAt),
                createdAt: serializeTimestamp(data.createdAt),
                updatedAt: serializeTimestamp(data.updatedAt),
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

        // Check Usage Limit
        const usageCheck = await checkUsageLimitAction('post');
        if (!usageCheck.success) {
            return { success: false, message: usageCheck.error };
        }

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
                delete: 0
            });
            await incrementUsage(user.id);
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
                if (childParams.media_type === "VIDEO") {
                    // --- Video Validation ---
                    let finalVideoUrl = mediaUrl;
                    if (!needsTestUrl(item.url) && item.url.startsWith('/')) {
                        try {
                            const relativePath = item.url.substring(1);
                            const absolutePath = path.join(process.cwd(), 'public', relativePath);
                            const metadata = await checkVideoMetadata(absolutePath);
                            const compliance = validatePlatformCompliance('threads', metadata);

                            if (!compliance.compliant) {
                                console.log(`Threads video validation failed for item ${i}:`, compliance.reasons);
                                const dir = path.dirname(absolutePath);
                                const ext = path.extname(absolutePath);
                                const basename = path.basename(absolutePath, ext);
                                const outputPath = path.join(dir, `${basename}_threads_${i}.mp4`);

                                await convertVideoForPlatform(absolutePath, outputPath);

                                const newRelativePath = '/' + path.relative(path.join(process.cwd(), 'public'), outputPath);
                                finalVideoUrl = getAbsoluteUrl(newRelativePath);
                                console.log("Converted Threads video URL:", finalVideoUrl);
                            }
                        } catch (err) {
                            console.warn("Threads video validation skipped:", err);
                        }
                    }
                    childParams.video_url = finalVideoUrl;
                }

                const childContainer = await makeThreadsRequest(`/${accountId}/threads`, childParams, accessToken);
                childIds.push(childContainer.id);
            }

            // Poll for all children to be ready (much more reliable than static timeout)
            for (const childId of childIds) {
                let attempts = 0;
                while (attempts < 20) {
                    await new Promise(r => setTimeout(r, 2000));
                    const status = await checkThreadStatus(childId, accessToken, accountId);

                    if (status.status === 'FINISHED') break;
                    if (status.status === 'ERROR') {
                        throw new Error(`Thread child media error: ${status.error_message || 'Unknown Error'}`);
                    }
                    attempts++;
                }
            }

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
                if (params.media_type === "VIDEO") {
                    // --- Video Validation ---
                    let finalVideoUrl = mediaUrl;
                    if (!needsTestUrl(item.url) && item.url.startsWith('/')) {
                        try {
                            const relativePath = item.url.substring(1);
                            const absolutePath = path.join(process.cwd(), 'public', relativePath);
                            const metadata = await checkVideoMetadata(absolutePath);
                            const compliance = validatePlatformCompliance('threads', metadata);

                            if (!compliance.compliant) {
                                console.log("Threads single video validation failed:", compliance.reasons);
                                const dir = path.dirname(absolutePath);
                                const ext = path.extname(absolutePath);
                                const basename = path.basename(absolutePath, ext);
                                const outputPath = path.join(dir, `${basename}_threads_single.mp4`);

                                await convertVideoForPlatform(absolutePath, outputPath);

                                const newRelativePath = '/' + path.relative(path.join(process.cwd(), 'public'), outputPath);
                                finalVideoUrl = getAbsoluteUrl(newRelativePath);
                                console.log("Converted Threads video URL:", finalVideoUrl);
                            }
                        } catch (err) {
                            console.warn("Threads video validation skipped:", err);
                        }
                    }
                    params.video_url = finalVideoUrl;
                }
            } else {
                params.media_type = "TEXT";
            }

            if (text) params.text = text;
            if (params.media_type === "TEXT" && linkAttachment) params.link_attachment = linkAttachment;

            const container = await makeThreadsRequest(`/${accountId}/threads`, params, accessToken);
            creationId = container.id;
        }

        // Wait for media processing (Threads recommends polling)
        if (media.length > 0) {
            console.log(`Waiting for Threads container ${creationId} processing...`);
            let attempts = 0;
            const maxAttempts = 30; // Wait up to 90s
            while (attempts < maxAttempts) {
                await new Promise(r => setTimeout(r, 3000));
                const status = await checkThreadStatus(creationId, accessToken, accountId);
                console.log(`Container ${creationId} status: ${status.status}`);

                if (status.status === 'FINISHED') break;
                if (status.status === 'ERROR') {
                    throw new Error(`Threads media error: ${status.error_message || 'Unknown Error'}`);
                }
                attempts++;
            }
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
            delete: 0
        });

        await incrementUsage(user.id);
        return { success: true, threadsPostId: threadsPostId, firestoreId: postRef.id };
    } catch (error) {
        console.error("Create Threads Post Error:", error);
        return { success: false, message: error.message };
    }
}
