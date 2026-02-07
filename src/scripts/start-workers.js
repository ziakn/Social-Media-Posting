const { exec } = require('child_process');
const { QUEUE_NAMES } = require('../lib/queue/queues');

console.log("Starting all background workers...");

// Only Facebook is fully implemented for now
const activePlatforms = ['FACEBOOK'];

activePlatforms.forEach(platform => {
    const script = `node src/workers/platforms/${platform.toLowerCase()}-worker.js`;
    console.log(`Spawning ${platform} worker: ${script}`);

    const child = exec(script);

    child.stdout.on('data', (data) => {
        console.log(`[${platform}] ${data.trim()}`);
    });

    child.stderr.on('data', (data) => {
        console.error(`[${platform} ERROR] ${data.trim()}`);
    });
});

console.log("Active workers spawned. Press Ctrl+C to stop.");
