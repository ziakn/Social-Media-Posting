const { initAdmin } = require('../src/lib/queue/firebase-admin');
const db = initAdmin();

async function debugPost(postId) {
    const snap = await db.collection('instagram_posts').doc(postId).get();
    if (!snap.exists) {
        console.log("Post not found");
        return;
    }
    console.log("Post Data:", JSON.stringify(snap.data(), null, 2));
}

const postId = process.argv[2];
if (!postId) {
    console.log("Usage: node debug-post.js <postId>");
    process.exit(1);
}

debugPost(postId).then(() => process.exit(0)).catch(err => {
    console.error(err);
    process.exit(1);
});
