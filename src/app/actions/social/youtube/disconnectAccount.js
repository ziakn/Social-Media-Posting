"use server";

import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, updateDoc, doc } from "firebase/firestore";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";

export async function disconnectYoutubeAccount() {
    try {
        const user = await verifyToken();
        if (!user) {
            return { success: false, message: "Invalid or expired token" };
        }

        // Query Firestore for YouTube account
        const q = query(
            collection(db, "socialAccounts"),
            where("userId", "==", user.id),
            where("platform", "==", "youtube"),
            where("status", "==", "active")
        );

        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            return { success: false, message: "YouTube account not connected" };
        }

        // Deactivate each connected YouTube record
        await Promise.all(
            snapshot.docs.map(async (docSnap) => {
                const ref = doc(db, "socialAccounts", docSnap.id);
                await updateDoc(ref, { status: "inactive" });
            })
        );

        return { success: true, message: "YouTube disconnected successfully" };
    } catch (err) {
        console.error("Error disconnecting YouTube:", err);
        return { success: false, message: err.message };
    }
}

