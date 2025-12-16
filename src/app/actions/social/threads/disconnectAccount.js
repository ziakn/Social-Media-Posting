"use server";

import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, updateDoc, deleteDoc } from "firebase/firestore";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";

export async function disconnectThreadsAccount() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;
        const user = await verifyToken(token);

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

        // Deactivate or delete all found Threads accounts for this user
        const disconnectPromises = snapshot.docs.map(doc =>
            // Option 1: Soft delete (set status to inactive)
            // updateDoc(doc.ref, { status: "inactive", disconnectedAt: new Date() })

            // Option 2: Hard delete (remove document) - often cleaner for "Disconnect" actions unless history is needed
            deleteDoc(doc.ref)
        );

        await Promise.all(disconnectPromises);

        return { success: true, message: "Threads account disconnected successfully" };

    } catch (error) {
        console.error("Error disconnecting Threads account:", error);
        return { success: false, message: "Failed to disconnect Threads account" };
    }
}
