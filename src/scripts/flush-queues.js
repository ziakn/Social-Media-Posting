const { QUEUE_NAMES, queues } = require('../lib/queue/queues');

async function flushQueues() {
    console.log("--- Social Media Queue Flush ---");

    for (const [platform, queueName] of Object.entries(QUEUE_NAMES)) {
        const queue = queues[queueName];
        try {
            console.log(`[${platform}] Flushing queue: ${queueName}...`);
            await queue.obliterate({ force: true });
            console.log(`[${platform}] DONE.`);
        } catch (err) {
            console.error(`[${platform}] FAILED TO FLUSH: ${err.message}`);
        }
    }

    console.log("--- All Queues Obliterated ---");
    process.exit(0);
}

flushQueues();
