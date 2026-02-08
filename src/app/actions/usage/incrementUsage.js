// app/actions/usage/incrementUsage.js
import { db } from "@/lib/firebase";
import {
    doc,
    runTransaction,
    increment,
    Timestamp,
    getDoc
} from "firebase/firestore";

/**
 * Atomically increments the user's monthly post usage.
 * Handles billing cycle resets automatically.
 */
export async function incrementUsage(userId) {
    try {
        const userRef = doc(db, "users", userId);
        const billingProfileRef = doc(db, "billing_profiles", userId);

        // 1. Determine the expected cycle start (logic must match usageActions.js)
        let expectedCycleStart = new Date();
        expectedCycleStart.setDate(1);
        expectedCycleStart.setHours(0, 0, 0, 0);

        const billingProfileSnap = await getDoc(billingProfileRef);
        if (billingProfileSnap.exists()) {
            const billingData = billingProfileSnap.data();
            if (billingData.nextBillingDate) {
                const nextBilling = billingData.nextBillingDate.toDate ? billingData.nextBillingDate.toDate() : new Date(billingData.nextBillingDate);
                const cycleStart = new Date(nextBilling);
                if (billingData.billingCycle === 'monthly') {
                    cycleStart.setMonth(cycleStart.getMonth() - 1);
                } else {
                    cycleStart.setFullYear(cycleStart.getFullYear() - 1);
                }

                if (cycleStart > new Date()) {
                    if (billingData.billingCycle === 'monthly') {
                        cycleStart.setMonth(cycleStart.getMonth() - 1);
                    } else {
                        cycleStart.setFullYear(cycleStart.getFullYear() - 1);
                    }
                }
                expectedCycleStart = cycleStart;
            }
        }

        const expectedCycleStartTs = Timestamp.fromDate(expectedCycleStart);

        // 2. Perform atomic update via transaction to handle reset safely
        await runTransaction(db, async (transaction) => {
            const userSnap = await transaction.get(userRef);
            if (!userSnap.exists()) return;

            const userData = userSnap.data();
            const currentCycleStart = userData.usageCycleStart;

            // If cycle has changed, reset to 1
            if (!currentCycleStart || currentCycleStart.toMillis() !== expectedCycleStartTs.toMillis()) {
                transaction.update(userRef, {
                    monthlyPostUsage: 1,
                    usageCycleStart: expectedCycleStartTs,
                    updatedAt: Timestamp.now()
                });
                console.log(`[Usage Counter] Reset usage for user ${userId} to 1 (New Cycle: ${expectedCycleStart.toISOString()})`);
            } else {
                // Otherwise increment
                transaction.update(userRef, {
                    monthlyPostUsage: increment(1),
                    updatedAt: Timestamp.now()
                });
            }
        });

        return { success: true };
    } catch (error) {
        console.error("[Usage Counter] Error incrementing usage:", error);
        return { success: false, error: error.message };
    }
}
