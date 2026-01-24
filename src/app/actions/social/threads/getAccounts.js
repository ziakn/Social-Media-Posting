// app/actions/social/threads/getAccounts.js
"use server";

import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";

/**
 * Fetch all connected Threads accounts for the current user
 */
export async function fetchThreadsAccounts() {
    try {
        const user = await verifyToken();

        if (!user) {
            return { success: false, message: "Unauthorized" };
        }

        const q = query(
            collection(db, "socialAccounts"),
            where("userId", "==", user.id),
            where("platform", "==", "threads"),
            where("status", "==", "active")
        );

        const snapshot = await getDocs(q);
        const accounts = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            tokenExpiresAt: doc.data().tokenExpiresAt?.toDate().toISOString(),
            createdAt: doc.data().createdAt?.toDate().toISOString(),
        }));

        return { success: true, accounts };

    } catch (error) {
        console.error("Error fetching Threads accounts:", error);
        return { success: false, message: error.message };
    }
}
