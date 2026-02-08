const { Worker } = require('bullmq');
const { connection } = require('../../lib/queue/config');
const { QUEUE_NAMES } = require('../../lib/queue/queues');
const { initAdmin } = require('../../lib/queue/firebase-admin');

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
 * Threads API Helpers
 */
async function makeThreadsRequest(endpoint, params, accessToken, method = "POST") {
    const url = new URL(`https://graph.threads.net/v1.0${endpoint}`);

    let body = null;
    if (method === "POST") {
        body = new URLSearchParams({
            access_token: accessToken,
            ...params
        });
    } else {
        url.search = new URLSearchParams({
            access_token: accessToken,
            ...params
        }).toString();
    }

    const response = await fetch(url.toString(), {
        method,
        body,
    });

    const data = await response.json();
    if (!response.ok) {
        console.error(`[Threads Worker] API Error ${endpoint}:`, JSON.stringify(data, null, 2));
        throw new Error(data.error?.message || "Threads API error");
    }
    return data;
}

async function checkThreadStatus(containerId, accessToken) {
    return await makeThreadsRequest(`/${containerId}`, {
        fields: "status,error_message"
    }, accessToken, "GET");
}

async function waitForMediaReady(containerId, accessToken, maxAttempts = 30) {
    let attempts = 0;
    while (attempts < maxAttempts) {
        await new Promise(r => setTimeout(r, 3000));
        const status = await checkThreadStatus(containerId, accessToken);
        console.log(`[Threads Worker] Container ${containerId} status: ${status.status}`);

        if (status.status === 'FINISHED') return true;
        if (status.status === 'ERROR') {
            throw new Error(`Threads media error: ${status.error_message || 'Unknown error'}`);
        }
        attempts++;
    }
    throw new Error(`Media not ready after ${maxAttempts} attempts`);
}

/**
 * Main Threads Worker Processor
 */
async function threadsProcessor(job) {
    const { postId, userId, userEmail } = job.data;
    if (!postId) return;

    console.log(`[Threads Worker] Processing post ${postId} for User: ${userEmail || userId}`);

    try {
        const postRef = db.collection('threads_posts').doc(postId);
        const postSnap = await postRef.get();
        if (!postSnap.exists) {
            console.log(`[Threads Worker] Post ${postId} not found in Firestore. Skipping.`);
            return;
        }

        const post = postSnap.data();

        // 1. Safety Check: Skip if deleted
        if (post.delete === 1) {
            console.log(`[Threads Worker] Post ${postId} marked as deleted. Skipping.`);
            return;
        }

        // 2. Status Check: Skip if already published
        if (post.status === 'published' && post.threadsPostId) {
            console.log(`[Threads Worker] Post ${postId} already published. Skipping.`);
            return;
        }

        // 3. Get Account Token
        const accountSnap = await db.collection('socialAccounts')
            .where('userId', '==', post.userId)
            .where('platform', '==', 'threads')
            .where('accountId', '==', post.accountId)
            .get();

        if (accountSnap.empty) {
            throw new Error(`Threads account not found for Account ID ${post.accountId}`);
        }

        const account = accountSnap.docs[0].data();
        const accessToken = account.accessToken;
        const accountId = account.accountId;

        const text = post.content?.text || "";
        const media = post.content?.media || [];
        const linkAttachment = post.content?.linkAttachment;

        let creationId = null;

        // 4. Handle Post Types
        if (media.length > 1) {
            // Carousel Post
            const childIds = [];
            for (let i = 0; i < media.length; i++) {
                const item = media[i];
                const url = needsTestUrl(item.url) ? getTestUrl(item.type, i) : item.url;

                const childParams = {
                    is_carousel_item: true,
                    media_type: item.type?.toUpperCase() || "IMAGE",
                };
                if (childParams.media_type === "IMAGE") childParams.image_url = url;
                if (childParams.media_type === "VIDEO") childParams.video_url = url;

                console.log(`[Threads Worker] Creating carousel item ${i + 1}: ${childParams.media_type}`);
                const childContainer = await makeThreadsRequest(`/${accountId}/threads`, childParams, accessToken);
                await waitForMediaReady(childContainer.id, accessToken);
                childIds.push(childContainer.id);
            }

            const carouselParams = {
                media_type: "CAROUSEL",
                children: childIds.join(","),
            };
            if (text) carouselParams.text = text;

            const carouselContainer = await makeThreadsRequest(`/${accountId}/threads`, carouselParams, accessToken);
            creationId = carouselContainer.id;
        } else {
            // Single Media or Text Post
            const params = {};
            if (media.length === 1) {
                const item = media[0];
                const url = needsTestUrl(item.url) ? getTestUrl(item.type) : item.url;

                params.media_type = item.type?.toUpperCase() || "IMAGE";
                if (params.media_type === "IMAGE") params.image_url = url;
                if (params.media_type === "VIDEO") params.video_url = url;
            } else {
                params.media_type = "TEXT";
                if (linkAttachment) params.link_attachment = linkAttachment;
            }

            if (text) params.text = text;

            console.log(`[Threads Worker] Creating container: ${params.media_type}`);
            const container = await makeThreadsRequest(`/${accountId}/threads`, params, accessToken);
            creationId = container.id;
        }

        // 5. Wait for final container processing
        if (media.length > 0) {
            await waitForMediaReady(creationId, accessToken);
        }

        // 6. Publish
        const publishResult = await makeThreadsRequest(`/${accountId}/threads_publish`, {
            creation_id: creationId
        }, accessToken);

        // 7. Update Firestore
        await postRef.update({
            status: 'published',
            threadsPostId: publishResult.id,
            threadsCreationId: creationId,
            publishedAt: new Date(),
            updatedAt: new Date()
        });

        console.log(`[Threads Worker] Published post ${postId}. Threads ID: ${publishResult.id}`);

    } catch (error) {
        console.error(`[Threads Worker] Error:`, error.message);
        await db.collection('threads_posts').doc(postId).update({
            status: 'failed',
            error: error.message,
            updatedAt: new Date()
        });
        throw error;
    }
}

const worker = new Worker(QUEUE_NAMES.THREADS, threadsProcessor, {
    connection,
    concurrency: 10,
    lockDuration: 300000, // 5 mins
});

worker.on('failed', (job, err) => {
    console.error(`[Threads Worker] Job ${job.id} failed:`, err.message);
});

console.log("Threads Background Worker IS LIVE");
