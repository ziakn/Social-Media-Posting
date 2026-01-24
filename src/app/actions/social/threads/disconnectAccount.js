"use server";

import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, updateDoc, deleteDoc } from "firebase/firestore";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";

export async function disconnectThreadsAccount() {
    try {
        const user = await verifyToken();

        if (!user) {
            throw new Error("Unauthorized");
        }

        const q = query(
            collection(db, "socialAccounts"),
            where("userId", "==", user.id),
            where("platform", "==", "threads"),
            where("status", "==", "active")
        );

        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            return { success: false, message: "No active Threads account found" };
        }

        // Deactivate all found Threads accounts for this user (Soft Delete)
        const disconnectPromises = snapshot.docs.map(docSnap =>
            updateDoc(docSnap.ref, {
                status: "inactive",
                disconnectedAt: new Date(),
                accessToken: ""
            })
        );

        await Promise.all(disconnectPromises);

        return { success: true, message: "Threads disconnected successfully" };

    } catch (error) {
        console.error("Error disconnecting Threads account:", error);
        return { success: false, message: error.message };
    }
}
