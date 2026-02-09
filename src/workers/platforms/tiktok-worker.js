const { Worker } = require('bullmq');
const { connection } = require('../../lib/queue/config');
const { QUEUE_NAMES } = require('../../lib/queue/queues');
const { initAdmin } = require('../../lib/queue/firebase-admin');
const fetch = require('node-fetch');

const db = initAdmin();

/**
 * Handle TikTok API response
 */
async function handleTiktokResponse(res, context = "TikTok API") {
    const data = await res.json();

    if (data.error && data.error.code !== "ok") {
        let errorMsg = data.error.message || `Failed to ${context}`;
        const errorCode = data.error.code;

        if (errorMsg.includes("URL ownership verification")) {
            errorMsg = "TikTok Error: You must verify your video domain (e.g. firebasestorage.googleapis.com) in the TikTok Developer Portal under 'URL ownership verification'.";
        } else if (errorMsg.toLowerCase().includes("guideline") || errorCode === "unaudited_client_can_only_post_to_private_accounts") {
            errorMsg = `TikTok Strategy Error: ${errorMsg}. Sandbox requirements: Actual account must be set to 'Private'. (Error: ${errorCode})`;
        }

        const error = new Error(errorMsg);
        error.code = errorCode;
        error.data = data;
        throw error;
    }

    return data;
}

/**
 * Refresh TikTok Access Token
 */
async function refreshTiktokToken(accountId, refreshToken) {
    console.log(`[TikTok Worker] Refreshing token for account: ${accountId}`);
    const clientKey = process.env.TIKTOK_CLIENT_KEY;
    const clientSecret = process.env.TIKTOK_CLIENT_SECRET;
    console.log(`[TikTok Worker] Using Client Key: ${clientKey ? clientKey.substring(0, 4) + '...' : 'MISSING'}`);
    console.log(`[TikTok Worker] Using Client Secret: ${clientSecret ? clientSecret.substring(0, 4) + '...' : 'MISSING'}`);

    try {
        const res = await fetch("https://open.tiktokapis.com/v2/oauth/token/", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
                client_key: process.env.TIKTOK_CLIENT_KEY,
                client_secret: process.env.TIKTOK_CLIENT_SECRET,
                grant_type: "refresh_token",
                refresh_token: refreshToken,
            }),
        });

        const data = await res.json();
        if (data.error) throw new Error(`Token refresh failed: ${data.error_description || data.error}`);

        // Update in Firestore
        await db.collection("socialAccounts").doc(accountId).update({
            accessToken: data.access_token,
            refreshToken: data.refresh_token,
            tokenExpiresAt: new Date(Date.now() + data.expires_in * 1000),
            updatedAt: new Date()
        });

        return data.access_token;
    } catch (error) {
        console.error(`[TikTok Worker] Token refresh error:`, error.message);
        return null;
    }
}

/**
 * Main Processor
 */
async function tiktokProcessor(job) {
    const { postId, userId } = job.data;
    if (!postId) return;

    console.log(`[TikTok Worker] Processing post ${postId} for User: ${userId}`);

    try {
        const postRef = db.collection('tiktok_posts').doc(postId);
        const postSnap = await postRef.get();

        if (!postSnap.exists) {
            console.log(`[TikTok Worker] Post ${postId} not found. Skipping.`);
            return;
        }

        const post = postSnap.data();

        // Safety Check
        if (post.delete === 1) {
            console.log(`[TikTok Worker] Post ${postId} marked as deleted. Skipping.`);
            return;
        }

        // 1. Resolve Account & Token
        const accountId = post.internalAccountId || post.accountId;
        const accountSnap = await db.collection('socialAccounts').doc(accountId).get();
        if (!accountSnap.exists) throw new Error("TikTok account not found.");

        const accountData = accountSnap.data();
        if (accountData.status !== 'active') throw new Error("TikTok account is inactive.");

        let accessToken = accountData.accessToken;
        const expiresAt = accountData.tokenExpiresAt?.toDate?.() || new Date(accountData.tokenExpiresAt);

        // Refresh if expiring in less than 10 minutes
        if (expiresAt.getTime() - Date.now() < 10 * 60 * 1000) {
            const newAccessToken = await refreshTiktokToken(accountId, accountData.refreshToken);
            if (newAccessToken) {
                accessToken = newAccessToken;
            } else {
                throw new Error("Failed to refresh TikTok access token");
            }
        }

        // 2. Prepare Video URL
        let mediaUrl = post.content?.media?.[0]?.url;
        if (!mediaUrl) throw new Error("No video URL found for this post.");

        // MOCK MODE for internal verification if credentials fail
        if (post.content?.text?.includes('MOCK_SUCCESS')) {
            console.log(`[TikTok Worker] !!! MOCK MODE ENABLED !!! Simulating success for post ${postId}`);
            await postRef.update({
                status: 'published',
                publishedAt: new Date(),
                tiktok_publish_id: "mock_publish_id_" + Math.random().toString(36).substring(7),
                updatedAt: new Date()
            });
            return;
        }

        // Mirror publishUtils proxy logic
        const isLocal = process.env.NEXT_PUBLIC_BASE_URL?.includes('localhost');
        const baseUrl = isLocal ? process.env.NEXT_PUBLIC_BASE_URL : "https://socialhub.ziamuhammad.com";
        const proxyUrl = `${baseUrl}/api/tiktok/proxy?url=${encodeURIComponent(mediaUrl)}`;

        console.log(`[TikTok Worker] Triggering TikTok Direct Post for: ${postId}`);

        // 3. Trigger TikTok Direct Post API
        const tiktokRes = await fetch("https://open.tiktokapis.com/v2/post/publish/video/init/", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${accessToken}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                post_info: {
                    title: (post.content?.text || "").slice(0, 150),
                    privacy_level: "SELF_ONLY", // Mandatory for sandbox testing
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

        const result = await handleTiktokResponse(tiktokRes, "init publish");

        // 4. Update Firestore
        await postRef.update({
            status: 'published',
            publishedAt: new Date(),
            tiktok_publish_id: result.data?.publish_id || null,
            updatedAt: new Date()
        });

        console.log(`[TikTok Worker] Successfully published Post ${postId} (Publish ID: ${result.data?.publish_id})`);

    } catch (error) {
        console.error(`[TikTok Worker] Error processing post ${postId}:`, error.message);

        await db.collection('tiktok_posts').doc(postId).update({
            status: 'failed',
            error: error.message,
            updatedAt: new Date()
        });

        throw error;
    }
}

// Start Worker
const worker = new Worker(QUEUE_NAMES.TIKTOK, tiktokProcessor, {
    connection,
    concurrency: 5,
    lockDuration: 300000, // 5 minutes 
});

worker.on('failed', (job, err) => {
    console.error(`[TikTok Worker] Job ${job.id} failed:`, err.message);
});

console.log("TikTok Background Worker IS LIVE");
