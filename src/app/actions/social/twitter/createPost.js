"use server";

import { db } from "@/lib/firebase";
import { doc, setDoc, serverTimestamp, collection, query, where, getDocs } from "firebase/firestore";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { refreshTwitterToken } from "./tokenRefresh";
import { readFile } from 'fs/promises';
import path from 'path';

/**
 * Enhanced Twitter API response handler
 */
async function handleTwitterResponse(res, context = "Twitter API") {
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
        let message = data.errors?.[0]?.message || data.detail || `Failed to ${context}`;

        if (res.status === 429) {
            const resetTime = res.headers.get("x-rate-limit-reset");
            if (resetTime) {
                const date = new Date(parseInt(resetTime) * 1000);
                const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                message = `Twitter rate limit exceeded. You can try again after ${timeString}.`;
            } else {
                message = "Twitter rate limit exceeded. Please wait a while before trying again.";
            }
        }

        const error = new Error(message);
        error.status = res.status;
        error.data = data;
        throw error;
    }

    return data;
}

/**
 * Create a Twitter Post
 */
export async function createTwitterPost({
    message,
    mediaUrls = [],
    scheduledTime,
    postType,
    link,
}) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;
        const user = await verifyToken(token);

        if (!user) {
            return { success: false, message: "Invalid or expired token" };
        }

        const userId = user.id;

        // 1. Get Twitter Access Token from Firestore
        const q = query(
            collection(db, "socialAccounts"),
            where("userId", "==", userId),
            where("platform", "==", "twitter"),
            where("status", "==", "active")
        );
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            return { success: false, message: "Twitter account not connected" };
        }

        const accountDoc = snapshot.docs[0];
        const accountData = accountDoc.data();
        let accessToken = accountData.accessToken;
        const refreshToken = accountData.refreshToken;
        const twitterUserId = accountData.platformUserId;
        const accountId = accountDoc.id;

        // Internal function to perform the actual post attempt
        const performPost = async (currentAccessToken) => {
            // Handle Media Upload if exists
            let mediaIds = [];
            if (mediaUrls && mediaUrls.length > 0) {
                console.log(`[Twitter] Processing ${mediaUrls.length} media items...`);
                for (const media of mediaUrls) {
                    const mediaId = await handleTwitterMediaUpload(media, currentAccessToken);
                    // Explicitly cast to string to ensure consistency
                    mediaIds.push(String(mediaId));
                }
            }

            // Create Tweet Body
            let finalMessage = message?.trim() || "";
            if (link) {
                finalMessage = finalMessage ? `${finalMessage}\n\n${link}` : link;
            }

            const tweetBody = {
                text: finalMessage,
                ...(mediaIds.length > 0 && { media: { media_ids: mediaIds } })
            };

            if (!scheduledTime) {
                const res = await fetch("https://api.twitter.com/2/tweets", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${currentAccessToken}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(tweetBody),
                });

                const data = await handleTwitterResponse(res, "create tweet");
                return { success: true, tweetId: data.data.id, mediaIds };
            } else {
                // Return data for scheduling logic
                return { success: true, scheduled: true, mediaIds };
            }
        };

        let result;
        try {
            // Check if token is likely expired (add 5 min buffer) before even trying
            const isExpired = accountData.tokenExpiresAt && (accountData.tokenExpiresAt.toDate().getTime() < Date.now() + 5 * 60 * 1000);
            if (isExpired && refreshToken) {
                console.log("Token likely expired, refreshing before first attempt...");
                const refreshResult = await refreshTwitterToken(accountId, refreshToken);
                accessToken = refreshResult.access_token;
            }

            result = await performPost(accessToken);
        } catch (error) {
            // If it's a 401, try refreshing and retrying once
            if (error.status === 401 && refreshToken) {
                console.log("Caught 401 during post process, attempting token refresh...");
                try {
                    const refreshResult = await refreshTwitterToken(accountId, refreshToken);
                    accessToken = refreshResult.access_token;
                    // Retry
                    result = await performPost(accessToken);
                } catch (retryError) {
                    console.error("Retry after refresh failed:", retryError);
                    throw retryError;
                }
            } else {
                throw error;
            }
        }

        // 4. Finalize and save to Firestore
        const postRef = doc(collection(db, "twitter_posts"));
        const postId = postRef.id;

        if (scheduledTime) {
            await setDoc(postRef, {
                platform: "twitter",
                userId,
                twitterUserId,
                accountId,
                message,
                mediaUrls: mediaUrls.length ? mediaUrls : null,
                link: link || null,
                postType: mediaUrls.length > 0 ? (mediaUrls[0].type?.startsWith("video") ? "video" : "image") : (link ? "link" : "text"),
                status: "scheduled",
                scheduledAt: new Date(scheduledTime),
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });

            return { success: true, message: "Tweet scheduled successfully", postId };
        } else {
            await setDoc(postRef, {
                platform: "twitter",
                userId,
                twitterUserId,
                accountId,
                message,
                mediaUrls: mediaUrls.length ? mediaUrls : null,
                mediaIds: result.mediaIds?.length ? result.mediaIds : null,
                link: link || null,
                postType: result.mediaIds?.length > 0 ? (mediaUrls[0].type?.startsWith("video") ? "video" : "image") : (link ? "link" : "text"),
                status: "posted",
                twitterPostId: result.tweetId,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });

            return { success: true, message: "Tweet published successfully", postId };
        }

    } catch (error) {
        console.error("Twitter post creation error:", error);
        return {
            success: false,
            message: `Failed to create tweet: ${error.message}`,
        };
    }
}

/**
 * Helper to upload media to Twitter v2 (Direct Blob/Chunked)
 */
async function handleTwitterMediaUpload(media, accessToken) {
    const { url, type: mimeType } = media;
    const isVideo = mimeType?.startsWith("video");
    const mediaCategory = isVideo ? "tweet_video" : "tweet_image";

    try {
        let buffer;
        if (url.startsWith('http')) {
            const response = await fetch(url);
            if (!response.ok) throw new Error("Failed to fetch media from URL");
            const arrayBuffer = await response.arrayBuffer();
            buffer = Buffer.from(arrayBuffer);
        } else {
            // Local file handling
            const relativePath = url.startsWith('/') ? url.slice(1) : url;
            const filePath = path.join(process.cwd(), 'public', relativePath);
            buffer = await readFile(filePath);
        }

        console.log(`[Twitter] Preparing native upload for ${mimeType} (${buffer.length} bytes)`);

        // 1. INITIALIZE (X API v2)
        const initRes = await fetch("https://api.twitter.com/2/media/upload/initialize", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                total_bytes: buffer.length,
                media_type: mimeType, // Native MIME type from client
                media_category: mediaCategory,
            }),
        });

        const initData = await handleTwitterResponse(initRes, "initialize media upload");

        // Comprehensive ID extraction for X API v2 and v1.1
        // PRIORITY: Prioritize string-based IDs to avoid JSON precision loss in JS numbers
        const mediaId =
            initData.data?.id_string ||
            initData.data?.media_id_string ||
            initData.media_id_string ||
            initData.data?.id ||
            initData.data?.media_id ||
            initData.media_id ||
            initData.id;

        if (!mediaId || mediaId === "undefined" || mediaId === "null") {
            console.error("[Twitter] Media ID missing in INIT response:", initData);
            throw new Error(`Media ID missing from INIT response.`);
        }

        // Ensure it's treated as a string everywhere
        const mediaIdStr = String(mediaId);
        console.log(`[Twitter] Media initialized with ID: ${mediaIdStr}`);

        // 2. APPEND (Chunked upload for robustness)
        const CHUNK_SIZE = 4.5 * 1024 * 1024; // 4.5MB to stay safely under 5MB limit
        let segmentIndex = 0;

        for (let i = 0; i < buffer.length; i += CHUNK_SIZE) {
            const chunk = buffer.slice(i, i + CHUNK_SIZE);
            const chunkBlob = new Blob([chunk], { type: mimeType }); // Native MIME type for each segment

            const appendData = new FormData();
            appendData.append("segment_index", segmentIndex.toString());
            appendData.append("media", chunkBlob, isVideo ? "video.mp4" : "image.jpg");

            console.log(`[Twitter] Appending segment ${segmentIndex} (${chunk.length} bytes)...`);
            const appendRes = await fetch(`https://api.twitter.com/2/media/upload/${mediaIdStr}/append`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${accessToken}`,
                },
                body: appendData,
            });

            if (!appendRes.ok) {
                await handleTwitterResponse(appendRes, `append media segment ${segmentIndex}`);
            }
            segmentIndex++;
        }

        // 3. FINALIZE
        console.log(`[Twitter] Finalizing upload for media ${mediaIdStr}...`);
        const finalizeRes = await fetch(`https://api.twitter.com/2/media/upload/${mediaIdStr}/finalize`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${accessToken}`,
            },
        });

        const finalizeData = await handleTwitterResponse(finalizeRes, "finalize media upload");

        // 4. STATUS CHECK (For videos/GIFs)
        const processingInfo = finalizeData.data?.processing_info || finalizeData.processing_info;
        if (processingInfo || mediaType === "video") {
            let state = (processingInfo?.state || "pending").toLowerCase();
            let checkInterval = (processingInfo?.check_after_secs || 5) * 1000;

            console.log(`[Twitter] Initial video processing state: ${state}`);

            // Even if "succeeded" immediately, we MUST wait for propagation
            if (state === "succeeded") {
                console.log("[Twitter] Video already succeeded, but adding propagation delay...");
                await new Promise(resolve => setTimeout(resolve, 5000));
            }

            const maxAttempts = 20;
            let attempts = 0;

            while ((state === "pending" || state === "in_progress") && attempts < maxAttempts) {
                attempts++;
                console.log(`[Twitter] Waiting for video processing... (${state}) - polling in ${checkInterval / 1000}s (Attempt ${attempts}/${maxAttempts})`);
                await new Promise(resolve => setTimeout(resolve, checkInterval));

                // Note: Correct v2 STATUS endpoint often requires query param media_id
                const statusRes = await fetch(`https://api.twitter.com/2/media/upload?media_id=${mediaIdStr}`, {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${accessToken}`,
                    },
                });

                if (statusRes.ok) {
                    const statusData = await statusRes.json();
                    // Handle various response patterns (v2 can wrap in data or be at top level)
                    const info = statusData.data?.processing_info || statusData.processing_info || (statusData.data?.state ? statusData.data : null);

                    if (info) {
                        state = (info.state || state).toLowerCase();
                        checkInterval = (info.check_after_secs || 5) * 1000;
                    } else {
                        console.warn("[Twitter] Polling response missing processing_info, retrying...");
                    }

                    console.log(`[Twitter] Current polling state: ${state}`);

                    if (state === "failed") {
                        const errorMsg = info?.error?.message || "Video processing failed on Twitter's side.";
                        console.error("[Twitter] Video processing failed:", info);
                        throw new Error(`Twitter video processing failed: ${errorMsg}`);
                    }

                    if (state === "succeeded") {
                        console.log("[Twitter] Video processing succeeded! Adding 6s safety delay for full propagation...");
                        await new Promise(resolve => setTimeout(resolve, 6000));
                        break;
                    }
                } else {
                    const errorData = await statusRes.json().catch(() => ({}));
                    console.error("[Twitter] Media STATUS check failed:", errorData);
                    // For 4xx, retry a few times unless it's obvious (like 401/403)
                    if (statusRes.status === 404) {
                        console.warn("[Twitter] Status endpoint returned 404, maybe using different path... trying fallback path in next attempt");
                        // Future: try fallback to /2/media/upload/{id} ?
                    }
                }
            }

            if (attempts >= maxAttempts) {
                console.warn("[Twitter] Video processing polling timed out before success.");
                throw new Error("Video processing timed out on Twitter. Please try again.");
            }
        }

        return mediaIdStr;
    } catch (error) {
        console.error("handleTwitterMediaUpload Error:", error);
        throw error;
    }
}
