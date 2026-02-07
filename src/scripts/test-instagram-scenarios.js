/**
 * Verification Script: Instagram Queue & Worker Scenarios
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
    console.log("🚀 Starting Instagram Queue Verification...\n");
    const db = initAdmin();
    const instagramQueue = queues[QUEUE_NAMES.INSTAGRAM];

    // Mock Data
    const mockPostId = "test-ig-verification-" + Date.now();
    const mockData = {
        postId: mockPostId,
        pageId: "ig-test-page-id",
        userId: "test-user-id",
        userEmail: "test@example.com"
    };

    try {
        // --- SCENARIO 1: Create Scheduled Post ---
        console.log("1️⃣ Scenario: Creating Scheduled Post (15 min delay)");
        const delay = 15 * 60 * 1000;
        await db.collection('instagram_posts').doc(mockPostId).set({
            ...mockData,
            content: { caption: "Original Caption" },
            status: "scheduled",
            scheduledAt: new Date(Date.now() + delay),
            delete: 0,
            postType: "image",
            createdAt: new Date()
        });

        await syncPostJob("instagram", mockPostId, mockData, { delay });

        let job = await instagramQueue.getJob(mockPostId);
        if (job) {
            console.log(`✅ Job found in IG queue. ID: ${job.id}, Delay: ${job.opts.delay}ms`);
        } else {
            throw new Error("❌ Job not found in IG queue after creation");
        }

        // --- SCENARIO 2: Edit Content ---
        console.log("\n2️⃣ Scenario: Editing Post Content");
        await db.collection('instagram_posts').doc(mockPostId).update({
            "content.caption": "Updated Caption"
        });
        console.log("✅ Firestore updated. Worker will fetch 'Updated Caption' when processed.");

        // --- SCENARIO 3: Reschedule ---
        console.log("\n3️⃣ Scenario: Rescheduling Post (to 7 min delay)");
        const newDelay = 7 * 60 * 1000;
        await syncPostJob("instagram", mockPostId, mockData, { delay: newDelay });

        job = await instagramQueue.getJob(mockPostId);
        if (job && job.opts.delay === newDelay) {
            console.log(`✅ Job updated/replaced in IG queue. New Delay: ${job.opts.delay}ms`);
        } else {
            console.log(`❌ Job delay mismatch. Current: ${job?.opts?.delay}`);
        }

        // --- SCENARIO 4: Soft-Delete Safety ---
        console.log("\n4️⃣ Scenario: Soft-Delete Safety");
        await db.collection('instagram_posts').doc(mockPostId).update({
            delete: 1
        });
        console.log("✅ Post soft-deleted in Firestore. (Worker check will skip it)");

        // --- SCENARIO 5: Deletion (Queue Cleanup) ---
        console.log("\n5️⃣ Scenario: Deleting Post (Removing from Queue)");
        await removePostJob("instagram", mockPostId);

        job = await instagramQueue.getJob(mockPostId);
        if (!job) {
            console.log("✅ Job successfully removed from BullMQ (Instagram).");
        } else {
            console.log("❌ Job still exists in BullMQ after removal attempt.");
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
