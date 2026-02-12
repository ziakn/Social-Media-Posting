const { Worker } = require('bullmq');
const { connection } = require('../../lib/queue/config');
const { QUEUE_NAMES } = require('../../lib/queue/queues');
const { initAdmin } = require('../../lib/queue/firebase-admin');
const fetch = require('node-fetch');
const { readFile } = require('fs/promises');
const path = require('path');

const db = initAdmin();

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
    console.log(`[LinkedIn Worker] Registering upload for ${mediaType}: ${mediaUrl}`);

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

    // 2. Resolve Binary
    let buffer;
    if (mediaUrl.startsWith('http')) {
        console.log(`[LinkedIn Worker] Fetching remote media: ${mediaUrl}`);
        const response = await fetch(mediaUrl);
        if (!response.ok) throw new Error(`Failed to fetch media from URL: ${response.statusText}`);
        buffer = await response.buffer();
    } else {
        const relativePath = mediaUrl.startsWith('/') ? mediaUrl.slice(1) : mediaUrl;
        const filePath = path.join(process.cwd(), 'public', relativePath);
        console.log(`[LinkedIn Worker] Reading local media: ${filePath}`);
        buffer = await readFile(filePath);
    }

    // 3. Upload Binary
    console.log(`[LinkedIn Worker] Uploading binary to LinkedIn...`);
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

    console.log(`[LinkedIn Worker] Media upload complete: ${asset}`);
    return asset;
}

/**
 * Main Processor
 */
async function linkedinProcessor(job) {
    const { postId, userId } = job.data;
    if (!postId) return;

    console.log(`[LinkedIn Worker] Processing post ${postId} for User: ${userId}`);

    try {
        const postRef = db.collection('linkedin_posts').doc(postId);
        const postSnap = await postRef.get();

        if (!postSnap.exists) {
            console.log(`[LinkedIn Worker] Post ${postId} not found. Skipping.`);
            return;
        }

        const post = postSnap.data();

        // Safety Check
        if (post.delete === 1) {
            console.log(`[LinkedIn Worker] Post ${postId} marked as deleted. Skipping.`);
            return;
        }

        // Resolve Account
        const accountSnap = await db.collection('socialAccounts').doc(post.accountId).get();
        if (!accountSnap.exists) throw new Error("LinkedIn account not found.");

        const accountData = accountSnap.data();
        if (accountData.status !== 'active') throw new Error("LinkedIn account is inactive.");

        const accessToken = accountData.accessToken;
        const platformUserId = accountData.platformUserId;
        const accountType = accountData.accountType || "person";

        let authorUrn;
        if (accountData.platformUrn) {
            authorUrn = accountData.platformUrn;
        } else {
            authorUrn = accountType === "organization"
                ? `urn:li:organization:${platformUserId}`
                : `urn:li:person:${platformUserId}`;
        }

        // Prepare LinkedIn Body
        let postBody = {
            author: authorUrn,
            lifecycleState: "PUBLISHED",
            specificContent: {
                "com.linkedin.ugc.ShareContent": {
                    shareCommentary: {
                        text: post.text || ""
                    },
                    shareMediaCategory: "NONE"
                }
            },
            visibility: {
                "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"
            }
        };

        // Handle Media (Revised for Multi-Asset)
        const mediaItems = post.content?.media || [];
        if (mediaItems.length > 0) {
            console.log(`[LinkedIn Worker] Processing ${mediaItems.length} media items for post ${postId}`);

            const uploadedAssets = [];
            for (const item of mediaItems) {
                const asset = await uploadMedia(accessToken, authorUrn, item.url, item.type);
                uploadedAssets.push({
                    status: "READY",
                    description: {
                        text: post.text || "Post Media"
                    },
                    media: asset,
                    title: {
                        text: post.text?.substring(0, 30) || "Post Media"
                    }
                });
            }

            // Determine Group Category (Mixes not allowed by UI, so we pick first)
            const overallCategory = mediaItems[0].type.toUpperCase();
            postBody.specificContent["com.linkedin.ugc.ShareContent"].shareMediaCategory = overallCategory === 'VIDEO' ? 'VIDEO' : 'IMAGE';
            postBody.specificContent["com.linkedin.ugc.ShareContent"].media = uploadedAssets;
        } else if (post.videoUrl || post.imageUrl) {
            // Legacy/Fallback for single assets
            const mediaType = post.videoUrl ? "video" : "image";
            const mediaUrl = post.videoUrl || post.imageUrl;

            console.log(`[LinkedIn Worker] Processing legacy ${mediaType} for post ${postId}`);
            const asset = await uploadMedia(accessToken, authorUrn, mediaUrl, mediaType);

            postBody.specificContent["com.linkedin.ugc.ShareContent"].shareMediaCategory = mediaType.toUpperCase();
            postBody.specificContent["com.linkedin.ugc.ShareContent"].media = [{
                status: "READY",
                description: {
                    text: post.text || "Post Media"
                },
                media: asset,
                title: {
                    text: post.text?.substring(0, 30) || "Post Media"
                }
            }];
        }

        // Post to LinkedIn
        console.log(`[LinkedIn Worker] Creating UGC Post on LinkedIn...`);
        console.log(`[LinkedIn Worker] Payload Media Count: ${postBody.specificContent["com.linkedin.ugc.ShareContent"].media?.length}`);
        // console.log(JSON.stringify(postBody, null, 2)); // Uncomment for full debug

        const postRes = await fetch("https://api.linkedin.com/v2/ugcPosts", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${accessToken}`,
                "X-Restli-Protocol-Version": "2.0.0",
                "Content-Type": "application/json",
            },
            body: JSON.stringify(postBody)
        });

        const result = await handleLinkedinResponse(postRes, "create post");

        // Update Firestore
        await postRef.update({
            status: 'posted',
            linkedinPostId: result.id,
            publishedAt: new Date(),
            updatedAt: new Date()
        });

        console.log(`[LinkedIn Worker] Successfully published Post ${postId} (LinkedIn ID: ${result.id})`);

    } catch (error) {
        console.error(`[LinkedIn Worker] Error processing post ${postId}:`, error.message);

        await db.collection('linkedin_posts').doc(postId).update({
            status: 'failed',
            error: error.message,
            updatedAt: new Date()
        });

        throw error;
    }
}

// Start Worker
const worker = new Worker(QUEUE_NAMES.LINKEDIN, linkedinProcessor, {
    connection,
    concurrency: 5,
    lockDuration: 300000, // 5 minutes for video uploads
});

worker.on('failed', (job, err) => {
    console.error(`[LinkedIn Worker] Job ${job.id} failed:`, err.message);
});

console.log("LinkedIn Background Worker IS LIVE");
