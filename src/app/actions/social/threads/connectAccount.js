"use server";

import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";

export async function checkThreadsConnection() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;
        const user = await verifyToken(token);

        if (!user) {
            return { connected: false };
        }

        const q = query(
            collection(db, "socialAccounts"),
            where("userId", "==", user.id),
            where("platform", "==", "threads"),
            where("status", "==", "active")
        );

        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            return { connected: false };
        }

        const accounts = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        // Assuming one main account for now, but returning list structure
        const mainAccount = accounts[0];

        return {
            connected: true,
            displayName: mainAccount.username || mainAccount.pageName,
            tokenExpiresAt: mainAccount.tokenExpiresAt?.toDate().toISOString(),
            count: accounts.length,
            accounts: accounts.map(acc => ({ displayName: acc.username || acc.pageName }))
        };

    } catch (error) {
        console.error("Error checking Threads connection:", error);
        return { connected: false };
    }
}
