"use server";

import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { fetchInstagramAccounts } from "./getPages";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { getAbsoluteUrl, getTestUrl, needsTestUrl } from "./mediaUtils";

/**
 * Update an Instagram post (Caption for published, all fields for scheduled)
 * @param {string} postId - Firestore document ID
 * @param {object} updates - Fields to update
 */
export async function updateInstagramPost(postId, updates) {
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
            return { success: false, message: "Unauthorized to edit this post" };
        }

        const isScheduled = post.status === "scheduled";
        const isPublished = post.status === "published" || !!post.instagramPostId;

        // 3. Prepare Firestore update
        const firestoreUpdate = {
            updatedAt: serverTimestamp()
        };

        if (updates.caption !== undefined) {
            firestoreUpdate["content.caption"] = updates.caption;
            firestoreUpdate["caption"] = updates.caption; // legacy
        }

        if (isScheduled) {
            if (updates.scheduledAt !== undefined) {
                firestoreUpdate.scheduledAt = updates.scheduledAt;
            }

            // Handle media updates for scheduled posts
            if (updates.media !== undefined && Array.isArray(updates.media)) {
                const media = updates.media;

                // Determine new postType and content structure
                let newPostType = post.postType;
                let content = { ...post.content, caption: updates.caption || post.content?.caption || "" };

                if (post.postType === "story") {
                    const item = media[0];
                    content.media = {
                        url: needsTestUrl(item.url) ? getTestUrl(item.type, 0) : getAbsoluteUrl(item.url),
                        type: item.type,
                        name: item.name || "story_media"
                    };
                    newPostType = "story";
                } else {
                    // Feed posts can switch between image, video, and carousel
                    if (media.length > 1) {
                        newPostType = "carousel";
                        content.media = media.map((m, idx) => ({
                            url: needsTestUrl(m.url) ? getTestUrl(m.type, idx) : getAbsoluteUrl(m.url),
                            type: m.type,
                            name: m.name
                        }));
                        // Clean up single image/video fields if they exist
                        delete content.image;
                        delete content.video;
                    } else if (media.length === 1) {
                        const item = media[0];
                        if (item.type === "video") {
                            newPostType = "video";
                            const videoUrl = needsTestUrl(item.url) ? getTestUrl('video', 0) : getAbsoluteUrl(item.url);
                            content.video = { url: videoUrl, name: item.name || "video.mp4" };
                            delete content.image;
                            delete content.media;
                        } else {
                            newPostType = "image";
                            const imageUrl = needsTestUrl(item.url) ? getTestUrl('image', 0) : getAbsoluteUrl(item.url);
                            content.image = { url: imageUrl, name: item.name || "image.jpg", type: item.type, size: item.size };
                            delete content.video;
                            delete content.media;
                        }
                    }
                }

                firestoreUpdate.postType = newPostType;
                firestoreUpdate.content = content;
            }
        }

        // 4. Sanitize and Update Firestore
        const sanitizedUpdate = sanitizeFirestoreData(firestoreUpdate);
        await updateDoc(postRef, sanitizedUpdate);

        if (isPublished) {
            return {
                success: true,
                message: "Post updated locally (Instagram does not support editing captions via API)",
                warning: true
            };
        }

        return {
            success: true,
            message: "Scheduled post updated successfully"
        };

    } catch (error) {
        console.error("Error updating Instagram post:", error);
        return { success: false, message: error.message };
    }
}

/**
 * Recursively remove undefined values from an object and provide defaults
 * Firebase does not support 'undefined' in documents.
 */
function sanitizeFirestoreData(obj) {
    if (obj === null || typeof obj !== 'object') return obj;

    const sanitized = Array.isArray(obj) ? [] : {};

    for (const key in obj) {
        let value = obj[key];

        if (value === undefined) {
            // Provide safe defaults based on common key names or types
            if (key === 'size') value = 0;
            else if (key === 'type' || key === 'name' || key === 'url') value = "";
            else continue; // Skip other undefined fields
        }

        if (value !== null && typeof value === 'object' && !(value instanceof Date)) {
            sanitized[key] = sanitizeFirestoreData(value);
        } else {
            sanitized[key] = value;
        }
    }

    return sanitized;
}
