// src/app/actions/usage/decrementUsage.js
"use server";

import { db } from "@/lib/firebase";
import { doc, runTransaction, increment, Timestamp, serverTimestamp } from "firebase/firestore";

/**
 * Atomically decrements the monthly post usage for a user.
 * Usually called when a scheduled post is deleted before being published.
 * 
 * @param {string} userId - The unique ID of the user
 */
export async function decrementUsage(userId) {
    if (!userId) return { success: false, error: "Missing userId" };

    const userRef = doc(db, "users", userId);

    try {
        await runTransaction(db, async (transaction) => {
            const userSnap = await transaction.get(userRef);
            if (!userSnap.exists()) return;

            const userData = userSnap.data();
            const currentUsage = userData.monthlyPostUsage || 0;

            // Only decrement if usage is greater than 0
            if (currentUsage > 0) {
                transaction.update(userRef, {
                    monthlyPostUsage: increment(-1),
                    updatedAt: serverTimestamp()
                });
            }
        });

        return { success: true };
    } catch (error) {
        console.error("Error decrementing usage:", error);
        return { success: false, error: error.message };
    }
}
