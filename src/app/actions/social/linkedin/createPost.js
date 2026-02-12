"use server";

import { db } from "@/lib/firebase";
import { doc, setDoc, serverTimestamp, collection, query, where, getDocs, deleteDoc, updateDoc, getDoc } from "firebase/firestore";

import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import path from 'path';
import { checkVideoMetadata, validatePlatformCompliance, convertVideoForPlatform } from "@/lib/media/videoProcessor";
import { incrementUsage } from "../../usage/incrementUsage";

/**
 * Handle LinkedIn API response
 */
async function handleLinkedinResponse(res, context = "LinkedIn API") {
    let data = {};
    const text = await res.text();
    if (text) {
        try {
            data = JSON.parse(text);
        } catch (e) {
            console.error(`Failed to parse ${context} response:`, text);
        }
    }

    if (!res.ok) {
        const message = data.message || data.error_description || `Failed to ${context}`;
        const error = new Error(message);
        error.status = res.status;
        error.data = data;
        throw error;
    }

    return data;
}

/**
 * Upload Image/Video to LinkedIn
 */
async function uploadMedia(accessToken, ownerUrn, mediaUrl, mediaType) {
    // 1. Register Upload
    const registerRes = await fetch("https://api.linkedin.com/v2/assets?action=registerUpload", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${accessToken}`,
            "X-Restli-Protocol-Version": "2.0.0",
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            registerUploadRequest: {
                recipes: [
                    mediaType === "image"
                        ? "urn:li:digitalmediaRecipe:feedshare-image"
                        : "urn:li:digitalmediaRecipe:feedshare-video"
                ],
                owner: ownerUrn,
                serviceRelationships: [{
                    relationshipType: "OWNER",
                    identifier: "urn:li:userGeneratedContent"
                }]
            }
        })
    });

    const registerData = await handleLinkedinResponse(registerRes, "register upload");
    const uploadUrl = registerData.value.uploadMechanism["com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest"].uploadUrl;
    const asset = registerData.value.asset;

    // 2. Upload Binary
    let buffer;
    if (mediaUrl.startsWith('http')) {
        const response = await fetch(mediaUrl);
        if (!response.ok) throw new Error("Failed to fetch media from URL");
        const arrayBuffer = await response.arrayBuffer();
        buffer = Buffer.from(arrayBuffer);
    } else {
        const relativePath = mediaUrl.startsWith('/') ? mediaUrl.slice(1) : mediaUrl;

        // --- Video Processing Integration ---
        // Basic check based on path (ignoring if http for now unless we download)
        if (mediaType === 'video') {
            try {
                const absolutePath = path.join(process.cwd(), 'public', relativePath);

                // Check & Convert
                const metadata = await checkVideoMetadata(absolutePath);
                const compliance = validatePlatformCompliance('linkedin', metadata);

                let uploadPath = absolutePath;

                if (!compliance.compliant) {
                    console.log("LinkedIn video validation failed:", compliance.reasons);
                    const dir = path.dirname(absolutePath);
                    const ext = path.extname(absolutePath);
                    const basename = path.basename(absolutePath, ext);
                    const outputPath = path.join(dir, `${basename}_linkedin.mp4`); // Force .mp4

                    await convertVideoForPlatform(absolutePath, outputPath);
                    uploadPath = outputPath;
                }

                buffer = await readFile(uploadPath);
            } catch (err) {
                console.warn("Media processing skipped/failed, falling back to original:", err);
                // Fallback to original logic
                const filePath = path.join(process.cwd(), 'public', relativePath);
                buffer = await readFile(filePath);
            }
        } else {
            // Image logic remains simple
            const filePath = path.join(process.cwd(), 'public', relativePath);
            buffer = await readFile(filePath);
        }
    }

    // Safety check if buffer wasn't set by processing block
    if (!buffer) {
        // Should have been set above, but if logic flow falls through (e.g. video processing skipped but buffer not set)
        // This block usually won't be reached if logic is sound, but good for safety
    }

    const uploadRes = await fetch(uploadUrl, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${accessToken}`,
        },
        body: buffer,
    });

    if (!uploadRes.ok) {
        throw new Error(`Failed to upload media to LinkedIn: ${uploadRes.statusText}`);
    }

    return asset;
}

/**
 * Create a LinkedIn Post (Queue-First)
 */
export async function createLinkedinPost({
    text,
    imageUrl,
    videoUrl,
    media,
    scheduledTime,
    accountId: customAccountId,
}) {
    try {
        const user = await verifyToken();
        if (!user) return { success: false, message: "Invalid or expired token" };

        const { checkUsageLimitAction } = await import("@/app/actions/usage/usageActions");
        const usageCheck = await checkUsageLimitAction('post');
        if (!usageCheck.success) return { success: false, message: usageCheck.error };

        const userId = user.id;

        // 1. Resolve Account
        let accountId = customAccountId;
        if (!accountId) {
            const q = query(
                collection(db, "socialAccounts"),
                where("userId", "==", userId),
                where("platform", "==", "linkedin"),
                where("status", "==", "active"),
                limit(1)
            );
            const snapshot = await getDocs(q);
            if (snapshot.empty) return { success: false, message: "LinkedIn account not connected" };
            accountId = snapshot.docs[0].id;
        }

        // 2. Prepare Firestore Document
        const postRef = doc(collection(db, "linkedin_posts"));
        const postId = postRef.id;

        const scheduledAt = scheduledTime ? new Date(scheduledTime) : null;
        const status = scheduledAt ? "scheduled" : "queued";

        const postData = {
            platform: "linkedin",
            userId,
            accountId,
            content: {
                text: text || "",
                media: []
            },
            status,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            delete: 0
        };

        if (media && media.length) {
            postData.content.media = media;
        } else {
            if (imageUrl) postData.content.media.push({ type: "image", url: imageUrl });
            if (videoUrl) postData.content.media.push({ type: "video", url: videoUrl });
        }

        // Backward compatibility for existing UI
        postData.text = text || "";
        postData.imageUrl = (media && media.length && media[0].type === 'image') ? media[0].url : (imageUrl || null);
        postData.videoUrl = (media && media.length && media[0].type === 'video') ? media[0].url : (videoUrl || null);

        if (scheduledAt) postData.scheduledAt = scheduledAt;

        await setDoc(postRef, postData);

        // 3. Sync to Queue
        const { syncPostJob } = await import("@/lib/queue/queues");
        const delay = scheduledAt ? Math.max(0, scheduledAt.getTime() - Date.now()) : 0;

        await syncPostJob("linkedin", postId, {
            postId,
            userId,
            userEmail: user.email,
            pageId: accountId
        }, { delay });

        // 4. Usage
        await incrementUsage(userId);

        return {
            success: true,
            message: scheduledAt ? "Post scheduled successfully" : "Post enqueued for publication",
            postId
        };

    } catch (error) {
        console.error("LinkedIn post creation error:", error);
        return { success: false, message: `Failed to enqueue LinkedIn post: ${error.message}` };
    }
}

export async function deleteLinkedinPostAPI(accessToken, linkedinPostId) {
    try {
        const encodedPostId = encodeURIComponent(linkedinPostId);
        const deleteRes = await fetch(`https://api.linkedin.com/v2/ugcPosts/${encodedPostId}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${accessToken}`,
                "X-Restli-Protocol-Version": "2.0.0",
            },
        });

        if (!deleteRes.ok) {
            throw new Error(`Failed to delete LinkedIn post: ${deleteRes.statusText}`);
        }

        return { success: true, message: "LinkedIn post deleted successfully" };
    } catch (error) {
        console.error("LinkedIn post deletion error:", error);
        return {
            success: false,
            message: `Failed to delete LinkedIn post: ${error.message}`,
        };
    }
}

export async function deletelinkedinPost({ postId }) {
    try {
        const user = await verifyToken();

        if (!user) {
            return { success: false, message: "Invalid token" };
        }

        // Get the post document to find linkedinPostId
        const postRef = doc(db, "linkedin_posts", postId);
        const postSnap = await getDocs(query(collection(db, "linkedin_posts"), where("__name__", "==", postId)));

        if (postSnap.empty) {
            return { success: false, message: "Post not found" };
        }

        const postData = postSnap.docs[0].data();
        const linkedinPostId = postData.linkedinPostId;

        if (linkedinPostId) {
            const accountQuery = query(
                collection(db, "socialAccounts"),
                where("userId", "==", user.id),
                where("platform", "==", "linkedin"),
                where("status", "==", "active")
            );
            const accountSnap = await getDocs(accountQuery);

            if (!accountSnap.empty) {
                const accessToken = accountSnap.docs[0].data().accessToken;
                //  DELETE FROM LINKEDIN
                try {
                    await deleteLinkedinPostAPI(accessToken, linkedinPostId);
                } catch (liError) {
                    console.warn("Failed to delete from LinkedIn API, proceeding with local deletion:", liError);
                }
            }
        }

        //  DELETE FROM FIRESTORE
        await deleteDoc(postRef);

        return { success: true, message: "Post deleted successfully" };
    } catch (err) {
        console.error("Error in deletelinkedinPost:", err);
        return { success: false, message: err.message };
    }
}


export async function replaceLinkedinPost(postDocId, {
    text,
    imageUrl,
    videoUrl,
}) {
    try {
        const user = await verifyToken();
        if (!user) throw new Error("Invalid token");

        // Fetch the existing post to get linkedinPostId
        const postDoc = await getDocs(query(collection(db, "linkedin_posts"), where("__name__", "==", postDocId)));
        if (postDoc.empty) throw new Error("Post not found");
        const existingData = postDoc.docs[0].data();
        const oldLinkedinPostId = existingData.linkedinPostId;
        const accountId = existingData.accountId;

        // Get LinkedIn account specifically used for this post
        let accountDoc;
        if (accountId) {
            accountDoc = await getDoc(doc(db, "socialAccounts", accountId));
        }

        // Fallback or validation
        if (!accountDoc || !accountDoc.exists()) {
            // Try finding any active linkedin account if the specific one is missing (edge case)
            const q = query(
                collection(db, "socialAccounts"),
                where("userId", "==", user.id),
                where("platform", "==", "linkedin"),
                where("status", "==", "active")
            );
            const snapshot = await getDocs(q);
            if (snapshot.empty) throw new Error("LinkedIn not connected");
            accountDoc = snapshot.docs[0];
        }

        const account = accountDoc.data();
        const accessToken = account.accessToken;

        // DELETE OLD LINKEDIN POST if it exists
        if (oldLinkedinPostId) {
            try {
                await deleteLinkedinPostAPI(accessToken, oldLinkedinPostId);
            } catch (liError) {
                console.warn("Failed to delete old LinkedIn post, proceeding:", liError);
            }
        }

        // CREATE NEW POST
        const createResult = await createLinkedinPost({
            text,
            imageUrl: imageUrl || existingData.imageUrl,
            videoUrl: videoUrl || existingData.videoUrl,
            accountId: accountId || accountDoc.id, // Pass the account ID
        });

        if (!createResult.success) throw new Error(createResult.message);

        // UPDATE SAME FIRESTORE DOC
        const postRef = doc(db, "linkedin_posts", postDocId);
        await updateDoc(postRef, {
            text,
            imageUrl: imageUrl || existingData.imageUrl || null,
            videoUrl: videoUrl || existingData.videoUrl || null,
            linkedinPostId: createResult.linkedinPostId,
            updatedAt: serverTimestamp(),
        });

        return { success: true, message: "Post updated successfully" };
    } catch (err) {
        console.error("Error in replaceLinkedinPost:", err);
        return { success: false, message: err.message };
    }
}


