"use server";

import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, updateDoc, doc } from "firebase/firestore";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";

export async function disconnectTwitterAccount() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;

        const user = await verifyToken(token);
        if (!user) {
            return { success: false, message: "Invalid or expired token" };
        }

        // Query Firestore for Twitter account
        const q = query(
            collection(db, "socialAccounts"),
            where("userId", "==", user.id),
            where("platform", "==", "twitter"),
            where("status", "==", "active")
        );

        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            return { success: false, message: "Twitter account not connected" };
        }

        // Deactivate each connected Twitter record
        await Promise.all(
            snapshot.docs.map(async (docSnap) => {
                const ref = doc(db, "socialAccounts", docSnap.id);
                await updateDoc(ref, { status: "inactive" });
            })
        );

        return { success: true, message: "Twitter disconnected successfully" };
    } catch (err) {
        console.error("Error disconnecting Twitter:", err);
        return { success: false, message: err.message };
    }
}
