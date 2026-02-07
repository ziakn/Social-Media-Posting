/**
 * Verification Script: Instagram Queue & Worker Scenarios (Refactored)
 */

const { syncPostJob, removePostJob, queues, QUEUE_NAMES } = require('../lib/queue/queues');
const { initAdmin } = require('../lib/queue/firebase-admin');

async function runVerification() {
    console.log("🚀 Starting Instagram Queue Verification (Refactored for Unified Queue)...\n");
    const db = initAdmin();
    const instagramQueue = queues[QUEUE_NAMES.INSTAGRAM];

    const mockPostId = "test-ig-verif-" + Date.now();
    const mockData = {
        postId: mockPostId,
        pageId: "17841405814341131", // The ID we saw in logs
        userId: "test-user-id", // Use a generic test user ID
        userEmail: "test@example.com"
    };

    try {
        // --- SCENARIO 1: Create 'Publish Now' Post (delay 0) ---
        console.log("1️⃣ Scenario: 'Publish Now' (0 delay)");
        await db.collection('instagram_posts').doc(mockPostId).set({
            ...mockData,
            platform: "instagram",
            postType: "image",
            content: { caption: "Test Publish Now" },
            status: "scheduled",
            delete: 0,
            createdAt: new Date()
        });

        await syncPostJob("instagram", mockPostId, mockData, { delay: 0 });

        let job = await instagramQueue.getJob(mockPostId);
        if (job) {
            console.log(`✅ Job found in queue. ID: ${job.id}, Delay: ${job.opts.delay || 0}ms`);
        } else {
            throw new Error("❌ Job not found in queue after 'Publish Now' submission");
        }

        // --- SCENARIO 2: Reschedule ---
        console.log("\n2️⃣ Scenario: Rescheduling (Updating delay to 1 hour)");
        const newDelay = 3600 * 1000;
        await syncPostJob("instagram", mockPostId, mockData, { delay: newDelay });

        job = await instagramQueue.getJob(mockPostId);
        if (job && job.opts.delay === newDelay) {
            console.log(`✅ Job replaced/updated. New Delay: ${job.opts.delay}ms`);
        } else {
            console.log(`❌ Job delay mismatch. Expected ${newDelay}, got ${job?.opts?.delay}`);
        }

        // --- SCENARIO 3: Deletion ---
        console.log("\n3️⃣ Scenario: Deleting Post (Removing from Queue)");
        await removePostJob("instagram", mockPostId);

        job = await instagramQueue.getJob(mockPostId);
        if (!job) {
            console.log("✅ Job successfully removed from BullMQ.");
        } else {
            console.log("❌ Job still exists in BullMQ after removal.");
        }

        // Cleanup
        console.log("\n🧹 Cleaning up test data...");
        await db.collection('instagram_posts').doc(mockPostId).delete();
        console.log("✅ Verification Complete.");

    } catch (error) {
        console.error("\n❌ Verification Failed:", error.message);
    } finally {
        process.exit(0);
    }
}

runVerification();
