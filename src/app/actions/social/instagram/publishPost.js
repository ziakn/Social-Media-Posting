"use server";

import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import {
    getInstagramAccount,
    createMediaContainer,
    publishMediaContainer,
    checkMediaStatus
} from "./createPost";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

/**
 * Publish a scheduled Instagram post immediately
 * @param {string} postId - Firestore document ID
 */
export async function publishInstagramPostNow(postId) {
    try {
        // 1. Authenticate
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;
        const user = await verifyToken(token);

        if (!user) {
            return { success: false, message: "Unauthorized" };
        }

        // 2. Get post from Firestore
        const postRef = doc(db, "instagram_posts", postId);
        const postSnap = await getDoc(postRef);

        if (!postSnap.exists()) {
            return { success: false, message: "Post not found" };
        }

        const post = postSnap.data();

        if (post.userId !== user.id) {
            return { success: false, message: "Unauthorized to publish this post" };
        }

        if (post.status !== "scheduled") {
            return { success: false, message: "Post is not in scheduled status" };
        }

        // 3. Get Instagram credentials
        const { instagramId, accessToken } = await getInstagramAccount(post.pageId);

        let containerId = null;
        let publishResult = null;

        // 4. Handle different post types (simplified version of createPost logic)
        const caption = post.content?.caption || "";

        if (post.postType === "image") {
            const imageUrl = post.content.image.url;
            containerId = await createMediaContainer(
                instagramId,
                { image_url: imageUrl, caption },
                accessToken
            );
        } else if (post.postType === "video") {
            const videoUrl = post.content.video.url;
            containerId = await createMediaContainer(
                instagramId,
                { video_url: videoUrl, caption, media_type: "REELS" },
                accessToken
            );
        } else if (post.postType === "carousel") {
            const processedMedia = post.content.media || [];
            const childContainers = [];

            for (let i = 0; i < processedMedia.length; i++) {
                const item = processedMedia[i];
                const mediaData = item.type === 'video' ? { video_url: item.url } : { image_url: item.url };
                const childId = await createMediaContainer(
                    instagramId,
                    { ...mediaData, caption: "", is_carousel_item: true },
                    accessToken
                );

                // Polling for child containers
                let status, attempts = 0;
                const maxAttempts = item.type === 'video' ? 15 : 6;
                do {
                    await new Promise(r => setTimeout(r, 5000));
                    status = await checkMediaStatus(instagramId, childId, accessToken);
                    if (status.status_code === "FINISHED") break;
                    if (status.status_code === "ERROR") throw new Error(`Carousel child processing failed`);
                    attempts++;
                } while (attempts < maxAttempts);

                if (status.status_code !== "FINISHED") throw new Error(`Child not ready`);
                childContainers.push(childId);
            }

            containerId = await createMediaContainer(
                instagramId,
                { caption, children: childContainers },
                accessToken,
                true
            );
        } else if (post.postType === "story") {
            const mediaUrl = post.content.media?.url;
            const mediaType = post.content.media?.type;
            containerId = await createMediaContainer(
                instagramId,
                {
                    image_url: mediaType === 'video' ? undefined : mediaUrl,
                    video_url: mediaType === 'video' ? mediaUrl : undefined,
                    caption,
                    media_type: "STORIES"
                },
                accessToken
            );
        }

        if (!containerId) {
            throw new Error("Failed to create media container");
        }

        // 5. Poll for final container status
        console.log(`Polling final container ${containerId} status...`);
        let status, attempts = 0;
        const maxFinalAttempts = (post.postType === 'video' || post.postType === 'carousel') ? 12 : 5;
        do {
            await new Promise(r => setTimeout(r, 5000));
            status = await checkMediaStatus(instagramId, containerId, accessToken);
            if (status.status_code === "FINISHED") break;
            if (status.status_code === "ERROR") throw new Error(`Media processing failed`);
            attempts++;
        } while (attempts < maxFinalAttempts);

        if (status.status_code === "FINISHED") {
            publishResult = await publishMediaContainer(instagramId, containerId, accessToken);
        } else {
            throw new Error(`Media not ready for publishing. Status: ${status.status_code}`);
        }

        // 6. Update Firestore
        const now = new Date();
        await updateDoc(postRef, {
            status: "published",
            publishedAt: serverTimestamp(), // Record when it was actually published
            scheduledAt: serverTimestamp(), // Update scheduledAt to reflect current time as requested
            updatedAt: serverTimestamp(),
            instagramContainerId: containerId,
            instagramPostId: publishResult?.id || null
        });

        return {
            success: true,
            message: "Post published successfully",
            instagramPostId: publishResult?.id
        };

    } catch (error) {
        console.error("Error publishing Instagram post now:", error);
        return { success: false, message: error.message };
    }
}
