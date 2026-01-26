// src/app/actions/social/tiktok/publishUtils.js
"use server";

import { db } from "@/lib/firebase";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";

/**
 * Trigger TikTok Direct Post API
 */
export async function triggerTiktokPublish(accessToken, postRef, text, mediaUrl) {
    try {
        // Use a high-quality dummy video if testing
        if (mediaUrl === 'test-video') {
            mediaUrl = "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4";
        }

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
                    privacy_level: "SELF_ONLY", // Mandatory for Sandbox/Staging mode testing
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
            const errorCode = tiktokData.error.code;

            // Helpful guidance for domain verification
            if (errorMsg.includes("URL ownership verification")) {
                errorMsg = "TikTok Error: You must verify your video domain (e.g. firebasestorage.googleapis.com) in the TikTok Developer Portal under 'URL ownership verification'.";
            } else if (errorMsg.toLowerCase().includes("guideline") || errorCode === "unaudited_client_can_only_post_to_private_accounts") {
                errorMsg = `TikTok Strategy Error: ${errorMsg}. Since your app is 'Unaudited' (Sandbox), TikTok requires your actual TikTok Account to be set to 'Private' in the phone app settings (Privacy -> Private Account) to allow API posts. Alternatively, you must submit your app for a Web Audit to go live. (Error: ${errorCode})`;
            }

            console.error("TikTok API Detailed Error:", JSON.stringify(tiktokData.error, null, 2));
            await updateDoc(postRef, { status: "failed", error: errorMsg, tiktokErrorCode: errorCode });
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
