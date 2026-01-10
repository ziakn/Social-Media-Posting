"use server";

import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, writeBatch, doc } from "firebase/firestore";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";

export async function disconnectTelegramAccount() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;

        const user = await verifyToken(token);
        if (!user) {
            return { success: false, message: "Invalid token" };
        }

        // Query Firestore for active Telegram accounts for this user
        const q = query(
            collection(db, "socialAccounts"),
            where("userId", "==", user.id),
            where("platform", "==", "telegram"),
            where("status", "==", "active")
        );

        const snapshot = await getDocs(q);
        
        if (snapshot.empty) {
            return { success: true, message: "No Telegram account connected" };
        }

        const batch = writeBatch(db);
        snapshot.docs.forEach((d) => {
            // Option 1: Delete the document
            // batch.delete(d.ref);

            // Option 2: Set status to inactive
            batch.update(d.ref, { 
                status: "inactive",
                disconnectedAt: new Date()
            });
        });

        await batch.commit();

        return { success: true, message: "Telegram account disconnected successfully" };
    } catch (err) {
        console.error("Error disconnecting Telegram:", err);
        return { success: false, message: err.message };
    }
}
