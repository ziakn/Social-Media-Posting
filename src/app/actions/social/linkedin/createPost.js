"use server";

import { db } from "@/lib/firebase";
import { doc, setDoc, serverTimestamp, collection, query, where, getDocs, deleteDoc, updateDoc, getDoc } from "firebase/firestore";

import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { readFile } from 'fs/promises';
import path from 'path';
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
async function uploadMedia(accessToken, platformUserId, mediaUrl, mediaType) {
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
                owner: `urn:li:person:${platformUserId}`,
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
        const filePath = path.join(process.cwd(), 'public', relativePath);
        buffer = await readFile(filePath);
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
 * Create a LinkedIn Post
 */
export async function createLinkedinPost({
    text,
    imageUrl,
    videoUrl,
    scheduledTime,
    accountId: customAccountId,
}) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;
        const user = await verifyToken(token);

        if (!user) {
            return { success: false, message: "Invalid or expired token" };
        }

        const userId = user.id;

        // 1. Get LinkedIn Access Token from Firestore
        let accountDoc;
        if (customAccountId) {
            accountDoc = await getDoc(doc(db, "socialAccounts", customAccountId));
            if (!accountDoc.exists() || accountDoc.data().userId !== userId) {
                return { success: false, message: "LinkedIn account not found or access denied" };
            }
        } else {
            const q = query(
                collection(db, "socialAccounts"),
                where("userId", "==", userId),
                where("platform", "==", "linkedin"),
                where("status", "==", "active")
            );
            const snapshot = await getDocs(q);

            if (snapshot.empty) {
                return { success: false, message: "LinkedIn account not connected" };
            }

            accountDoc = snapshot.docs[0];
        }

        const accountData = accountDoc.data();
        const accessToken = accountData.accessToken;
        const platformUserId = accountData.platformUserId;
        const accountId = accountDoc.id;

        let result;
        if (scheduledTime) {
            // Store as scheduled in DB
            result = { success: true, scheduled: true };
        } else {
            // Immediate post
            let postBody = {
                author: `urn:li:person:${platformUserId}`,
                lifecycleState: "PUBLISHED",
                specificContent: {
                    "com.linkedin.ugc.ShareContent": {
                        shareCommentary: {
                            text: text || ""
                        },
                        shareMediaCategory: "NONE"
                    }
                },
                visibility: {
                    "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"
                }
            };

            if (imageUrl || videoUrl) {
                const mediaType = imageUrl ? "image" : "video";
                const mediaUrl = imageUrl || videoUrl;
                const asset = await uploadMedia(accessToken, platformUserId, mediaUrl, mediaType);

                postBody.specificContent["com.linkedin.ugc.ShareContent"].shareMediaCategory = mediaType.toUpperCase();
                postBody.specificContent["com.linkedin.ugc.ShareContent"].media = [{
                    status: "READY",
                    description: {
                        text: text || "Post Media"
                    },
                    media: asset,
                    title: {
                        text: text?.substring(0, 30) || "Post Media"
                    }
                }];
            }

            const postRes = await fetch("https://api.linkedin.com/v2/ugcPosts", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${accessToken}`,
                    "X-Restli-Protocol-Version": "2.0.0",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(postBody)
            });

            const postData = await handleLinkedinResponse(postRes, "create post");
            result = { success: true, linkedinPostId: postData.id };
        }

        // Save to Firestore
        const postRef = doc(collection(db, "linkedin_posts"));
        const postId = postRef.id;

        const postData = {
            platform: "linkedin",
            userId,
            accountId,
            text,
            imageUrl: imageUrl || null,
            videoUrl: videoUrl || null,
            status: scheduledTime ? "scheduled" : "posted",
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        };

        if (scheduledTime) {
            postData.scheduledAt = new Date(scheduledTime);
        } else {
            postData.linkedinPostId = result.linkedinPostId;
        }

        await setDoc(postRef, postData);

        return {
            success: true,
            message: scheduledTime ? "Post scheduled successfully" : "Post created successfully on LinkedIn",
            postId,
            linkedinPostId: result.linkedinPostId
        };

    } catch (error) {
        console.error("LinkedIn post creation error:", error);
        return {
            success: false,
            message: `Failed to create LinkedIn post: ${error.message}`,
        };
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
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;
        const user = await verifyToken(token);

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
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;
        const user = await verifyToken(token);
        if (!user) throw new Error("Invalid token");

        // Fetch the existing post to get linkedinPostId
        const postDoc = await getDocs(query(collection(db, "linkedin_posts"), where("__name__", "==", postDocId)));
        if (postDoc.empty) throw new Error("Post not found");
        const existingData = postDoc.docs[0].data();
        const oldLinkedinPostId = existingData.linkedinPostId;

        // Get LinkedIn account
        const q = query(
            collection(db, "socialAccounts"),
            where("userId", "==", user.id),
            where("platform", "==", "linkedin"),
            where("status", "==", "active")
        );
        const snapshot = await getDocs(q);
        if (snapshot.empty) throw new Error("LinkedIn not connected");

        const account = snapshot.docs[0].data();
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


