// app/actions/social/bluesky/getAccounts.js
"use server";

import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";

/**
 * Fetch all connected BlueSky accounts for the current user
 */
export async function fetchBlueSkyAccounts() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;
        const user = await verifyToken(token);

        if (!user) {
            return { success: false, message: "Unauthorized" };
        }

        const q = query(
            collection(db, "socialAccounts"),
            where("userId", "==", user.id),
            where("platform", "==", "bluesky"),
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
        console.error("Error fetching BlueSky accounts:", error);
        return { success: false, message: error.message };
    }
}
