const { initAdmin } = require('../lib/queue/firebase-admin');
const { QUEUE_NAMES, queues } = require('../lib/queue/queues');
const db = initAdmin();

async function retryFailedJobs(platform) {
    const queue = queues[QUEUE_NAMES[platform.toUpperCase()]];
    if (!queue) {
        console.error(`Queue for ${platform} not found.`);
        return;
    }

    console.log(`--- Retrying Failed Jobs for ${platform} ---`);

    try {
        const failedJobs = await queue.getFailed();
        console.log(`Found ${failedJobs.length} failed jobs.`);

        for (const job of failedJobs) {
            console.log(`Retrying Job ID: ${job.id}...`);
            await job.retry();
        }

        console.log('--- Done ---');
    } catch (err) {
        console.error('Error retrying jobs:', err.message);
    }
    process.exit(0);
}

const platform = process.argv[2] || 'FACEBOOK';
retryFailedJobs(platform);
