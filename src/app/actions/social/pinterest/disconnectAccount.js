"use server";

import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, updateDoc } from "firebase/firestore";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";

export async function disconnectPinterestAccount(accountId = null) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;
        const user = await verifyToken(token);

        if (!user) {
            throw new Error("Unauthorized");
        }

        let q;
        if (accountId) {
            // Disconnect specific account
            q = query(
                collection(db, "socialAccounts"),
                where("userId", "==", user.id),
                where("accountId", "==", accountId),
                where("platform", "==", "pinterest")
            );
        } else {
            // Disconnect all active Pinterest accounts if no ID provided
            q = query(
                collection(db, "socialAccounts"),
                where("userId", "==", user.id),
                where("platform", "==", "pinterest"),
                where("status", "==", "active")
            );
        }

        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            return { success: false, message: "No active Pinterest account found" };
        }

        const disconnectPromises = snapshot.docs.map(docSnap =>
            updateDoc(docSnap.ref, {
                status: "inactive",
                disconnectedAt: new Date(),
                accessToken: ""
            })
        );

        await Promise.all(disconnectPromises);

        return { success: true, message: "Pinterest disconnected successfully" };

    } catch (error) {
        console.error("Error disconnecting Pinterest account:", error);
        return { success: false, message: error.message };
    }
}
