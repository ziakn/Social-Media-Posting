const { Worker } = require('bullmq');
const { BskyAgent, RichText } = require('@atproto/api');
const { connection } = require('../../lib/queue/config');
const { QUEUE_NAMES } = require('../../lib/queue/queues');
const { initAdmin } = require('../../lib/queue/firebase-admin');
const fetch = require('node-fetch');
// Using standard fs for worker context, not fs/promises due to potential environment differences, 
// but consistency with other modules is key. Let's use fs/promises as modern node supports it.
const fs = require('fs');
const path = require('path');

const db = initAdmin();

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
    if (type === 'video') {
        // Bluesky video support is newer, but let's assume we can support it if the agent allows.
        // However, for testing, we might just stick to images or use a small reliable video.
        return "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4";
    } else {
        const images = [
            "https://images.unsplash.com/photo-1554080353-a576cf803bda?auto=format&fit=crop&w=1000&h=1000&q=80",
            "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1000&h=1000&q=80",
            "https://images.unsplash.com/photo-1493246507139-91e8bef99c02?auto=format&fit=crop&w=1000&h=1000&q=80"
        ];
        return images[index % images.length];
    }
}

async function getAbsoluteUrl(url) {
    if (url.startsWith('http')) return url;
    // In worker, process.env.NEXT_PUBLIC_APP_URL might not be set the same way, verify environment
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
}

/**
 * Upload media (image/video) to BlueSky
 */
async function uploadMedia(agent, media) {
    let fileBuffer;
    let mimeType = media.type;
    let url = media.url;

    // --- 1. Fetch / Resolve File ---
    if (needsTestUrl(url)) {
        console.log(`[Bluesky Worker] Resolving test URL for ${media.type}`);
        url = getTestUrl(media.type);
    } else {
        url = await getAbsoluteUrl(url);
    }

    console.log(`[Bluesky Worker] Fetching media: ${url}`);
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to fetch media: ${response.statusText}`);
    fileBuffer = await response.buffer();

    // Detect/Normalize Mime
    if (!mimeType || mimeType === 'image' || mimeType === 'video') {
        mimeType = response.headers.get('content-type');
        if (!mimeType) {
            if (url.endsWith('.mp4')) mimeType = 'video/mp4';
            else if (url.endsWith('.jpg') || url.endsWith('.jpeg')) mimeType = 'image/jpeg';
            else if (url.endsWith('.png')) mimeType = 'image/png';
        }
    }

    // Strict Bluesky Mimes
    if (mimeType.includes('image')) mimeType = 'image/jpeg'; // Simplification
    if (mimeType.includes('video')) mimeType = 'video/mp4';

    const isVideo = mimeType.startsWith('video/');
    const blobSize = fileBuffer.length;

    console.log(`[Bluesky Worker] Uploading blob: type=${mimeType}, size=${blobSize} bytes`);

    // --- 2. Upload Blob ---
    try {
        const { data } = await agent.uploadBlob(fileBuffer, { encoding: mimeType });

        if (data?.blob) {
            if (isVideo) {
                return {
                    $type: "app.bsky.embed.video",
                    video: data.blob,
                    alt: media.alt || ""
                };
            }
            return {
                $type: "app.bsky.embed.images#image",
                alt: media.alt || "",
                image: data.blob
            };
        }
    } catch (uploadError) {
        console.warn(`[Bluesky Worker] SDK Upload failed: ${uploadError.message}. Trying direct XRPC...`);
        // Fallback to direct XRPC if needed (logic from createPost.js)
        const xrpcUrl = `${agent.service.href}xrpc/com.atproto.repo.uploadBlob`;
        const res = await fetch(xrpcUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${agent.session.accessJwt}`,
                'Content-Type': mimeType
            },
            body: fileBuffer
        });

        if (!res.ok) {
            const txt = await res.text();
            throw new Error(`XRPC Upload Failed: ${txt}`);
        }
        const data = await res.json();
        if (data.blob) {
            if (isVideo) {
                return { $type: "app.bsky.embed.video", video: data.blob, alt: "" };
            }
            return { $type: "app.bsky.embed.images#image", alt: "", image: data.blob };
        }
    }
    throw new Error("Failed to upload blob to BlueSky");
}

/**
 * Get metadata for a URL (Link Card)
 */
async function getLinkMetadata(agent, url) {
    try {
        const response = await fetch(url);
        const html = await response.text();

        // Simple regex extraction (cheerio is heavy/not available? using regex as per previous code)
        const title = html.match(/<title>(.*?)<\/title>/i)?.[1] || url;
        const description = html.match(/<meta name="description" content="(.*?)"/i)?.[1] || "";
        const ogImage = html.match(/<meta property="og:image" content="(.*?)"/i)?.[1];

        let thumbBlob = null;
        if (ogImage) {
            try {
                const imgRes = await fetch(ogImage);
                if (imgRes.ok) {
                    const contentType = imgRes.headers.get('content-type') || 'image/jpeg';
                    const imgBuffer = await imgRes.buffer();

                    if (imgBuffer.length < 900 * 1024) { // < 900KB safety
                        const { data } = await agent.uploadBlob(imgBuffer, { encoding: contentType });
                        thumbBlob = data.blob;
                    }
                }
            } catch (e) {
                console.warn("[Bluesky Worker] Link thumb upload failed:", e.message);
            }
        }

        const external = {
            uri: url,
            title: title || url,
            description: description || "",
        };

        if (thumbBlob) external.thumb = thumbBlob;

        return {
            $type: "app.bsky.embed.external",
            external: external
        };

    } catch (error) {
        console.warn(`[Bluesky Worker] Metadata fetch failed for ${url}:`, error.message);
        return {
            $type: "app.bsky.embed.external",
            external: { uri: url, title: url, description: "" }
        };
    }
}

/**
 * Main Processor
 */
async function blueskyProcessor(job) {
    const { postId, userId, userEmail } = job.data;
    if (!postId) return;

    console.log(`[Bluesky Worker] Processing post ${postId} for User: ${userEmail || userId}`);

    try {
        const postRef = db.collection('bluesky_posts').doc(postId);
        const postSnap = await postRef.get();

        if (!postSnap.exists) {
            console.log(`[Bluesky Worker] Post ${postId} not found. Skipping.`);
            return;
        }

        const post = postSnap.data();

        // 1. Safety Check
        if (post.delete === 1) {
            console.log(`[Bluesky Worker] Post ${postId} marked as deleted. Skipping.`);
            return;
        }

        // 2. Resolve Account
        const accountSnap = await db.collection('socialAccounts')
            .where('userId', '==', userId)
            .where('accountId', '==', post.accountId)
            .where('platform', '==', 'bluesky')
            .where('status', '==', 'active')
            .limit(1)
            .get();

        if (accountSnap.empty) throw new Error("Bluesky account not found or inactive.");
        const account = accountSnap.docs[0].data();

        // 3. Login to Agent
        const agent = new BskyAgent({ service: "https://bsky.social" });
        await agent.login({ identifier: account.identifier, password: account.password });

        // 4. Prepare Content
        const content = post.content || {};
        const text = content.text || "";
        const media = content.media || [];
        const link = content.link || null;

        // Rich Text Processing
        const rt = new RichText({ text });
        await rt.detectFacets(agent);

        const postRecord = {
            text: rt.text,
            facets: rt.facets,
            createdAt: new Date().toISOString()
        };

        // Media Processing
        if (media.length > 0) {
            const uploadedMedia = [];
            for (const item of media) {
                const res = await uploadMedia(agent, item);
                uploadedMedia.push(res);
            }

            const images = uploadedMedia.filter(m => m.$type === "app.bsky.embed.images#image");
            const video = uploadedMedia.find(m => m.$type === "app.bsky.embed.video");

            if (video) {
                postRecord.embed = video;
            } else if (images.length > 0) {
                postRecord.embed = {
                    $type: "app.bsky.embed.images",
                    images: images
                };
            }
        }

        // Link Card (only if no media embed yet, or if BlueSky supports both - usually one embed type)
        // Check if embed exists already (from media)
        if (link && !postRecord.embed) {
            postRecord.embed = await getLinkMetadata(agent, link);
        }

        // 5. Post
        console.log(`[Bluesky Worker] Posting to Bluesky...`);
        const result = await agent.post(postRecord);

        // 6. Update Firestore
        await postRef.update({
            status: 'published',
            blueskyUri: result.uri,
            blueskyCid: result.cid,
            publishedAt: new Date(),
            updatedAt: new Date()
        });

        console.log(`[Bluesky Worker] Successfully published Post ${postId} (URI: ${result.uri})`);

    } catch (error) {
        console.error(`[Bluesky Worker] Error processing post ${postId}:`, error.message);
        await db.collection('bluesky_posts').doc(postId).update({
            status: 'failed',
            error: error.message,
            updatedAt: new Date()
        });
        throw error;
    }
}

// Start Worker
const worker = new Worker(QUEUE_NAMES.BLUESKY, blueskyProcessor, {
    connection,
    concurrency: 5, // Bluesky rate limits might be stricter, start conservative
    lockDuration: 300000,
});

worker.on('failed', (job, err) => {
    console.error(`[Bluesky Worker] Job ${job.id} failed:`, err.message);
});

console.log("Bluesky Background Worker IS LIVE");
