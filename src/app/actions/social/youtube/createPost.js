"use server";

import { db } from "@/lib/firebase";
import { doc, setDoc, serverTimestamp, collection, query, where, getDocs } from "firebase/firestore";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { refreshYoutubeToken } from "./tokenRefresh";
import { readFile } from 'fs/promises';
import path from 'path';

/**
 * Handle YouTube API response
 */
async function handleYoutubeResponse(res, context = "YouTube API") {
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
        const message = data.error?.message || `Failed to ${context}`;
        const error = new Error(message);
        error.status = res.status;
        error.data = data;
        throw error;
    }

    return data;
}

/**
 * Create a YouTube Post (Upload Video)
 */
export async function createYoutubePost({
    title,
    description,
    videoUrl,
    scheduledTime,
    privacyStatus = "public", // public, private, unlisted
}) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;
        const user = await verifyToken(token);

        if (!user) {
            return { success: false, message: "Invalid or expired token" };
        }

        const userId = user.id;

        // 1. Get YouTube Access Token from Firestore
        const q = query(
            collection(db, "socialAccounts"),
            where("userId", "==", userId),
            where("platform", "==", "youtube"),
            where("status", "==", "active")
        );
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            return { success: false, message: "YouTube account not connected" };
        }

        const accountDoc = snapshot.docs[0];
        const accountData = accountDoc.data();
        let accessToken = accountData.accessToken;
        const refreshToken = accountData.refreshToken;
        const accountId = accountDoc.id;

        // Internal function to perform the actual upload attempt
        const performUpload = async (currentAccessToken) => {
            if (!videoUrl) {
                throw new Error("Video URL is required for YouTube posts");
            }

            let buffer;
            if (videoUrl.startsWith('http')) {
                const response = await fetch(videoUrl);
                if (!response.ok) throw new Error("Failed to fetch video from URL");
                const arrayBuffer = await response.arrayBuffer();
                buffer = Buffer.from(arrayBuffer);
            } else {
                const relativePath = videoUrl.startsWith('/') ? videoUrl.slice(1) : videoUrl;
                const filePath = path.join(process.cwd(), 'public', relativePath);
                buffer = await readFile(filePath);
            }

            // YouTube Data API v3 Upload
            const metadata = {
                snippet: {
                    title: title || "New Video",
                    description: description || "",
                    categoryId: "22", // People & Blogs
                },
                status: {
                    privacyStatus: privacyStatus,
                    selfDeclaredMadeForKids: false,
                }
            };

            const formData = new FormData();
            formData.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
            formData.append('video', new Blob([buffer], { type: 'video/*' }));

            const uploadRes = await fetch("https://www.googleapis.com/upload/youtube/v3/videos?uploadType=multipart&part=snippet,status", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${currentAccessToken}`,
                },
                body: formData,
            });

            const uploadData = await handleYoutubeResponse(uploadRes, "upload video");
            return { success: true, videoId: uploadData.id };
        };

        let result;
        try {
            // Check if token is expired
            const isExpired = accountData.tokenExpiresAt && (accountData.tokenExpiresAt.toDate().getTime() < Date.now() + 5 * 60 * 1000);
            if (isExpired && refreshToken) {
                const refreshResult = await refreshYoutubeToken(accountId, refreshToken);
                accessToken = refreshResult.access_token;
            }

            if (scheduledTime) {
                // For YouTube, scheduling is handled via the 'publishAt' property in metadata if privacyStatus is 'private'
                // But for simplicity in this implementation, we'll store it as 'scheduled' in our DB first
                result = { success: true, scheduled: true };
            } else {
                result = await performUpload(accessToken);
            }
        } catch (error) {
            if (error.status === 401 && refreshToken) {
                try {
                    const refreshResult = await refreshYoutubeToken(accountId, refreshToken);
                    accessToken = refreshResult.access_token;
                    result = await performUpload(accessToken);
                } catch (retryError) {
                    throw retryError;
                }
            } else {
                throw error;
            }
        }

        // Save to Firestore
        const postRef = doc(collection(db, "youtube_posts"));
        const postId = postRef.id;

        const postData = {
            platform: "youtube",
            userId,
            accountId,
            title,
            description,
            videoUrl,
            status: scheduledTime ? "scheduled" : "posted",
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            delete: 0,
        };

        if (scheduledTime) {
            postData.scheduledAt = new Date(scheduledTime);
        } else {
            postData.youtubeVideoId = result.videoId;
        }

        await setDoc(postRef, postData);

        return {
            success: true,
            message: scheduledTime ? "Video scheduled successfully" : "Video uploaded successfully",
            postId,
            videoId: result.videoId
        };

    } catch (error) {
        console.error("YouTube post creation error:", error);
        return {
            success: false,
            message: `Failed to upload video: ${error.message}`,
        };
    }
}
