"use server";

import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";

export async function checkYoutubeConnection() {
    try {
        const user = await verifyToken();
        if (!user) {
            return { connected: false, message: "Invalid token" };
        }

        // Query Firestore for YouTube account
        const q = query(
            collection(db, "socialAccounts"),
            where("userId", "==", user.id),
            where("platform", "==", "youtube"),
            where("status", "==", "active")
        );

        const snapshot = await getDocs(q);

        // Extract data if connected
        let accountData = null;
        if (!snapshot.empty) {
            const data = snapshot.docs[0].data();
            accountData = {
                connected: true,
                accountId: snapshot.docs[0].id,
                displayName: data.displayName || "YouTube Channel",
                username: data.username || "",
                profilePicture: data.profilePicture || "",
                tokenExpiresAt: data.tokenExpiresAt?.toDate?.().toISOString() || null,
                count: snapshot.size,
                accounts: snapshot.docs.map(d => {
                    const accData = d.data();
                    return {
                        id: d.id,
                        name: accData.displayName || "YouTube Channel",
                        username: accData.username || "",
                        profilePicture: accData.profilePicture || "",
                        tokenExpiresAt: accData.tokenExpiresAt?.toDate?.().toISOString() || null
                    };
                })
            };
        }

        return accountData || { connected: false };
    } catch (err) {
        console.error("Error checking YouTube connection:", err);
        return { connected: false, message: err.message };
    }
}
