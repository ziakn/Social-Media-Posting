// src/app/actions/social/tiktok/createPost.js
"use server";

import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, doc, getDoc, updateDoc, query, where, getDocs } from "firebase/firestore";
import { triggerTiktokPublish } from "./publishUtils";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { getAuthenticatedUser, getTiktokAccount } from "./accountUtils";

/**
 * Create TikTok Post (Direct Publish)
 */
import path from 'path';
import { checkVideoMetadata, validatePlatformCompliance, convertVideoForPlatform } from "@/lib/media/videoProcessor";

/**
 * Create TikTok Post (Direct Publish)
 */
export async function createTiktokPost({
    pageId,
    text = "",
    media = [],
    scheduling = null
}) {
    try {
        const user = await getAuthenticatedUser();
        const { accountId, accessToken } = await getTiktokAccount(user.id, pageId);

        if (media.length === 0) throw new Error("No video provided for TikTok post");

        let finalMedia = [...media];
        const videoItem = finalMedia[0];

        // --- Video Processing Logic ---
        if (videoItem.storagePath) {
            try {
                const absolutePath = path.join(process.cwd(), videoItem.storagePath);

                // 1. Check Metadata
                console.log(`Checking video metadata for: ${absolutePath}`);
                const metadata = await checkVideoMetadata(absolutePath);
                console.log("Video Metadata:", metadata);

                // 2. Validate Compliance
                const compliance = validatePlatformCompliance('tiktok', metadata);

                if (!compliance.compliant) {
                    console.log("Video not compliant for TikTok. Reasons:", compliance.reasons);
                    console.log("Initiating auto-conversion...");

                    // 3. Convert if needed
                    const dir = path.dirname(absolutePath);
                    const ext = path.extname(absolutePath);
                    const basename = path.basename(absolutePath, ext);
                    const outputPath = path.join(dir, `${basename}_tiktok${ext}`); // Keep extension or force .mp4? Processor forces .mp4 format but output path extension matters for url.
                    // Let's force .mp4 for output path if we entered conversion
                    const finalOutputPath = outputPath.replace(ext, '.mp4');

                    await convertVideoForPlatform(absolutePath, finalOutputPath);

                    // 4. Update Media Item with new paths
                    // Reconstruct public URL. Assuming storagePath starts with 'public/'
                    // public/uploads/... -> /uploads/...
                    const relativePath = finalOutputPath.replace(path.join(process.cwd(), 'public'), '');
                    // Ensure forward slashes for URL
                    const urlPath = relativePath.split(path.sep).join('/');

                    // We need a base URL. In server actions, this can be tricky.
                    // However, we usually store absolute URLs or root-relative URLs in the DB?
                    // The original item.url might be "https://.../uploads/..." or "/uploads/..."
                    // If it was absolute, we need the origin.

                    const isAbsolute = videoItem.url.startsWith('http');
                    let newUrl = urlPath;

                    if (isAbsolute) {
                        const urlObj = new URL(videoItem.url);
                        newUrl = `${urlObj.origin}${urlPath}`;
                    }

                    console.log(`Video converted. New URL: ${newUrl}`);

                    finalMedia[0] = {
                        ...videoItem,
                        url: newUrl,
                        storagePath: path.relative(process.cwd(), finalOutputPath), // Update storage path just in case
                        originalStoragePath: videoItem.storagePath // Keep track
                    };
                } else {
                    console.log("Video is already TikTok compliant.");
                }

            } catch (processError) {
                console.error("Video processing failed, attempting to proceed with original file:", processError);
                // We don't throw, we try with original. 
                // Alternatively, we could update status to failed?
            }
        }
        // ------------------------------

        const postData = {
            userId: user.id,
            accountId: pageId,
            internalAccountId: accountId,
            platform: "tiktok",
            content: { text, media: finalMedia }, // Use processed media
            status: scheduling ? "scheduled" : "publishing",
            scheduledAt: scheduling || null,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            delete: 0,
            metrics: { likes: 0, comments: 0, shares: 0, views: 0 }
        };

        const postRef = await addDoc(collection(db, "tiktok_posts"), postData);

        // 2. If not scheduled, trigger Direct Post API
        if (!scheduling) {
            await triggerTiktokPublish(accessToken, postRef, text, finalMedia[0].url);
        }

        return {
            success: true,
            message: scheduling ? "TikTok video scheduled" : "TikTok video published successfully!",
            firestoreId: postRef.id
        };
    } catch (error) {
        console.error("Create TikTok Post Error:", error);
        return { success: false, message: error.message };
    }
}
