const { Worker } = require('bullmq');
const { connection } = require('../../lib/queue/config');
const { QUEUE_NAMES } = require('../../lib/queue/queues');
const { initAdmin } = require('../../lib/queue/firebase-admin');

// 1. Initialize Firebase Admin
const db = initAdmin();

/**
 * Instagram API Helpers
 */
async function makeInstagramRequest(endpoint, formData, accessToken) {
    formData.append("access_token", accessToken);
    const response = await fetch(`https://graph.instagram.com/v24.0${endpoint}`, {
        method: "POST",
        body: formData,
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || "Instagram API error");
    return data;
}

async function createMediaContainer(instagramId, mediaData, accessToken, isCarouselContainer = false) {
    const formData = new FormData();

    if (mediaData.image_url) formData.append("image_url", mediaData.image_url);
    if (mediaData.video_url) formData.append("video_url", mediaData.video_url);
    if (mediaData.caption && mediaData.media_type !== "STORIES") formData.append("caption", mediaData.caption);
    if (mediaData.is_carousel_item) formData.append("is_carousel_item", "true");
    if (mediaData.media_type) formData.append("media_type", mediaData.media_type);

    if (isCarouselContainer && mediaData.children) {
        formData.append("children", mediaData.children.join(","));
        formData.append("media_type", "CAROUSEL");
    }

    const container = await makeInstagramRequest(`/${instagramId}/media`, formData, accessToken);
    return container.id;
}

async function publishMediaContainer(instagramId, containerId, accessToken) {
    const formData = new FormData();
    formData.append("creation_id", containerId);
    return await makeInstagramRequest(`/${instagramId}/media_publish`, formData, accessToken);
}

async function checkMediaStatus(containerId, accessToken) {
    const response = await fetch(
        `https://graph.instagram.com/v24.0/${containerId}?fields=status_code,status&access_token=${accessToken}`
    );
    return await response.json();
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
                containerId = await createMediaContainer(instagramId, { image_url: post.content.image.url, caption }, accessToken);
                await waitForMediaReady(containerId, accessToken, 6);
                break;

            case "video":
                containerId = await createMediaContainer(instagramId, { video_url: post.content.video.url, caption, media_type: "REELS" }, accessToken);
                await waitForMediaReady(containerId, accessToken, 20); // Videos take longer
                break;

            case "carousel":
                const processedMedia = post.content.media || [];
                const childIds = [];
                for (const item of processedMedia) {
                    const mediaData = item.type === 'video' ? { video_url: item.url } : { image_url: item.url };
                    const childId = await createMediaContainer(instagramId, { ...mediaData, is_carousel_item: true }, accessToken);
                    await waitForMediaReady(childId, accessToken, item.type === 'video' ? 15 : 6);
                    childIds.push(childId);
                }
                containerId = await createMediaContainer(instagramId, { caption, children: childIds }, accessToken, true);
                await waitForMediaReady(containerId, accessToken, 6);
                break;

            case "story":
                const storyMedia = post.content.media;
                const mediaData = storyMedia.type === 'video' ? { video_url: storyMedia.url } : { image_url: storyMedia.url };
                containerId = await createMediaContainer(instagramId, { ...mediaData, media_type: "STORIES" }, accessToken);
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
    lockDuration: 120000, // 2 minutes lock for long processing
});

worker.on('failed', (job, err) => {
    console.error(`[Instagram Worker] Job ${job.id} failed:`, err.message);
});

console.log("Instagram Background Worker IS LIVE");
