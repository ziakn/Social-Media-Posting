// src/app/actions/social/tiktok/createPost.js
"use server";

import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, doc, getDoc, updateDoc, query, where, getDocs } from "firebase/firestore";
import { triggerTiktokPublish } from "./publishUtils";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { getAuthenticatedUser, getTiktokAccount } from "./accountUtils";
import { incrementUsage } from "../../usage/incrementUsage";

/**
 * Create TikTok Post (Direct Publish)
 */
import path from 'path';
import { checkVideoMetadata, validatePlatformCompliance, convertVideoForPlatform } from "@/lib/media/videoProcessor";

/**
 * Create TikTok Post (Queue-First)
 */
export async function createTiktokPost({
    pageId,
    text = "",
    media = [],
    scheduling = null
}) {
    try {
        const user = await getAuthenticatedUser();

        // Check Usage Limit
        const { checkUsageLimitAction } = await import("@/app/actions/usage/usageActions");
        const usageCheck = await checkUsageLimitAction('post');
        if (!usageCheck.success) {
            return { success: false, message: usageCheck.error };
        }

        const { accountId } = await getTiktokAccount(user.id, pageId);

        if (media.length === 0) throw new Error("No video provided for TikTok post");

        let finalMedia = [...media];
        const videoItem = finalMedia[0];

        // --- Video Processing Logic (Keep in action for now to determine final URL) ---
        if (videoItem.storagePath) {
            try {
                const absolutePath = path.join(process.cwd(), videoItem.storagePath);
                const metadata = await checkVideoMetadata(absolutePath);
                const compliance = validatePlatformCompliance('tiktok', metadata);

                if (!compliance.compliant) {
                    console.log("Video not compliant for TikTok. Initiating auto-conversion...");
                    const dir = path.dirname(absolutePath);
                    const ext = path.extname(absolutePath);
                    const basename = path.basename(absolutePath, ext);
                    const outputPath = path.join(dir, `${basename}_tiktok.mp4`);

                    await convertVideoForPlatform(absolutePath, outputPath);

                    const relativePath = outputPath.replace(path.join(process.cwd(), 'public'), '');
                    const urlPath = relativePath.split(path.sep).join('/');

                    const isAbsolute = videoItem.url.startsWith('http');
                    let newUrl = urlPath;

                    if (isAbsolute) {
                        const urlObj = new URL(videoItem.url);
                        newUrl = `${urlObj.origin}${urlPath}`;
                    }

                    finalMedia[0] = {
                        ...videoItem,
                        url: newUrl,
                        storagePath: path.relative(process.cwd(), outputPath)
                    };
                }
            } catch (processError) {
                console.error("Video processing failed, attempting to proceed with original file:", processError);
            }
        }

        // 2. Prepare Firestore Document
        const postRef = doc(collection(db, "tiktok_posts"));
        const postId = postRef.id;

        const scheduledAt = scheduling ? new Date(scheduling) : null;
        const status = scheduledAt ? "scheduled" : "queued";

        const postData = {
            userId: user.id,
            accountId: pageId, // This is the platform account ID
            internalAccountId: accountId, // This is the Firestore doc ID for the account
            platform: "tiktok",
            content: { text, media: finalMedia },
            status,
            scheduledAt: scheduledAt || null,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            delete: 0,
            metrics: { likes: 0, comments: 0, shares: 0, views: 0 }
        };

        await setDoc(doc(db, "tiktok_posts", postId), postData);

        // 3. Sync to Queue
        const { syncPostJob } = await import("@/lib/queue/queues");
        const delay = scheduledAt ? Math.max(0, scheduledAt.getTime() - Date.now()) : 0;

        await syncPostJob("tiktok", postId, {
            postId,
            userId: user.id,
            userEmail: user.email,
            pageId: accountId // Use the internal doc ID for easier lookup in worker
        }, { delay });

        await incrementUsage(user.id);

        return {
            success: true,
            message: scheduledAt ? "TikTok video scheduled" : "TikTok video enqueued for publication",
            firestoreId: postId
        };
    } catch (error) {
        console.error("Create TikTok Post Error:", error);
        return { success: false, message: error.message };
    }
}
