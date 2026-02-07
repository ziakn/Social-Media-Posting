const { initAdmin } = require('../lib/queue/firebase-admin');
const db = initAdmin();

async function checkAccount(accountId, pageId) {
    console.log(`--- Checking Account: ${accountId} for Page: ${pageId} ---`);
    try {
        const doc = await db.collection('socialAccounts').doc(accountId).get();
        if (!doc.exists) {
            console.error('Account not found');
            return;
        }
        const data = doc.data();
        console.log('Account Platform:', data.platform);
        console.log('Account UserId:', data.userId);
        console.log('Pages Count:', data.pages?.length || 0);

        const page = data.pages?.find(p => String(p.pageId) === String(pageId));
        if (page) {
            console.log('Page Found!');
            console.log('pageAccessToken exists:', !!page.pageAccessToken);
            console.log('accessToken exists:', !!page.accessToken);
            console.log('Keys in page object:', Object.keys(page));
        } else {
            console.error('Page NOT FOUND in this account.');
            if (data.pages) {
                console.log('Available pages IDs:', data.pages.map(p => p.pageId));
            }
        }
    } catch (e) {
        console.error('Check failed:', e.message);
    }
    process.exit(0);
}

const accId = "t87mDYF3wNDegpv6PLz6";
const pgId = "936283306240077";
checkAccount(accId, pgId);
