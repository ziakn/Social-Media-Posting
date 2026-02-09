const { initAdmin } = require('../src/lib/queue/firebase-admin');
const { syncPostJob, removePostJob, queues, QUEUE_NAMES } = require('../src/lib/queue/queues');
const db = initAdmin();

/**
 * PINTEREST DEEP ROBUSTNESS SUITE
 * 
 * Testing Scenarios:
 * 1.  [STRESS] Bulk Creation (5 posts in parallel) -> Verifies queue throughput
 * 2.  [CONCURRENCY] Rapid Updates (Debounce check) -> Verifies race condition handling
 * 3.  [ERROR] Invalid Data -> Verifies worker resilience
 * 4.  [MIXED] Heavy Load -> Video + Carousel + Image simultaneous
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

async function createTestPin(ctx, data) {
    const postRef = await db.collection('pinterest_posts').add({
        userId: ctx.userId,
        accountId: ctx.accountId,
        platform: "pinterest",
        status: "queued",
        createdAt: new Date(),
        updatedAt: new Date(),
        delete: 0,
        boardId: ctx.boardId,
        ...data
    });
    return postRef;
}

async function runDeepSuite() {
    console.log("📌 Starting PINTEREST DEEP ROBUSTNESS TEST...");
    const ctx = await getTestContext();
    console.log(`Account: ${ctx.accountId}\n`);

    // --- 1. STRESS POSTING ---
    console.log("\n[1/4] 🔥 STRESS TEST: Queueing 5 posts simultaneously...");
    const stressPosts = [];
    for (let i = 0; i < 5; i++) {
        stressPosts.push(createTestPin(ctx, {
            title: `Stress Test #${i}`,
            message: `Load testing #${i}`,
            postType: "standard",
            content: { media: [{ type: "image", url: "https://picsum.photos/seed/" + i + "/1000/1000" }] }
        }));
    }
    const createdStressPosts = await Promise.all(stressPosts);

    // Sync all at once
    console.log("   -> Syncing 5 jobs in parallel...");
    await Promise.all(createdStressPosts.map(p =>
        syncPostJob("pinterest", p.id, { postId: p.id, userId: ctx.userId, pageId: ctx.accountId }, { delay: 1000 * (Math.random() * 5) })
    ));
    console.log("   ✅ Bulk sync accepted.");

    // --- 2. RAPID UPDATES ---
    console.log("\n[2/4] ⚡ RAPID UPDATE TEST: Updating same post 5 times...");
    const rapidPost = await createTestPin(ctx, {
        title: "Rapid Update Test",
        status: "scheduled",
        scheduledAt: new Date(Date.now() + 3600000)
    });

    for (let i = 1; i <= 5; i++) {
        console.log(`   -> Update #${i}: Scheduled for ${i}h from now...`);
        // We don't verify wait here, we just hammer the queue
        await syncPostJob("pinterest", rapidPost.id, { postId: rapidPost.id, userId: ctx.userId, pageId: ctx.accountId }, { delay: i * 3600000 });
    }
    console.log("   ✅ Rapid updates sent. Worker should handle replacement cleanly.");

    // --- 3. ERROR RESILIENCE ---
    console.log("\n[3/4] 💣 ERROR TEST: Sending invalid image URL...");
    const errorPost = await createTestPin(ctx, {
        title: "Error Test",
        message: "This should fail gracefully",
        postType: "standard",
        content: { media: [{ type: "image", url: "https://invalid-url.this-does-not-exist/fail.jpg" }] }
    });
    await syncPostJob("pinterest", errorPost.id, { postId: errorPost.id, userId: ctx.userId, pageId: ctx.accountId });
    console.log("   ✅ Invalid job queued. Monitor worker for graceful failure.");

    // --- 4. MIXED HEAVY LOAD ---
    console.log("\n[4/4] 🏋️ MIXED LOAD: Video + Carousel + Image...");

    const pVideo = await createTestPin(ctx, {
        title: "Mixed: Video", postType: "video",
        content: { media: [{ type: "video", url: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4" }] }
    });

    const pCarousel = await createTestPin(ctx, {
        title: "Mixed: Carousel", postType: "carousel",
        content: {
            media: [
                { type: "image", url: "https://picsum.photos/seed/m1/1000/1000" },
                { type: "image", url: "https://picsum.photos/seed/m2/1000/1000" }
            ]
        }
    });

    const pStandard = await createTestPin(ctx, {
        title: "Mixed: Standard", postType: "standard",
        content: { media: [{ type: "image", url: "https://picsum.photos/seed/m3/1000/1000" }] }
    });

    console.log("   -> Queueing mixed batch...");
    await Promise.all([
        syncPostJob("pinterest", pVideo.id, { postId: pVideo.id, userId: ctx.userId, pageId: ctx.accountId }),
        syncPostJob("pinterest", pCarousel.id, { postId: pCarousel.id, userId: ctx.userId, pageId: ctx.accountId }),
        syncPostJob("pinterest", pStandard.id, { postId: pStandard.id, userId: ctx.userId, pageId: ctx.accountId })
    ]);

    console.log("\n✅ DEEP SUITE COMPLETE. Monitor logs for:");
    console.log("   1. 5 successful Stress posts");
    console.log("   2. 1 scheduled Rapid post (replacing privous ones)");
    console.log("   3. 1 FAILED Error post (Graceful error logged)");
    console.log("   4. 3 Mixed posts (Video polling + others)");
}

runDeepSuite().catch(err => {
    console.error("❌ Suite Failed:", err);
    process.exit(1);
});
