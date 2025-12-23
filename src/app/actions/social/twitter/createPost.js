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
                console.log(`Processing ${mediaUrls.length} media items for Twitter...`);
                for (const media of mediaUrls) {
                    const mediaType = media.type?.startsWith("video") ? "video" : "image";
                    const mediaId = await handleTwitterMediaUpload(media.url, currentAccessToken, mediaType);
                    mediaIds.push(mediaId);
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
 * Helper to upload media to Twitter v1.1
 */
async function handleTwitterMediaUpload(url, accessToken, mediaType) {
    try {
        let buffer;
        if (url.startsWith('http')) {
            const response = await fetch(url);
            if (!response.ok) throw new Error("Failed to fetch media from URL");
            const arrayBuffer = await response.arrayBuffer();
            buffer = Buffer.from(arrayBuffer);
        } else {
            // Local file handling (matches Facebook implementation)
            const relativePath = url.startsWith('/') ? url.slice(1) : url;
            const filePath = path.join(process.cwd(), 'public', relativePath);
            buffer = await readFile(filePath);
        }

        const blob = new Blob([buffer], { type: mediaType === "video" ? "video/mp4" : "image/jpeg" });

        // 1. INITIALIZE (X API v2)
        // Note: Using JSON body as per v2 specs
        const initRes = await fetch("https://api.twitter.com/2/media/upload/initialize", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                total_bytes: buffer.length,
                media_type: mediaType === "video" ? "video/mp4" : "image/jpeg",
                media_category: mediaType === "video" ? "tweet_video" : "tweet_image",
            }),
        });

        const initData = await handleTwitterResponse(initRes, "initialize media upload");

        // Comprehensive ID extraction for X API v2 variations
        const mediaId = initData.data?.id ||
            initData.data?.media_id ||
            initData.data?.media_id_string ||
            initData.media_id_string ||
            initData.media_id ||
            initData.id;

        if (!mediaId) {
            console.error("Twitter Media ID not found in INIT response:", initData);
            throw new Error(`Media ID missing from INIT response.`);
        }

        // 2. APPEND (Chunked upload for robustness)
        const CHUNK_SIZE = 4.5 * 1024 * 1024; // 4.5MB to stay safely under 5MB limit
        let segmentIndex = 0;

        for (let i = 0; i < buffer.length; i += CHUNK_SIZE) {
            const chunk = buffer.slice(i, i + CHUNK_SIZE);
            const chunkBlob = new Blob([chunk], { type: mediaType === "video" ? "video/mp4" : "image/jpeg" });

            const appendData = new FormData();
            appendData.append("segment_index", segmentIndex.toString());
            appendData.append("media", chunkBlob, mediaType === "video" ? "video.mp4" : "image.jpg");

            const appendRes = await fetch(`https://api.twitter.com/2/media/upload/${mediaId}/append`, {
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
        const finalizeRes = await fetch(`https://api.twitter.com/2/media/upload/${mediaId}/finalize`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${accessToken}`,
            },
        });

        const finalizeData = await handleTwitterResponse(finalizeRes, "finalize media upload");

        // 4. STATUS CHECK (For videos/GIFs)
        const processingInfo = finalizeData.data?.processing_info || finalizeData.processing_info;
        if (processingInfo || mediaType === "video") {
            let state = processingInfo?.state || "pending";
            let checkInterval = (processingInfo?.check_after_secs || 5) * 1000;

            console.log(`Initial video processing state: ${state}`);

            // Special case: if state is already "succeeded", we still want to wait a tiny bit
            if (state === "succeeded") {
                console.log("Video already succeeded, adding safety delay...");
                await new Promise(resolve => setTimeout(resolve, 3000));
            }

            while (state === "pending" || state === "in_progress") {
                console.log(`Waiting for Twitter video processing... (${state}) - polling in ${checkInterval / 1000}s`);
                await new Promise(resolve => setTimeout(resolve, checkInterval));

                const statusRes = await fetch(`https://api.twitter.com/2/media/upload/${mediaId}`, {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${accessToken}`,
                    },
                });

                if (statusRes.ok) {
                    const statusData = await statusRes.json();
                    const updatedInfo = statusData.data?.processing_info || statusData.processing_info;
                    state = updatedInfo?.state || "failed";
                    checkInterval = (updatedInfo?.check_after_secs || 5) * 1000;

                    console.log(`Polling status: ${state}`);

                    if (state === "failed") {
                        const errorMsg = updatedInfo?.error?.message || "Video processing failed on Twitter's side.";
                        console.error("Twitter video processing failed:", updatedInfo);
                        throw new Error(`Twitter video processing failed: ${errorMsg}`);
                    }

                    if (state === "succeeded") {
                        console.log("Video processing succeeded! Adding 3s safety delay for propagation...");
                        await new Promise(resolve => setTimeout(resolve, 3000));
                        break;
                    }
                } else {
                    const errorText = await statusRes.text();
                    console.error("Twitter Media STATUS check failed:", errorText);
                    // Don't throw immediately, maybe it's a transient error, but if it keeps failing it will timeout
                    break;
                }
            }
        }

        return mediaId;
    } catch (error) {
        console.error("handleTwitterMediaUpload Error:", error);
        throw error;
    }
}
