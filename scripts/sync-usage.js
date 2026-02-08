// scripts/sync-usage.js
/**
 * Migration Script: Sync Usage Counters
 * This script scans all post collections and updates the User's atomic counters
 * based on existing posts in the current billing cycle.
 * Optimized to avoid complex Firestore composite indexes.
 */

const { Timestamp, FieldValue } = require('firebase-admin/firestore');
const { initAdmin } = require('../src/lib/queue/firebase-admin');

let db;
try {
    db = initAdmin();
} catch (e) {
    console.error("Firebase Init Error:", e.message);
    process.exit(1);
}

const POST_COLLECTIONS = [
    "facebook_posts",
    "instagram_posts",
    "twitter_posts",
    "linkedin_posts",
    "threads_posts",
    "tiktok_posts",
    "pinterest_posts",
    "youtube_posts",
    "bluesky_posts"
];

async function syncUserUsage(userId) {
    console.log(`\n--- Syncing Usage for User: ${userId} ---`);

    const userRef = db.collection('users').doc(userId);
    const billingRef = db.collection('billing_profiles').doc(userId);

    const userSnap = await userRef.get();
    if (!userSnap.exists) {
        console.error(`User ${userId} not found.`);
        return;
    }

    // Determine Cycle Start
    let cycleStart = new Date();
    cycleStart.setDate(1);
    cycleStart.setHours(0, 0, 0, 0);

    const billingSnap = await billingRef.get();
    if (billingSnap.exists) {
        const billingData = billingSnap.data();
        if (billingData.nextBillingDate) {
            const nextBilling = billingData.nextBillingDate.toDate();
            let start = new Date(nextBilling);
            if (billingData.billingCycle === 'monthly') {
                start.setMonth(start.getMonth() - 1);
            } else {
                start.setFullYear(start.getFullYear() - 1);
            }

            if (start > new Date()) {
                if (billingData.billingCycle === 'monthly') {
                    start.setMonth(start.getMonth() - 1);
                } else {
                    start.setFullYear(start.getFullYear() - 1);
                }
            }
            cycleStart = start;
        }
    }

    console.log(`Current Cycle Start: ${cycleStart.toISOString()}`);
    const cycleStartTs = Timestamp.fromDate(cycleStart);

    let totalPosts = 0;

    for (const collName of POST_COLLECTIONS) {
        // Query for posts for this user (simple query to avoid index errors)
        const q = db.collection(collName)
            .where('userId', '==', userId)
            .where('delete', '==', 0);

        const snap = await q.get();
        if (!snap.empty) {
            // Filter by date locally in Node.js
            const postsInCycle = snap.docs.filter(doc => {
                const data = doc.data();
                const createdAt = data.createdAt;
                if (!createdAt) return false;
                const createdAtDate = createdAt.toDate ? createdAt.toDate() : new Date(createdAt);
                return createdAtDate >= cycleStart;
            });

            if (postsInCycle.length > 0) {
                console.log(`- ${collName}: ${postsInCycle.length} posts found in current cycle`);
                totalPosts += postsInCycle.length;
            }
        }
    }

    console.log(`Total Usage Calculated: ${totalPosts}`);

    // Update User Document
    await userRef.update({
        monthlyPostUsage: totalPosts,
        usageCycleStart: cycleStartTs,
        lastUsageSync: FieldValue.serverTimestamp()
    });

    console.log(`SUCCESS: User ${userId} counter updated.`);
}

async function run() {
    const args = process.argv.slice(2);
    if (args.length > 0) {
        // Sync specific users
        for (const uid of args) {
            await syncUserUsage(uid);
        }
    } else {
        // Sync ALL users
        console.log("Scanning all users...");
        const usersSnap = await db.collection('users').get();
        for (const doc of usersSnap.docs) {
            await syncUserUsage(doc.id);
        }
    }
}

run().catch(console.error);
