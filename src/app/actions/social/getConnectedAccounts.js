"use server";

import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { verifyToken } from "@/lib/auth";

export async function getConnectedAccounts() {
    try {
        const user = await verifyToken();
        if (!user) {
            return { success: false, data: [] };
        }

        // Query Firestore for all active social accounts
        const q = query(
            collection(db, "socialAccounts"),
            where("userId", "==", user.id),
            where("status", "==", "active")
        );

        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            return { success: true, data: [] };
        }

        // Extract unique platform names
        const platforms = new Set();
        snapshot.docs.forEach((doc) => {
            const data = doc.data();
            if (data.platform) {
                platforms.add(data.platform.toLowerCase());
            }
        });

        return { success: true, data: Array.from(platforms) };
    } catch (error) {
        console.error("Error fetching connected accounts:", error);
        return { success: false, error: error.message };
    }
}
