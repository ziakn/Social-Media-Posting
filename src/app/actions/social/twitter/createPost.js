"use server";

import { db } from "@/lib/firebase";
import { doc, setDoc, serverTimestamp, collection, query, where, getDocs } from "firebase/firestore";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { refreshTwitterToken } from "./tokenRefresh";
import { readFile } from 'fs/promises';
import path from 'path';
import { checkVideoMetadata, validatePlatformCompliance, convertVideoForPlatform } from "@/lib/media/videoProcessor";
import { checkUsageLimitAction } from "../../usage/usageActions";

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
        const user = await verifyToken();

        if (!user) {
            return { success: false, message: "Invalid or expired token" };
        }

        // Check Usage Limit
        const usageCheck = await checkUsageLimitAction('post');
        if (!usageCheck.success) {
            return { success: false, message: usageCheck.error };
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
                delete: 0,
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
                delete: 0,
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
export async function handleTwitterMediaUpload(media, accessToken) {
    const { url, mimeType: rawMimeType, type: genericType } = media;

    // Prioritize explicit mimeType, fallback to detection or default
    let mimeType = rawMimeType;
    if (!mimeType) {
        // Fallback for cases where mimeType might be missing
        mimeType = url.endsWith('.mp4') ? "video/mp4" : "image/jpeg";
    }
    // Normalize logic
    if (mimeType === "image/jpg") mimeType = "image/jpeg";

    const isVideo = mimeType.startsWith("video");
    const isGif = mimeType === "image/gif";

    let mediaCategory = "tweet_image";
    if (isVideo) mediaCategory = "tweet_video";
    else if (isGif) mediaCategory = "tweet_gif";

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
            const absolutePath = path.join(process.cwd(), 'public', relativePath);
            let finalPath = absolutePath;

            // --- Video Validation ---
            if (isVideo) {
                try {
                    console.log(`Checking Twitter video compliance: ${absolutePath}`);
                    const metadata = await checkVideoMetadata(absolutePath);
                    const compliance = validatePlatformCompliance('twitter', metadata);

                    if (!compliance.compliant) {
                        console.log("Twitter video not compliant:", compliance.reasons);
                        const dir = path.dirname(absolutePath);
                        const ext = path.extname(absolutePath);
                        const basename = path.basename(absolutePath, ext);
                        const outputPath = path.join(dir, `${basename}_tw.mp4`);

                        await convertVideoForPlatform(absolutePath, outputPath);
                        finalPath = outputPath;

                        // Update mimeType to match converted output
                        mimeType = 'video/mp4';
                    }
                } catch (err) {
                    console.warn("Twitter validation skipped:", err);
                }
            }

            buffer = await readFile(finalPath);
        }

        console.log(`[Twitter] Preparing v2 upload for ${mimeType} (${buffer.length} bytes)`);

        // 1. INITIALIZE (api.twitter.com/2/media/upload)
        // Using the v2-style endpoint which seems to accept OAuth 2.0 Bearer tokens for some users/tiers
        // Previous error "media_type does not have a value in the enumeration" confirms this endpoint validates input
        const initRes = await fetch("https://api.twitter.com/2/media/upload/initialize", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                total_bytes: buffer.length,
                media_type: mimeType, // Corrected: sending valid MIME type
                media_category: mediaCategory,
            }),
        });

        const initData = await handleTwitterResponse(initRes, "initialize media upload");

        // Comprehensive ID extraction
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

        const mediaIdStr = String(mediaId);
        console.log(`[Twitter] Media initialized with ID: ${mediaIdStr}`);

        // 2. APPEND (Chunked)
        const CHUNK_SIZE = 4.5 * 1024 * 1024; // 4.5MB
        let segmentIndex = 0;

        for (let i = 0; i < buffer.length; i += CHUNK_SIZE) {
            const chunk = buffer.slice(i, i + CHUNK_SIZE);
            const chunkBlob = new Blob([chunk], { type: mimeType });

            const appendData = new FormData();
            appendData.append("segment_index", segmentIndex.toString());
            // Extension based on mimeType
            const extension = mimeType.split('/')[1] || (isVideo ? "mp4" : "jpg");
            appendData.append("media", chunkBlob, `media.${extension}`);

            console.log(`[Twitter] Appending segment ${segmentIndex} (${chunk.length} bytes)...`);

            const appendRes = await fetch(`https://api.twitter.com/2/media/upload/${mediaIdStr}/append`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${accessToken}`,
                },
                body: appendData,
            });

            if (!appendRes.ok) {
                // v2 might return JSON error
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
        if (processingInfo || isVideo || isGif) {
            let state = (processingInfo?.state || "pending").toLowerCase();
            let checkInterval = (processingInfo?.check_after_secs || 5) * 1000;

            console.log(`[Twitter] Initial processing state: ${state}`);

            // Safety wait for "succeeded" to propagate
            if (state === "succeeded") {
                await new Promise(resolve => setTimeout(resolve, 5000));
            }

            const maxAttempts = 20;
            let attempts = 0;

            while ((state === "pending" || state === "in_progress") && attempts < maxAttempts) {
                attempts++;
                console.log(`[Twitter] Polling status... (Attempt ${attempts}/${maxAttempts})`);
                await new Promise(resolve => setTimeout(resolve, checkInterval));

                const statusRes = await fetch(`https://api.twitter.com/2/media/upload?media_id=${mediaIdStr}`, {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${accessToken}`,
                    },
                });

                if (statusRes.ok) {
                    const statusData = await statusRes.json();
                    const info = statusData.data?.processing_info || statusData.processing_info || (statusData.data?.state ? statusData.data : null);

                    if (info) {
                        state = (info.state || state).toLowerCase();
                        checkInterval = (info.check_after_secs || 5) * 1000;
                    } else if (statusData.data?.media_id || statusData.media_id) {
                        // Fallback success assumption if media object exists but no processing info?
                        // Better to stick with 'succeeded' check if possible.
                        if (!info) console.warn("[Twitter] Polling: No processing info found.");
                    }

                    console.log(`[Twitter] Status: ${state}`);

                    if (state === "failed") {
                        const errorMsg = info?.error?.message || "Processing failed";
                        throw new Error(`Twitter video processing failed: ${errorMsg}`);
                    }

                    if (state === "succeeded") {
                        console.log("[Twitter] Video processing succeeded! Allow propagation...");
                        await new Promise(resolve => setTimeout(resolve, 6000));
                        break;
                    }

                } else {
                    console.warn("[Twitter] Status check failed");
                    if (statusRes.status === 404) {
                        // Sometimes 404 means handled by different server?
                    }
                }
            }

            if (state !== "succeeded" && attempts >= maxAttempts) {
                console.warn("[Twitter] Processing polling timed out.");
                throw new Error("Video processing timed out.");
            }
        }

        return mediaIdStr;
    } catch (error) {
        console.error("handleTwitterMediaUpload Error:", error);
        throw error;
    }
}
