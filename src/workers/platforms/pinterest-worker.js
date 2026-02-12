const { Worker } = require('bullmq');
const { connection } = require('../../lib/queue/config');
const { QUEUE_NAMES } = require('../../lib/queue/queues');
const { initAdmin } = require('../../lib/queue/firebase-admin');
const fetch = require('node-fetch');

const db = initAdmin();

/**
 * Helper: Make Pinterest API Request
 */
async function makePinterestRequest(endpoint, body, accessToken, method = "POST") {
    const PINTEREST_API_URL = process.env.PINTEREST_API_URL || "https://api.pinterest.com/v5";
    const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    const url = `${PINTEREST_API_URL}${path}`;

    const headers = {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
    };

    const options = {
        method,
        headers,
    };

    if (body && (method === "POST" || method === "PATCH")) {
        options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);
    const data = await response.json();

    if (!response.ok) {
        console.error(`[Pinterest Worker] API ERROR ${endpoint}:`, JSON.stringify(data, null, 2));
        throw new Error(data.message || "Pinterest API error");
    }
    return data;
}

/**
 * Helper: Poll for media status (Video)
 */
async function waitForMediaReady(accessToken, mediaId, maxAttempts = 30) {
    const apiUrl = process.env.PINTEREST_API_URL || "https://api.pinterest.com/v5";
    let attempts = 0;

    while (attempts < maxAttempts) {
        attempts++;
        await new Promise(r => setTimeout(r, 5000)); // 5s interval

        const response = await fetch(`${apiUrl}/media/${mediaId}`, {
            headers: { "Authorization": `Bearer ${accessToken}` }
        });

        if (!response.ok) continue;

        const data = await response.json();
        const status = data.status;
        console.log(`[Pinterest Worker] Media ${mediaId} status (${attempts}/${maxAttempts}): ${status}`);

        if (status === "succeeded") return true;
        if (status === "failed") throw new Error("Pinterest failed to process the video.");
    }
    throw new Error("Video processing timed out.");
}

/**
 * Helper: Developer Mode URL Handling
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
        // For carousel testing, Pinterest requires EXACTLY the same aspect ratio.
        // Using a single reliable image for all items ensures this passes.
        return "https://images.unsplash.com/photo-1554080353-a576cf803bda?auto=format&fit=crop&w=1000&h=1000&q=80";
    }
}

async function getAbsoluteUrl(url) {
    if (url.startsWith('http')) return url;
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://your-app-url.com";
    return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
}

/**
 * Main Processor
 */
async function pinterestProcessor(job) {
    const { postId, userId, userEmail } = job.data;
    if (!postId) return;

    console.log(`[Pinterest Worker] Processing post ${postId} for User: ${userEmail || userId}`);

    try {
        const postRef = db.collection('pinterest_posts').doc(postId);
        const postSnap = await postRef.get();
        if (!postSnap.exists) {
            console.log(`[Pinterest Worker] Post ${postId} not found. Skipping.`);
            return;
        }

        const post = postSnap.data();

        // 1. Safety Check: Skip if deleted
        if (post.delete === 1) {
            console.log(`[Pinterest Worker] Post ${postId} marked as deleted. Skipping.`);
            return;
        }

        // 2. Resolve Account & Token
        const accountSnap = await db.collection('socialAccounts')
            .where('userId', '==', userId)
            .where('accountId', '==', post.accountId)
            .where('platform', '==', 'pinterest')
            .where('status', '==', 'active')
            .limit(1)
            .get();

        if (accountSnap.empty) throw new Error("Pinterest account not found or inactive.");
        const account = accountSnap.docs[0].data();
        const accessToken = account.accessToken;

        // 3. Process Content
        const postType = post.postType || "image";
        const content = post.content || {};
        const media = content.media || [];
        const title = post.title || "";
        const message = post.message || post.description || "";
        const link = post.link || "";
        const boardId = post.boardId;

        let mediaSource = {};

        if (postType === "carousel") {
            const items = await Promise.all(media.map(async (item, index) => {
                const mediaUrl = needsTestUrl(item.url) ? getTestUrl("image", index) : await getAbsoluteUrl(item.url);
                return {
                    title: title,
                    description: message,
                    link: link,
                    url: mediaUrl
                };
            }));
            mediaSource = {
                source_type: "multiple_image_urls",
                items: items
            };
        } else if (postType === "video") {
            const item = media[0] || {};
            const mediaUrl = needsTestUrl(item.url) ? getTestUrl("video") : await getAbsoluteUrl(item.url);

            // flow: Register -> Upload -> Poll
            const registerData = await makePinterestRequest("/media", { media_type: "video" }, accessToken);
            const { media_id, upload_url, upload_parameters } = registerData;

            // Fetch video stream
            const videoResponse = await fetch(mediaUrl);
            if (!videoResponse.ok) throw new Error("Failed to fetch source video file.");
            const videoBuffer = await videoResponse.buffer();

            // Construction Form Data (Using polyfill-free approach if possible, or just standard Node logic)
            // But Pinterest requires multipart/form-data. In worker context, we'll use form-data package.
            const FormData = require('form-data');
            const form = new FormData();
            for (const [key, value] of Object.entries(upload_parameters)) {
                form.append(key, value);
            }
            form.append("file", videoBuffer, { filename: "video.mp4" });

            console.log(`[Pinterest Worker] Uploading video file for ${postId} to storage...`);
            const uploadResponse = await fetch(upload_url, {
                method: "POST",
                body: form
            });

            if (!uploadResponse.ok) throw new Error("Video upload failed.");

            // Wait for processing
            await waitForMediaReady(accessToken, media_id);

            mediaSource = {
                source_type: "video_id",
                media_id: media_id,
                cover_image_key_frame_time: 0
            };
        } else {
            // Default: Image
            const item = media[0] || {};
            const mediaUrl = needsTestUrl(item.url) ? getTestUrl("image") : await getAbsoluteUrl(item.url);
            mediaSource = {
                source_type: "image_url",
                url: mediaUrl
            };
        }

        // 4. Create Pin
        const pinData = {
            board_id: boardId,
            title: title,
            description: message,
            media_source: mediaSource
        };
        // Sanitize link
        if (link && !link.includes("localhost")) {
            pinData.link = link;
        }

        console.log(`[Pinterest Worker] Creating Pin for ${postId}...`);
        console.log(`[Pinterest Worker] Source Type: ${pinData.media_source?.source_type}`);
        console.log(`[Pinterest Worker] Item Count: ${pinData.media_source?.items?.length}`);

        const result = await makePinterestRequest("/pins", pinData, accessToken);

        // 5. Update Firestore
        await postRef.update({
            status: 'published',
            pinterestPinId: result.id,
            publishedAt: new Date(),
            updatedAt: new Date()
        });

        console.log(`[Pinterest Worker] Successfully published Pin ${result.id} for post ${postId}`);

    } catch (error) {
        console.error(`[Pinterest Worker] Error processing post ${postId}:`, error.message);
        await db.collection('pinterest_posts').doc(postId).update({
            status: 'failed',
            error: error.message,
            updatedAt: new Date()
        });
        throw error;
    }
}

const worker = new Worker(QUEUE_NAMES.PINTEREST, pinterestProcessor, {
    connection,
    concurrency: 10,
    lockDuration: 300000, // 5 mins
});

worker.on('failed', (job, err) => {
    console.error(`[Pinterest Worker] Job ${job.id} failed:`, err.message);
});

console.log("Pinterest Background Worker IS LIVE");
