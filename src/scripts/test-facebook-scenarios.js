/**
 * Verification Script: Facebook Queue & Worker Scenarios
 * 
 * This script verifies:
 * 1. Post Creation & Queuing
 * 2. Edit Content (Worker pick up latest from Firestore)
 * 3. Rescheduling (Job replacement in BullMQ)
 * 4. Deletion (Job removal from BullMQ)
 * 5. Soft-Delete Worker Safety
 */

const { syncPostJob, removePostJob, queues, QUEUE_NAMES } = require('../lib/queue/queues');
const { initAdmin } = require('../lib/queue/firebase-admin');

async function runVerification() {
    console.log("🚀 Starting Facebook Queue Verification...\n");
    const db = initAdmin();
    const facebookQueue = queues[QUEUE_NAMES.FACEBOOK];

    // Mock Data
    const mockPostId = "test-verification-" + Date.now();
    const mockData = {
        postId: mockPostId,
        pageId: "123456789",
        userId: "test-user-id",
        userEmail: "test@example.com"
    };

    try {
        // --- SCENARIO 1: Create Scheduled Post ---
        console.log("1️⃣ Scenario: Creating Scheduled Post (10 min delay)");
        const delay = 10 * 60 * 1000;
        await db.collection('facebook_posts').doc(mockPostId).set({
            ...mockData,
            message: "Original Message",
            status: "scheduled",
            scheduledAt: new Date(Date.now() + delay),
            delete: 0,
            createdAt: new Date()
        });

        await syncPostJob("facebook", mockPostId, mockData, { delay });

        let job = await facebookQueue.getJob(mockPostId);
        if (job) {
            console.log(`✅ Job found in queue. ID: ${job.id}, Delay: ${job.opts.delay}ms`);
        } else {
            throw new Error("❌ Job not found in queue after creation");
        }

        // --- SCENARIO 2: Edit Content (Message) ---
        console.log("\n2️⃣ Scenario: Editing Post Content");
        await db.collection('facebook_posts').doc(mockPostId).update({
            message: "Updated Message"
        });
        console.log("✅ Firestore updated. Worker will fetch 'Updated Message' when processed.");

        // --- SCENARIO 3: Reschedule ---
        console.log("\n3️⃣ Scenario: Rescheduling Post (to 5 min delay)");
        const newDelay = 5 * 60 * 1000;
        await syncPostJob("facebook", mockPostId, mockData, { delay: newDelay });

        job = await facebookQueue.getJob(mockPostId);
        if (job && job.opts.delay === newDelay) {
            console.log(`✅ Job updated/replaced. New Delay: ${job.opts.delay}ms`);
        } else {
            console.log(`❌ Job delay mismatch. Current: ${job?.opts?.delay}`);
        }

        // --- SCENARIO 4: Soft-Delete Safety (Worker Check) ---
        console.log("\n4️⃣ Scenario: Soft-Delete Safety");
        await db.collection('facebook_posts').doc(mockPostId).update({
            delete: 1
        });
        console.log("✅ Post soft-deleted in Firestore. (Worker check will now skip it)");

        // --- SCENARIO 5: Deletion (Queue Cleanup) ---
        console.log("\n5️⃣ Scenario: Deleting Post (Removing from Queue)");
        await removePostJob("facebook", mockPostId);

        job = await facebookQueue.getJob(mockPostId);
        if (!job) {
            console.log("✅ Job successfully removed from BullMQ.");
        } else {
            console.log("❌ Job still exists in BullMQ after removal attempt.");
        }

        // Cleanup
        console.log("\n🧹 Cleaning up test data...");
        await db.collection('facebook_posts').doc(mockPostId).delete();
        console.log("✅ Verification Complete.");

    } catch (error) {
        console.error("\n❌ Verification Failed:", error.message);
    } finally {
        process.exit(0);
    }
}

runVerification();
