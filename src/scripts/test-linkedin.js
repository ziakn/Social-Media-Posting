
const { initAdmin } = require('../lib/queue/firebase-admin');
const db = initAdmin();

async function testLinkedInDispatcher() {
    const userId = "SJeZeu0KXl7TY4SFeup1";
    console.log("🔍 Fetching LinkedIn accounts for user:", userId);

    const snap = await db.collection('socialAccounts')
        .where('userId', '==', userId)
        .where('platform', '==', 'linkedin')
        .get();

    if (snap.empty) {
        console.log("❌ No LinkedIn accounts found.");
        return;
    }

    for (const doc of snap.docs) {
        const account = doc.data();
        const accountDocId = doc.id;
        console.log("\n--- Checking Account ---");
        console.log("Name:", account.displayName, "Doc ID:", accountDocId);
        console.log("Pages array exists:", Array.isArray(account.pages), "Length:", account.pages?.length || 0);

        // Simulation of the CURRENT BUGGY logic
        console.log("🤖 Current Logic Simulation:");
        let targetsBuggy = [];
        if (['facebook', 'linkedin'].includes('linkedin')) {
            if (Array.isArray(account.pages)) {
                targetsBuggy = account.pages.filter(page => [accountDocId].includes(page.id || page.pageId));
            }
        }
        console.log("Result (Buggy):", targetsBuggy.length, "targets found.");

        // Simulation of the PROPOSED FIX logic
        console.log("✅ Proposed Fix Logic Simulation:");
        let targetsFixed = [];
        const usePagesLogic = (account.platform === 'facebook') || (account.platform === 'linkedin' && Array.isArray(account.pages) && account.pages.length > 0);

        if (usePagesLogic) {
            targetsFixed = account.pages.filter(page => [accountDocId].includes(page.id || page.pageId));
        } else {
            // Profile logic
            const isTargetSelected = [accountDocId].includes(accountDocId) ||
                (account.platformUserId && [accountDocId].includes(String(account.platformUserId)));
            if (isTargetSelected) {
                targetsFixed = [{ id: account.platformUserId || accountDocId, name: account.displayName }];
            }
        }
        console.log("Result (Fixed):", targetsFixed.length, "targets found.");
    }
}

testLinkedInDispatcher();
