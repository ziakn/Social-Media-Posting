
const { initAdmin } = require('../lib/queue/firebase-admin');
const db = initAdmin();

async function testAiDispatcherForInstagram() {
    const userId = "SJeZeu0KXl7TY4SFeup1";
    console.log("🔍 Fetching Instagram accounts for user:", userId);

    const snap = await db.collection('socialAccounts')
        .where('userId', '==', userId)
        .where('platform', '==', 'instagram')
        .get();

    if (snap.empty) {
        console.log("❌ No Instagram accounts found.");
        return;
    }

    const account = snap.docs[0].data();
    const accountDocId = snap.docs[0].id;
    console.log("✅ Found account:", account.username, "Doc ID:", accountDocId);

    // Mock Payload from AI Hub
    const payload = {
        accountIds: [accountDocId],
        targetIds: [account.accountId], // The UI typically sends the platform-specific ID
        content: "AI Hub Video Test " + new Date().toISOString(),
        mediaUrls: ["https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"]
    };

    console.log("🚀 Simulating createAiPost logic for Instagram...");

    // 1. Filter Logic (Simulated from createAiPost.js)
    const selectedConnections = [{ id: accountDocId, ...account }];
    const targetIds = payload.targetIds;

    for (const acc of selectedConnections) {
        let targetsToPost = [];

        // Simulating the fix I just added
        const isTargetSelected = targetIds.includes(acc.id) ||
            (acc.accountId && targetIds.includes(String(acc.accountId))) ||
            (acc.igUserId && targetIds.includes(String(acc.igUserId))) ||
            (acc.platformUserId && targetIds.includes(String(acc.platformUserId)));

        if (isTargetSelected) {
            targetsToPost = [{
                id: acc.accountId || acc.igUserId || acc.platformUserId || acc.id,
                name: acc.displayName || acc.username
            }];
            console.log("✨ Target matched successfully!");
        } else {
            console.log("❌ Target NOT matched. Check IDs:", {
                accId: acc.id,
                accAccountId: acc.accountId,
                targetIds
            });
            continue;
        }

        for (const target of targetsToPost) {
            console.log("📦 Preparing to call Instagram action for target:", target.id);
            // This is where it would call createInstagramVideoPost(target.id, ...)
            console.log("✅ Success: Dispatcher would hit the Instagram Video action.");
        }
    }
}

testAiDispatcherForInstagram();
