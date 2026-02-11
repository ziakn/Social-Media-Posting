
const { initAdmin } = require('../lib/queue/firebase-admin');
const db = initAdmin();

// We can't import the "use server" action directly here easily, 
// so we simulate the dispatcher -> database flow for LinkedIn.

async function verifyLinkedInPersistence() {
    const userId = "SJeZeu0KXl7TY4SFeup1";
    console.log("🔍 Fetching LinkedIn account for user:", userId);

    const snap = await db.collection('socialAccounts')
        .where('userId', '==', userId)
        .where('platform', '==', 'linkedin')
        .get();

    if (snap.empty) {
        console.log("❌ No LinkedIn accounts found.");
        return;
    }

    const accountDocId = snap.docs[0].id;
    const accountData = snap.docs[0].data();
    console.log("✅ Found account:", accountData.displayName, "Doc ID:", accountDocId);

    // Simulate Case: AI Hub -> Dispatcher -> LinkedIn Action
    // Dispatcher calls createLinkedinPost({ accountId: accountDocId, ... })

    console.log("📝 Simulating LinkedIn action (Firestore save)...");
    const postData = {
        platform: "linkedin",
        userId,
        accountId: accountDocId,
        content: {
            text: "LinkedIn Verification " + new Date().toISOString(),
            media: []
        },
        status: "queued",
        createdAt: new Date(),
        updatedAt: new Date(),
        delete: 0
    };

    const ref = await db.collection('linkedin_posts').add(postData);
    console.log("🚀 LinkedIn post saved to Firestore! ID:", ref.id);
    console.log("🔗 Verify in audit or check database.");
}

verifyLinkedInPersistence();
