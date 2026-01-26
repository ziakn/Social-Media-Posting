// src/app/actions/social/tiktok/publishUtils.js
"use server";

import { db } from "@/lib/firebase";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";

/**
 * Trigger TikTok Direct Post API
 */
export async function triggerTiktokPublish(accessToken, postRef, text, mediaUrl) {
    try {
        const isLocal = process.env.NEXT_PUBLIC_BASE_URL?.includes('localhost');
        const baseUrl = isLocal ? process.env.NEXT_PUBLIC_BASE_URL : "https://socialhub.ziamuhammad.com";
        const proxyUrl = `${baseUrl}/api/tiktok/proxy?url=${encodeURIComponent(mediaUrl)}`;

        const tiktokRes = await fetch("https://open.tiktokapis.com/v2/post/publish/video/init/", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${accessToken}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                post_info: {
                    title: text.slice(0, 150), // TikTok title limit
                    privacy_level: "PUBLIC_TO_EVERYONE",
                    disable_comment: false,
                    disable_duet: false,
                    disable_stitch: false
                },
                source_info: {
                    source: "PULL_FROM_URL",
                    video_url: proxyUrl
                }
            })
        });

        const tiktokData = await tiktokRes.json();

        if (tiktokData.error && tiktokData.error.code !== "ok") {
            let errorMsg = tiktokData.error.message || "TikTok API rejection";

            // Helpful guidance for domain verification
            if (errorMsg.includes("URL ownership verification")) {
                errorMsg = "TikTok Error: You must verify your video domain (e.g. firebasestorage.googleapis.com) in the TikTok Developer Portal under 'URL ownership verification'.";
            }

            await updateDoc(postRef, { status: "failed", error: errorMsg });
            throw new Error(errorMsg);
        }

        await updateDoc(postRef, {
            status: "published",
            publishedAt: serverTimestamp(),
            tiktok_publish_id: tiktokData.data?.publish_id || null
        });

        return { success: true, publishId: tiktokData.data?.publish_id };
    } catch (apiError) {
        console.error("TikTok API Posting Failed:", apiError);
        // Ensure status is updated if not already handled
        try {
            await updateDoc(postRef, { status: "failed", error: apiError.message });
        } catch (e) { }
        throw apiError;
    }
}
