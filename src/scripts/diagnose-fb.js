const { initAdmin } = require('../lib/queue/firebase-admin');
const db = initAdmin();

async function diagnose(postId) {
    console.log(`--- Diagnosing Post: ${postId} ---`);
    try {
        const postSnap = await db.collection('facebook_posts').doc(postId).get();
        if (!postSnap.exists) {
            console.error(`Post ${postId} NOT FOUND in facebook_posts collection.`);
            return;
        }

        const post = postSnap.data();
        console.log('Post Data:', JSON.stringify(post, null, 2));

        const pageId = post.pageId;
        const accountId = post.accountId;

        console.log(`Looking for Page: ${pageId} in Account: ${accountId}`);

        if (!accountId) {
            console.error('CRITICAL: This post has NO accountId. New lookup logic will fail.');
            return;
        }

        const accountSnap = await db.collection('socialAccounts').doc(accountId).get();
        if (!accountSnap.exists) {
            console.error(`Account ${accountId} NOT FOUND in socialAccounts.`);
            return;
        }

        const account = accountSnap.data();
        console.log('Account Data (Keys Hidden):', Object.keys(account));
        console.log('Pages in Account:', account.pages ? account.pages.length : 0);

        const page = account.pages?.find(p => String(p.pageId) === String(pageId));
        if (page) {
            console.log('SUCCESS: Page found in account array.');
            console.log('Token exists:', !!(page.pageAccessToken || page.accessToken));
        } else {
            console.error('FAILURE: Page ID not found in account pages array.');
            if (account.pages) {
                console.log('Available Page IDs:', account.pages.map(p => p.pageId));
            }
        }

    } catch (e) {
        console.error('Diagnosis failed:', e.message);
    }
    process.exit(0);
}

const targetPostId = process.argv[2] || 'K8uMCnAHuhIZslxWJ1jD';
diagnose(targetPostId);
