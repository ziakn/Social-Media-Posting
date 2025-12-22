"use server";

import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";

export async function checkTwitterConnection() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;

        const user = await verifyToken(token);
        if (!user) {
            return { connected: false, message: "Invalid token" };
        }

        // Query Firestore for Twitter account
        const q = query(
            collection(db, "socialAccounts"),
            where("userId", "==", user.id),
            where("platform", "==", "twitter"),
            where("status", "==", "active")
        );

        const snapshot = await getDocs(q);

        // Extract data if connected
        let accountData = null;
        if (!snapshot.empty) {
            const data = snapshot.docs[0].data();
            accountData = {
                connected: true,
                displayName: data.username ? `@${data.username}` : (data.displayName || "Twitter Account"),
                tokenExpiresAt: data.tokenExpiresAt?.toDate?.() || null,
                count: snapshot.size,
                accounts: snapshot.docs.map(d => ({
                    displayName: d.data().username ? `@${d.data().username}` : (d.data().displayName || "Twitter Account"),
                    tokenExpiresAt: d.data().tokenExpiresAt?.toDate?.() || null
                }))
            };
        }

        return accountData || { connected: false };
    } catch (err) {
        console.error("Error checking Twitter connection:", err);
        return { connected: false, message: err.message };
    }
}
