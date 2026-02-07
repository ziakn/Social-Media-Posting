const { Queue } = require('bullmq');
const { connection } = require('./config');

const QUEUE_NAMES = {
    FACEBOOK: 'facebook-queue',
    INSTAGRAM: 'instagram-queue',
    LINKEDIN: 'linkedin-queue',
    TWITTER: 'twitter-queue',
    TIKTOK: 'tiktok-queue',
    PINTEREST: 'pinterest-queue',
    BLUESKY: 'bluesky-queue',
    THREADS: 'threads-queue',
    YOUTUBE: 'youtube-queue'
};

// Lazy initialization of queues
const queues = {};

Object.values(QUEUE_NAMES).forEach(name => {
    queues[name] = new Queue(name, {
        connection,
        defaultJobOptions: {
            attempts: 5, // More retries for API fluctuations
            backoff: {
                type: 'exponential',
                delay: 2000,
            },
            removeOnComplete: {
                age: 3600, // Keep for 1 hour for debugging
                count: 1000, // Keep last 1000
            },
            removeOnFail: {
                age: 24 * 3600, // Keep for 24 hours
                count: 5000, // Keep last 5000 for manual review
            },
        }
    });
});

/**
 * Synchronize a post with the queue.
 * Uses the Firestore Post ID as the Job ID for deterministic replacement.
 */
async function syncPostJob(platform, postId, data, options = {}) {
    const queueName = QUEUE_NAMES[platform.toUpperCase()];
    if (!queueName || !queues[queueName]) {
        throw new Error(`Invalid platform queue: ${platform}`);
    }

    const queue = queues[queueName];

    // 1. Attempt to remove existing job to prevent duplicates or handle rescheduling
    try {
        const job = await queue.getJob(postId);
        if (job) {
            const state = await job.getState();
            if (state === 'active') {
                console.log(`[Queue Sync] Job ${postId} is currently ACTIVE (being processed). Skipping removal/replacement.`);
                return job; // Return existing job if it's already running
            }
            await job.remove();
            console.log(`[Queue Sync] Removed existing job ${postId} from ${platform} queue for replacement.`);
        }
    } catch (err) {
        if (err.message.includes('locked')) {
            console.warn(`[Queue Sync] Could not remove existing job ${postId} because it is being processed by a worker.`);
            return; // Don't throw, just allow the one already running to finish
        }
        console.warn(`[Queue Sync] Could not remove existing job ${postId}:`, err.message);
    }

    // 2. Add new job with the Post ID as the Job ID
    console.log(`[Queue Sync] Enqueuing ${platform} post ${postId} with delay ${options.delay || 0}ms`);
    return await queue.add(queueName, data, {
        jobId: postId, // DETERMINISTIC ID
        ...options
    });
}

/**
 * Remove a post from the queue (e.g., on deletion).
 */
async function removePostJob(platform, postId) {
    const queueName = QUEUE_NAMES[platform.toUpperCase()];
    if (!queueName || !queues[queueName]) return;

    const queue = queues[queueName];
    try {
        const job = await queue.getJob(postId);
        if (job) {
            const state = await job.getState();
            if (state === 'active') {
                console.warn(`[Queue Sync] Attempted to remove job ${postId} but it's already ACTIVE. Processing will complete.`);
                return;
            }
            await job.remove();
            console.log(`[Queue Sync] Permanently removed job ${postId} from ${platform} queue.`);
        }
    } catch (err) {
        console.error(`[Queue Sync] Failed to remove job ${postId}:`, err.message);
    }
}

module.exports = {
    QUEUE_NAMES,
    syncPostJob,
    removePostJob,
    queues
};
