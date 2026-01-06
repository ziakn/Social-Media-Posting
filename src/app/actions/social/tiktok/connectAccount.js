// src/app/actions/social/tiktok/connectAccount.js
"use server";

import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

export async function checkTiktokConnection() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;
        const user = await verifyToken(token);
        if (!user) return { connected: false };

        const q = query(
            collection(db, "socialAccounts"),
            where("userId", "==", user.id),
            where("platform", "==", "tiktok"),
            where("status", "==", "active")
        );

        const snapshot = await getDocs(q);
        if (snapshot.empty) return { connected: false };

        const accounts = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                tokenExpiresAt: data.tokenExpiresAt?.toDate?.().toISOString() || data.tokenExpiresAt || null,
                createdAt: data.createdAt?.toDate?.().toISOString() || data.createdAt || null,
                updatedAt: data.updatedAt?.toDate?.().toISOString() || data.updatedAt || null,
            };
        });

        return {
            connected: true,
            count: accounts.length,
            accounts: accounts
        };
    } catch (error) {
        console.error("Error checking TikTok connection:", error);
        return { connected: false };
    }
}
