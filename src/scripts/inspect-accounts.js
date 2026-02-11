
const { initAdmin } = require('../lib/queue/firebase-admin');
const db = initAdmin();

async function inspectAccounts() {
    const platforms = ['instagram', 'linkedin', 'tiktok', 'facebook'];
    for (const platform of platforms) {
        console.log(`\n--- ${platform.toUpperCase()} Accounts ---`);
        const snapshot = await db.collection('socialAccounts')
            .where('platform', '==', platform)
            .limit(2)
            .get();

        snapshot.forEach(doc => {
            const data = doc.data();
            console.log(`ID: ${doc.id} | User: ${data.userId}`);
            console.log(`  pageId: ${data.pageId}`);
            console.log(`  accountId: ${data.accountId}`);
            console.log(`  igUserId: ${data.igUserId}`);
            console.log(`  platformUserId: ${data.platformUserId}`);
            if (data.pages) {
                console.log(`  Pages: ${data.pages.length}`);
                data.pages.forEach(p => console.log(`    - ${p.name} (id: ${p.id}, pageId: ${p.pageId})`));
            }
        });
    }
}

inspectAccounts();
