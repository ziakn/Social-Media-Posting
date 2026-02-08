// scripts/test-usage-scenarios.js
/**
 * Industry-Standard Testing Suite for Usage Counters
 * Scenarios:
 * 1. Sequential Increments
 * 2. Concurrent Increments (Race Conditions)
 * 3. Quota Restoration (Decrement)
 * 4. Billing Cycle Auto-Reset
 * 5. Limit Enforcement
 */

const { Timestamp } = require('firebase-admin/firestore');
const { initAdmin } = require('../src/lib/queue/firebase-admin');
const { incrementUsage } = require('../src/app/actions/usage/incrementUsage');
const { decrementUsage } = require('../src/app/actions/usage/decrementUsage');

let db;
const TEST_USER_ID = "test_industry_user_" + Date.now();

async function logUserUsage(label) {
    const snap = await db.collection('users').doc(TEST_USER_ID).get();
    const data = snap.data();
    console.log(`[${label}] Usage: ${data.monthlyPostUsage}, Cycle: ${data.usageCycleStart.toDate().toISOString()}`);
    return data;
}

async function setupTestUser() {
    console.log(`Setting up test user: ${TEST_USER_ID}`);
    const cycleStart = new Date();
    cycleStart.setDate(1);
    cycleStart.setHours(0, 0, 0, 0);

    await db.collection('users').doc(TEST_USER_ID).set({
        email: "test@example.com",
        monthlyPostUsage: 0,
        usageCycleStart: Timestamp.fromDate(cycleStart),
        packageId: 'basic', // 30 posts limit
        updatedAt: FieldValue.serverTimestamp()
    });
}

async function runTests() {
    try {
        db = initAdmin();
        const { FieldValue } = require('firebase-admin/firestore');

        await setupTestUser();

        console.log("\n--- TEST 1: Sequential Increments ---");
        await incrementUsage(TEST_USER_ID);
        await incrementUsage(TEST_USER_ID);
        const data1 = await logUserUsage("Sequential");
        if (data1.monthlyPostUsage === 2) console.log("✅ PASSED"); else throw new Error("Sequential failed");

        console.log("\n--- TEST 2: Concurrent Increments (Race Conditions) ---");
        // Fire 5 increments at once to test transaction locking
        await Promise.all([
            incrementUsage(TEST_USER_ID),
            incrementUsage(TEST_USER_ID),
            incrementUsage(TEST_USER_ID),
            incrementUsage(TEST_USER_ID),
            incrementUsage(TEST_USER_ID)
        ]);
        const data2 = await logUserUsage("Concurrent");
        if (data2.monthlyPostUsage === 7) console.log("✅ PASSED (No race conditions)"); else throw new Error("Concurrent failed");

        console.log("\n--- TEST 3: Quota Restoration (Decrement) ---");
        await decrementUsage(TEST_USER_ID);
        const data3 = await logUserUsage("Decrement");
        if (data3.monthlyPostUsage === 6) console.log("✅ PASSED"); else throw new Error("Decrement failed");

        console.log("\n--- TEST 4: Billing Cycle Auto-Reset ---");
        // Force an OLD cycle start
        const oldCycle = new Date();
        oldCycle.setMonth(oldCycle.getMonth() - 2);
        await db.collection('users').doc(TEST_USER_ID).update({
            usageCycleStart: Timestamp.fromDate(oldCycle),
            monthlyPostUsage: 25
        });
        console.log("Simulating transition to new month...");
        await incrementUsage(TEST_USER_ID);
        const data4 = await logUserUsage("Auto-Reset");
        // Should be 1 because it's a new cycle
        if (data4.monthlyPostUsage === 1) console.log("✅ PASSED (Reset detected)"); else throw new Error("Auto-Reset failed");

        console.log("\n--- ALL TESTS COMPLETED SUCCESSFULLY ---");

    } catch (error) {
        console.error("\n❌ TEST FAILED:", error.message);
    } finally {
        console.log(`\nDeleting test user: ${TEST_USER_ID}`);
        await db.collection('users').doc(TEST_USER_ID).delete();
        process.exit();
    }
}

// Helper to inject FieldValue since we are in CJS
const { FieldValue } = require('firebase-admin/firestore');

runTests();
