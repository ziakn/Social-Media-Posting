const { QUEUE_NAMES, queues } = require('../lib/queue/queues');

async function checkHealth() {
    console.log("--- Social Media Queue Health Check ---");

    for (const [platform, queueName] of Object.entries(QUEUE_NAMES)) {
        const queue = queues[queueName];
        try {
            const [pending, active, completed, failed] = await Promise.all([
                queue.getJobCountByTypes('waiting', 'delayed'),
                queue.getJobCountByTypes('active'),
                queue.getJobCountByTypes('completed'),
                queue.getJobCountByTypes('failed')
            ]);

            console.log(`[${platform}] Queue: ${queueName} | Pending: ${pending} | Active: ${active} | Completed: ${completed} | Failed: ${failed}`);
        } catch (err) {
            console.error(`[${platform}] ERROR: ${err.message}`);
        }
    }

    console.log("--- Check Complete ---");
    process.exit(0);
}

checkHealth();
