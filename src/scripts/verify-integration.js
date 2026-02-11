
const { createAiPost } = require('./src/app/actions/social/ai/createAiPost');
const { db } = require('./src/lib/firebase');
const { collection, getDocs, query, where, limit } = require('firebase/firestore');

async function verifyIntegration() {
    console.log("🚀 Starting Social Post Integration Verification...");

    // 1. Mock Data
    const testPayload = {
        accountIds: [], // We need to fetch real active account IDs from the user's DB
        targetIds: [],  // We need to fetch real target IDs
        content: "Verification Test: AI Hub Persistence & Queuing " + new Date().toISOString(),
        mediaUrls: ["https://placehold.co/600x400/png?text=Verification+Test"]
    };

    try {
        // 2. Fetch Active Accounts
        console.log("🔍 Looking for active social accounts...");
        const q = query(collection(db, "socialAccounts"), where("status", "==", "active"), limit(10));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            console.error("❌ No active social accounts found! Cannot test posting flow.");
            return;
        }

        const accounts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        testPayload.accountIds = accounts.map(a => a.id);

        // Mock targets (assume connection ID is the target for profiles)
        testPayload.targetIds = accounts.map(a => a.id);

        console.log(`✅ Found ${accounts.length} active platforms: ${accounts.map(a => a.platform).join(', ')}`);

        // 3. Trigger AI Post
        console.log("📤 Triggering createAiPost...");
        const result = await createAiPost(testPayload);
        console.log("📝 Initial Result Summary:", result.summary);

        // 4. Verify Firestore & Queue
        for (const res of result.results) {
            if (res.success) {
                console.log(`✨ [${res.platform}] Reported Success. Verifying persistence...`);
                // Note: In an actual test script we would query the specific collection
                // e.g. db.collection(`${res.platform}_posts`).doc(res.postId || res.firestoreId)
            } else {
                console.error(`❌ [${res.platform}] Failed: ${res.message}`);
            }
        }

    } catch (error) {
        console.error("💥 Verification process failed:", error);
    }
}

// verifyIntegration();
