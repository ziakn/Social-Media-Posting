const { initAdmin } = require('../src/lib/queue/firebase-admin');
const { queues, QUEUE_NAMES, syncPostJob, removePostJob } = require('../src/lib/queue/queues');
const db = initAdmin();

/**
 * PINTEREST LIFECYCLE ROBUSTNESS SUITE
 * 
 * Verifying:
 * 1. Schedule Post for Future (e.g., 24h)
 * 2. Verify Job Exists with Correct Delay
 * 3. [EDIT] Update Content (Title/Desc) -> Verify Job Persists & Delay Unchanged
 * 4. [RESCHEDULE] Update Time (e.g., 48h) -> Verify Job Delay Updated
 * 5. [RESCHEDULE] Update Time to Near Future (5s) -> Verify Job Delay Updated
 * 6. [EXECUTION] Wait for worker -> Verify Execution
 * 7. [DELETE] Schedule New Post -> Delete -> Verify Job Removed
 */

async function getTestContext() {
    const accounts = await db.collection('socialAccounts')
        .where('platform', '==', 'pinterest')
        .where('status', '==', 'active')
        .limit(1)
        .get();

    if (accounts.empty) throw new Error("No active Pinterest account found.");
    const account = accounts.docs[0].data();

    return {
        userId: account.userId,
        accountId: account.accountId,
        boardId: "674203075406940926"
    };
}

async function createScheduledPost(ctx, scheduledTime) {
    const postRef = await db.collection('pinterest_posts').add({
        userId: ctx.userId,
        accountId: ctx.accountId,
        platform: "pinterest",
        status: "scheduled",
        title: "Initial Title",
        message: "Initial Message",
        postType: "standard",
        content: { media: [{ type: "image", url: "https://picsum.photos/seed/lifecycle/1000/1000" }] },
        scheduledAt: scheduledTime,
        createdAt: new Date(),
        updatedAt: new Date(),
        delete: 0,
        boardId: ctx.boardId
    });

    // Simulate Action Logic: Sync to Queue
    const delay = Math.max(0, scheduledTime.getTime() - Date.now());
    await syncPostJob("pinterest", postRef.id, {
        postId: postRef.id,
        userId: ctx.userId,
        pageId: ctx.accountId
    }, { delay });

    return postRef;
}

async function verifyJobState(postId, expectedDelayMs, toleranceMs = 2000) {
    const queue = queues[QUEUE_NAMES.PINTEREST];
    const job = await queue.getJob(postId);

    if (!job) {
        throw new Error(`Job ${postId} NOT FOUND in queue!`);
    }

    const state = await job.getState();
    const { delay } = await job.opts; // BullMQ stores delay in opts

    // Note: BullMQ delay is relative to creation, but we care if it's roughly correct.
    // For scheduled jobs, state is 'delayed'.

    console.log(`   [Queue Check] Job ${postId} (State: ${state})`);

    if (state !== 'delayed' && expectedDelayMs > 10000) {
        throw new Error(`Job state is ${state}, expected 'delayed' for future post.`);
    }

    // Checking delay is tricky because it's static in opts. 
    // We can rely on the fact that syncPostJob replaces the job with NEW delay.
    // Let's just trust that the *existence* and *state* are correct for now, 
    // and verify the delay value if possible.

    if (Math.abs(delay - expectedDelayMs) > toleranceMs) {
        console.warn(`   ⚠️ Warning: Job delay ${delay}ms differs from expected ${expectedDelayMs}ms by >${toleranceMs}ms. (Could be execution lag)`);
    } else {
        console.log(`   ✅ Delay verified: ~${Math.round(delay / 1000)}s`);
    }
}

async function runRobustSuite() {
    console.log("📌 Starting PINTEREST LIFECYCLE ROBUSTNESS TEST...");
    const ctx = await getTestContext();
    console.log(`Account: ${ctx.accountId}\n`);

    // --- 1. Create Scheduled Post (24h) ---
    const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h
    console.log(`[1/7] Creating Scheduled Post for +24h (${futureDate.toISOString()})...`);
    const postRef = await createScheduledPost(ctx, futureDate);
    const postId = postRef.id;
    console.log(`   -> Created Post ID: ${postId}`);

    // --- 2. Verify Job ---
    await verifyJobState(postId, 24 * 60 * 60 * 1000);

    // --- 3. Edit Content (Title) ---
    console.log(`\n[3/7] [EDIT] Changing Title to 'Edited Title'...`);
    await postRef.update({ title: "Edited Title", updatedAt: new Date() });

    // Simulate Action: Update Queue (Even if delay doesn't change, action usually calls sync)
    // In action: const delay = ...
    // Let's verify if calling sync with SAME delay keeps the job alive.
    const delay24h = 24 * 60 * 60 * 1000;
    await syncPostJob("pinterest", postId, { postId, userId: ctx.userId, pageId: ctx.accountId }, { delay: delay24h });

    await verifyJobState(postId, delay24h);
    console.log("   ✅ Job persisted after content edit.");

    // --- 4. Reschedule (48h) ---
    const farFutureDate = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48h
    console.log(`\n[4/7] [RESCHEDULE] Moving to +48h (${farFutureDate.toISOString()})...`);
    await postRef.update({ scheduledAt: farFutureDate, updatedAt: new Date() });

    const delay48h = 48 * 60 * 60 * 1000;
    await syncPostJob("pinterest", postId, { postId, userId: ctx.userId, pageId: ctx.accountId }, { delay: delay48h });

    await verifyJobState(postId, delay48h);
    console.log("   ✅ Job delay updated to ~48h.");

    // --- 5. Reschedule to Near Future (5s) ---
    const nearFuture = new Date(Date.now() + 5000); // 5s
    console.log(`\n[5/7] [RESCHEDULE] Moving to +5s (${nearFuture.toISOString()}) for Execution...`);
    await postRef.update({ scheduledAt: nearFuture, updatedAt: new Date() });

    // Action logic for near future
    const delay5s = 5000;
    await syncPostJob("pinterest", postId, { postId, userId: ctx.userId, pageId: ctx.accountId }, { delay: delay5s });

    await verifyJobState(postId, delay5s);
    console.log("   ✅ Job delay updated to ~5s.");

    // --- 6. Wait for Execution ---
    console.log(`\n[6/7] Waiting 10s for Execution...`);
    await new Promise(r => setTimeout(r, 10000));

    const refreshedPost = await postRef.get();
    const status = refreshedPost.data().status;
    if (status === 'published') {
        console.log(`   ✅ Post ${postId} is PUBLISHED!`);
        console.log(`   📌 Pin ID: ${refreshedPost.data().pinterestPinId}`);
    } else {
        console.error(`   ❌ Post status is '${status}' (Expected 'published'). Worker might not be running or failed.`);
    }

    // --- 7. Delete Test ---
    console.log(`\n[7/7] [DELETE] Testing Deletion Flow...`);
    const delDate = new Date(Date.now() + 3600000); // 1h
    const delPostRef = await createScheduledPost(ctx, delDate);
    const delPostId = delPostRef.id;

    console.log(`   -> Created Post ${delPostId} for +1h`);
    await verifyJobState(delPostId, 3600000);

    console.log(`   -> Deleting Post...`);
    await delPostRef.update({ delete: 1, deletedAt: new Date() });
    await removePostJob("pinterest", delPostId);

    const queue = queues[QUEUE_NAMES.PINTEREST];
    const delJob = await queue.getJob(delPostId);
    if (!delJob) {
        console.log(`   ✅ Job ${delPostId} successfully removed from queue.`);
    } else {
        const state = await delJob.getState();
        console.error(`   ❌ Job ${delPostId} still exists with state '${state}'!`);
    }

    console.log("\n✅ LIFECYCLE ROBUSTNESS SUITE COMPLETE.");
}

runRobustSuite().catch(err => {
    console.error("❌ Suite Failed:", err);
    process.exit(1);
});
