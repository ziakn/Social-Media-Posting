const { Worker } = require('bullmq');
const { connection } = require('../../lib/queue/config');
const { QUEUE_NAMES } = require('../../lib/queue/queues');
const { initAdmin } = require('../../lib/queue/firebase-admin');

// 1. Initialize Firebase Admin (Automatically loads .env)
const db = initAdmin();

/**
 * Facebook API Helpers
 */
async function handleImagePost(pageId, message, mediaUrls, accessToken, baseBody) {
    const attachedMedia = [];
    for (const media of mediaUrls) {
        const formData = new FormData();
        formData.append('access_token', accessToken);
        formData.append('published', 'false');

        let fileBuffer;
        if (media.url.startsWith('http')) {
            const response = await fetch(media.url);
            fileBuffer = Buffer.from(await response.arrayBuffer());
        } else {
            const filePath = path.join(process.cwd(), 'public', media.url.replace(/^\//, ''));
            fileBuffer = fs.readFileSync(filePath);
        }

        const blob = new Blob([fileBuffer], { type: media.type || 'image/jpeg' });
        formData.append('source', blob, media.name || 'image.jpg');

        const uploadRes = await fetch(`https://graph.facebook.com/${pageId}/photos`, {
            method: "POST",
            body: formData,
        });

        const uploadData = await uploadRes.json();
        if (uploadData.error) throw new Error(uploadData.error.message);
        attachedMedia.push({ media_fbid: uploadData.id });
    }

    const fbRes = await fetch(`https://graph.facebook.com/${pageId}/feed`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...baseBody, attached_media: attachedMedia }),
    });
    return await fbRes.json();
}

async function handleVideoPost(pageId, message, video, accessToken, baseBody) {
    const formData = new FormData();
    formData.append("description", message || '');
    formData.append("access_token", accessToken);
    formData.append("published", "true");

    let fileBuffer;
    if (video.url.startsWith('http')) {
        const response = await fetch(video.url);
        fileBuffer = Buffer.from(await response.arrayBuffer());
    } else {
        const filePath = path.join(process.cwd(), 'public', video.url.replace(/^\//, ''));
        fileBuffer = fs.readFileSync(filePath);
    }

    const blob = new Blob([fileBuffer], { type: video.type || 'video/mp4' });
    formData.append("source", blob, video.name || 'video.mp4');

    const fbRes = await fetch(`https://graph.facebook.com/${pageId}/videos`, {
        method: "POST",
        body: formData
    });
    return await fbRes.json();
}

/**
 * Main Facebook Worker Processor
 */
async function facebookProcessor(job) {
    const data = typeof job.data === 'string' ? { postId: job.data } : job.data;
    const { postId, pageId, accountId, userId, userEmail } = data;

    if (!postId) return;

    console.log(`[Facebook Worker] Processing post ${postId} (Page: ${pageId}, Account: ${accountId || 'N/A'}) for User: ${userEmail || userId || 'Unknown'}`);

    try {
        const postRef = db.collection('facebook_posts').doc(postId);
        const postSnap = await postRef.get();
        if (!postSnap.exists) {
            console.log(`[Facebook Worker] Post ${postId} not found in Firestore. Skipping.`);
            return;
        }

        const post = postSnap.data();

        // 1. Safety Check: Skip if soft-deleted
        if (post.delete === 1) {
            console.log(`[Facebook Worker] Post ${postId} marked as deleted. Skipping.`);
            return;
        }

        // 2. Status Check: Only process if scheduled or failed (for retries)
        if (post.status === 'published' && post.facebookPostId) {
            console.log(`[Facebook Worker] Post ${postId} already published. Skipping.`);
            return;
        }

        // Get Access Token (Revised lookup logic)
        let targetAccountId = accountId || post.accountId;
        let accessToken = null;

        if (targetAccountId) {
            const accountSnap = await db.collection('socialAccounts').doc(targetAccountId).get();
            if (accountSnap.exists) {
                const accountData = accountSnap.data();
                const page = accountData.pages?.find(p => String(p.pageId) === String(pageId));
                accessToken = page?.pageAccessToken || page?.pageAccessTokean || page?.accessToken;
            }
        }

        // Fallback for legacy posts or if accountId was wrong
        if (!accessToken) {
            console.log(`[Facebook Worker] Account ID lookup failed or missing. Searching by User (${userId || post.userId}) and Page (${pageId})...`);
            const accountsSnap = await db.collection('socialAccounts')
                .where('userId', '==', userId || post.userId)
                .where('platform', '==', 'facebook')
                .get();

            for (const doc of accountsSnap.docs) {
                const data = doc.data();
                const page = data.pages?.find(p => String(p.pageId) === String(pageId));
                if (page?.pageAccessToken || page?.pageAccessTokean || page?.accessToken) {
                    accessToken = page.pageAccessToken || page.pageAccessTokean || page.accessToken;
                    targetAccountId = doc.id;
                    console.log(`[Facebook Worker] Found legacy account mapping: ${targetAccountId}`);
                    break;
                }
            }
        }

        if (!accessToken) throw new Error(`Page access token not found for Page ID ${pageId} after full search.`);

        const baseBody = {
            message: post.message || '',
            access_token: accessToken,
            published: true,
        };

        let fbData;
        switch (post.postType) {
            case "images":
                fbData = await handleImagePost(post.pageId, post.message, post.mediaUrls || [], accessToken, baseBody);
                break;
            case "video":
                fbData = await handleVideoPost(post.pageId, post.message, post.mediaUrls[0], accessToken, baseBody);
                break;
            case "poll":
                const pollOptions = post.additionalData?.options?.filter(o => o.trim() !== "") || [];
                const pollMessage = `${post.message || ''}\n\n${post.additionalData?.question || 'Poll'}\n\n${pollOptions.map(o => `• ${o}`).join("\n")}`;
                const pollRes = await fetch(`https://graph.facebook.com/${post.pageId}/feed`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ ...baseBody, message: pollMessage }),
                });
                fbData = await pollRes.json();
                break;
            case "link":
                const linkRes = await fetch(`https://graph.facebook.com/${post.pageId}/feed`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ ...baseBody, link: post.additionalData?.link }),
                });
                fbData = await linkRes.json();
                break;
            default: // text
                const textRes = await fetch(`https://graph.facebook.com/${post.pageId}/feed`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(baseBody),
                });
                fbData = await textRes.json();
                break;
        }

        if (fbData.error) throw new Error(fbData.error.message);

        await postRef.update({
            status: 'published',
            facebookPostId: fbData.id,
            publishedAt: new Date(),
            updatedAt: new Date()
        });

        console.log(`[Facebook Worker] Published post ${postId}. FB ID: ${fbData.id}`);

    } catch (error) {
        console.error(`[Facebook Worker] Error:`, error.message);
        await db.collection('facebook_posts').doc(postId).update({
            status: 'failed',
            error: error.message,
            updatedAt: new Date()
        });
        throw error;
    }
}

const worker = new Worker(QUEUE_NAMES.FACEBOOK, facebookProcessor, {
    connection,
    concurrency: 50, // Capacity for ~180,000 posts/hour (assuming 1s latency)
    lockDuration: 60000,
    prefetch: 100
});

worker.on('failed', (job, err) => {
    console.error(`[Facebook Worker] Job ${job.id} failed:`, err.message);
    // Exponential backoff is handled by queues.js defaults
});

console.log("Facebook Background Worker IS LIVE");
