
const { initAdmin } = require('../lib/queue/firebase-admin');
const db = initAdmin();

async function checkPostStatus() {
    const collections = [
        'facebook_posts',
        'linkedin_posts',
        'instagram_posts',
        'tiktok_posts',
        'pinterest_posts',
        'threads_posts',
        'bluesky_posts'
    ];

    console.log("--- Social Post Status Audit (Today's Posts) ---");
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const colName of collections) {
        console.log(`\nChecking collection: ${colName}`);
        try {
            const snapshot = await db.collection(colName)
                .where('createdAt', '>=', today)
                .orderBy('createdAt', 'desc')
                .limit(20)
                .get();

            if (snapshot.empty) {
                console.log("  No posts found today.");
                continue;
            }

            snapshot.docs.forEach(doc => {
                const data = doc.data();
                const time = data.createdAt?.toDate?.() || data.createdAt;
                console.log(`  [${doc.id}] Status: ${data.status} | Time: ${time?.toLocaleTimeString()}`);
                if (data.status === 'failed' || data.error) {
                    console.error(`    ❌ Error: ${data.error || 'Unknown error'}`);
                }
            });
        } catch (error) {
            console.error(`  ❌ Error querying ${colName}:`, error.message);
        }
    }
}

checkPostStatus();
