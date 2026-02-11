
const { initAdmin } = require('../lib/queue/firebase-admin');
const db = initAdmin();

async function checkLinkedInPosts() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const snapshot = await db.collection('linkedin_posts')
        .where('createdAt', '>=', today)
        .get();

    console.log(`--- LinkedIn Posts Today (${snapshot.size}) ---`);
    snapshot.forEach(doc => {
        const data = doc.data();
        console.log(`ID: ${doc.id} | Status: ${data.status} | Page: ${data.pageId || data.accountId}`);
    });
}

checkLinkedInPosts();
