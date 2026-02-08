const { Worker } = require('bullmq');
const { connection } = require('../../lib/queue/config');
const { QUEUE_NAMES } = require('../../lib/queue/queues');
const { initAdmin } = require('../../lib/queue/firebase-admin');
const fs = require('fs');
const path = require('path');

const DEBUG_LOG = path.join(process.cwd(), 'instagram-worker-debug.log');

function logDebug(message, data = null) {
    const timestamp = new Date().toISOString();
    let text = `[${timestamp}] ${message}`;
    if (data) text += `\n${JSON.stringify(data, null, 2)}`;
    try {
        fs.appendFileSync(DEBUG_LOG, text + '\n\n');
    } catch (err) {
        console.error("Failed to write to debug log:", err.message);
    }
}

// 1. Initialize Firebase Admin
const db = initAdmin();

/**
 * URL Helpers for Development
 */
function needsTestUrl(url) {
    if (!url) return true;
    if (url.startsWith('blob:')) return true;
    if (url.startsWith('/')) return true;
    if (!url.startsWith('http')) return true;
    if (url.includes('localhost') || url.includes('127.0.0.1')) return true;
    return false;
}

function getTestUrl(type, index = 0) {
    const seed = Date.now() + index;
    if (type === 'video') {
        const videos = [
            "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
            "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4"
        ];
        return `${videos[index % videos.length]}?t=${seed}`;
    } else {
        const images = [
            "https://images.unsplash.com/photo-1554080353-a576cf803bda?auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1000&q=80"
        ];
        return `${images[index % images.length]}?auto=format&fit=crop&w=1000&q=80&t=${seed}`;
    }
}

/**
 * Instagram API Helpers
 */
async function makeInstagramRequest(endpoint, params, accessToken) {
    params.append("access_token", accessToken);

    // Create debug version of params
    const debugParams = new URLSearchParams(params);
    debugParams.set("access_token", "REDACTED");

    logDebug(`API POST ${endpoint}`, Object.fromEntries(debugParams.entries()));

    const response = await fetch(`https://graph.instagram.com/v24.0${endpoint}`, {
        method: "POST",
        body: params // Sending as application/x-www-form-urlencoded
    });

    const data = await response.json();

    if (!response.ok) {
        logDebug(`API ERROR ${endpoint}`, data);
        console.error(`[Instagram Worker] API ERROR:`, JSON.stringify(data, null, 2));
        throw new Error(data.error?.message || "Instagram API error");
    }
    logDebug(`API SUCCESS ${endpoint}`, data);
    return data;
}

async function createMediaContainer(instagramId, mediaData, accessToken, isCarouselContainer = false) {
    const params = new URLSearchParams();

    if (isCarouselContainer) {
        params.append("media_type", "CAROUSEL");
        if (mediaData.children) params.append("children", mediaData.children.join(","));
        if (mediaData.caption) params.append("caption", mediaData.caption);
    } else {
        if (mediaData.is_carousel_item) params.append("is_carousel_item", "true");

        if (mediaData.video_url) {
            params.append("video_url", mediaData.video_url);
            // Standalone video = REELS, Carousel video = VIDEO, Story video = STORIES
            if (mediaData.media_type) {
                params.append("media_type", mediaData.media_type);
            } else {
                params.append("media_type", mediaData.is_carousel_item ? "VIDEO" : "REELS");
            }
        } else if (mediaData.image_url) {
            params.append("image_url", mediaData.image_url);
            if (mediaData.media_type) {
                params.append("media_type", mediaData.media_type);
            } else {
                params.append("media_type", "IMAGE");
            }
        }

        // Add caption if not a carousel item and not a story
        if (!mediaData.is_carousel_item && mediaData.media_type !== "STORIES" && mediaData.caption) {
            params.append("caption", mediaData.caption);
        }
    }

    const container = await makeInstagramRequest(`/${instagramId}/media`, params, accessToken);
    return container.id;
}

async function publishMediaContainer(instagramId, containerId, accessToken) {
    const params = new URLSearchParams();
    params.append("creation_id", containerId);
    return await makeInstagramRequest(`/${instagramId}/media_publish`, params, accessToken);
}

async function checkMediaStatus(containerId, accessToken) {
    const response = await fetch(
        `https://graph.instagram.com/v24.0/${containerId}?fields=status_code,status&access_token=${accessToken}`
    );
    const data = await response.json();
    logDebug(`POLL Container ${containerId}`, data);
    return data;
}

/**
 * Poll for media readiness
 */
async function waitForMediaReady(containerId, accessToken, maxAttempts = 15, interval = 5000) {
    let attempts = 0;
    while (attempts < maxAttempts) {
        const status = await checkMediaStatus(containerId, accessToken);
        console.log(`[Instagram Worker] Container ${containerId} status: ${status.status_code}`);

        if (status.status_code === "FINISHED") return true;
        if (status.status_code === "ERROR") throw new Error(`Media processing failed: ${status.status}`);

        attempts++;
        await new Promise(r => setTimeout(r, interval));
    }
    throw new Error(`Media not ready after ${maxAttempts} attempts`);
}

/**
 * Main Instagram Worker Processor
 */
async function instagramProcessor(job) {
    const { postId, userId, userEmail } = job.data;
    if (!postId) return;

    console.log(`[Instagram Worker] Processing post ${postId} for User: ${userEmail || userId || 'Unknown'}`);

    try {
        const postRef = db.collection('instagram_posts').doc(postId);
        const postSnap = await postRef.get();
        if (!postSnap.exists) {
            console.log(`[Instagram Worker] Post ${postId} not found in Firestore. Skipping.`);
            return;
        }

        const post = postSnap.data();
        console.log(`[Instagram Worker] DEBUG - Post ID: ${postId}`);
        console.log(`[Instagram Worker] DEBUG - Firestore.userId: "${post.userId}"`);
        console.log(`[Instagram Worker] DEBUG - Firestore.pageId: "${post.pageId}"`);
        console.log(`[Instagram Worker] DEBUG - Firestore.platform: "${post.platform}"`);

        // 1. Safety Check: Skip if soft-deleted
        if (post.delete === 1) {
            console.log(`[Instagram Worker] Post ${postId} marked as deleted. Skipping.`);
            return;
        }

        // 2. Status Check: Skip if already published
        if (post.status === 'published' && post.instagramPostId) {
            console.log(`[Instagram Worker] Post ${postId} already published. Skipping.`);
            return;
        }

        // 3. Get Access Token
        console.log(`[Instagram Worker] 🔍 Lookup Info: User="${post.userId}", Page="${post.pageId}"`);

        const accountSnap = await db.collection('socialAccounts')
            .where('userId', '==', post.userId)
            .where('platform', '==', 'instagram')
            .get();

        console.log(`[Instagram Worker] 📂 Accounts Found: ${accountSnap.size}`);

        let accessToken = null;
        let instagramId = post.pageId;

        // Try to find the specific account that has this ID
        for (const docSnap of accountSnap.docs) {
            const data = docSnap.data();
            console.log(`[Instagram Worker] 📋 Checking Account Record: ${docSnap.id}`);
            console.log(`   - DB.accountId: "${data.accountId}"`);
            console.log(`   - DB.igUserId:  "${data.igUserId}"`);
            console.log(`   - DB.status:    "${data.status}"`);

            // In getPages.js, igUserId maps to data.accountId. We also check .igUserId for safety.
            if (String(data.accountId) === String(post.pageId) || String(data.igUserId) === String(post.pageId)) {
                accessToken = data.accessToken;
                console.log(`[Instagram Worker] ✅ Found token in ${docSnap.id}`);
                break;
            }
        }

        if (!accessToken) {
            console.log(`[Instagram Worker] ⚠️ Exact match failed. Searching across ALL users for Page ID ${post.pageId}...`);
            const broadSnap = await db.collection('socialAccounts')
                .where('platform', '==', 'instagram')
                .get();

            console.log(`[Instagram Worker] 📂 Total IG accounts in DB: ${broadSnap.size}`);
            for (const docSnap of broadSnap.docs) {
                const data = docSnap.data();
                if (String(data.accountId) === String(post.pageId) || String(data.igUserId) === String(post.pageId)) {
                    accessToken = data.accessToken;
                    console.log(`[Instagram Worker] ✅ Found token via broad search in Account ${docSnap.id} (Owner: ${data.userId})`);
                    break;
                }
            }
        }

        if (!accessToken) throw new Error(`Instagram access token not found for Account ID ${post.pageId}`);

        let containerId = null;
        const caption = post.content?.caption || "";

        // 4. Handle Different Post Types
        switch (post.postType) {
            case "image":
                const imgUrl = needsTestUrl(post.content.image.url) ? getTestUrl('image') : post.content.image.url;
                containerId = await createMediaContainer(instagramId, { image_url: imgUrl, caption }, accessToken);
                await waitForMediaReady(containerId, accessToken, 6);
                break;

            case "video":
                const vidUrl = needsTestUrl(post.content.video.url) ? getTestUrl('video') : post.content.video.url;
                containerId = await createMediaContainer(instagramId, { video_url: vidUrl, caption, media_type: "REELS" }, accessToken);
                await waitForMediaReady(containerId, accessToken, 20); // Videos take longer
                break;

            case "carousel":
                const processedMedia = post.content.media || [];
                const childIds = [];
                for (let i = 0; i < processedMedia.length; i++) {
                    const item = processedMedia[i];
                    const url = needsTestUrl(item.url) ? getTestUrl(item.type, i) : item.url;

                    // CRITICAL: Ensure media_type is set and correct field is used
                    const mediaData = item.type === 'video'
                        ? { video_url: url, media_type: "VIDEO" }
                        : { image_url: url, media_type: "IMAGE" };

                    console.log(`[Instagram Worker] Creating carousel item ${i + 1}:`, mediaData.media_type);

                    const childId = await createMediaContainer(instagramId, { ...mediaData, is_carousel_item: true }, accessToken);
                    await waitForMediaReady(childId, accessToken, item.type === 'video' ? 15 : 6);
                    childIds.push(childId);
                }
                containerId = await createMediaContainer(instagramId, { caption, children: childIds }, accessToken, true);
                await waitForMediaReady(containerId, accessToken, 6);
                break;

            case "story":
                const storyMedia = post.content.media;
                const sUrl = needsTestUrl(storyMedia.url) ? getTestUrl(storyMedia.type) : storyMedia.url;
                const sData = storyMedia.type === 'video' ? { video_url: sUrl } : { image_url: sUrl };
                containerId = await createMediaContainer(instagramId, { ...sData, media_type: "STORIES" }, accessToken);
                await waitForMediaReady(containerId, accessToken, storyMedia.type === 'video' ? 15 : 6);
                break;

            default:
                throw new Error(`Unsupported Instagram post type: ${post.postType}`);
        }

        // 5. Publish
        const publishResult = await publishMediaContainer(instagramId, containerId, accessToken);

        // 6. Update Firestore
        await postRef.update({
            status: 'published',
            instagramPostId: publishResult.id,
            instagramContainerId: containerId,
            publishedAt: new Date(),
            updatedAt: new Date()
        });

        console.log(`[Instagram Worker] Published post ${postId}. IG ID: ${publishResult.id}`);

    } catch (error) {
        console.error(`[Instagram Worker] Error:`, error.message);
        await db.collection('instagram_posts').doc(postId).update({
            status: 'failed',
            error: error.message,
            updatedAt: new Date()
        });
        throw error;
    }
}

const worker = new Worker(QUEUE_NAMES.INSTAGRAM, instagramProcessor, {
    connection,
    concurrency: 20, // Lower concurrency for IG due to heavier polling
    lockDuration: 300000, // 5 minutes lock for long processing (especially videos)
});

worker.on('failed', (job, err) => {
    console.error(`[Instagram Worker] Job ${job.id} failed:`, err.message);
});

console.log("Instagram Background Worker IS LIVE");
