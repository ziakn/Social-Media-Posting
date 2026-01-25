// src/app/actions/social/tiktok/getAccounts.js
"use server";

import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

/**
 * Fetch connected TikTok accounts for the current user
 */
export async function getUserTikTokAccounts() {
    try {
        const user = await verifyToken();

        if (!user) {
            return { success: false, message: "Invalid or expired token" };
        }

        const q = query(
            collection(db, "socialAccounts"),
            where("userId", "==", user.id),
            where("platform", "==", "tiktok"),
            where("status", "==", "active")
        );

        const snapshot = await getDocs(q);
        const accounts = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                accountId: data.accountId, // Real platform ID
                name: data.displayName,
                username: data.username,
                profilePicture: data.profilePicture,
                accessToken: data.accessToken,
                refreshToken: data.refreshToken,
                tokenExpiresAt: data.tokenExpiresAt?.toDate?.().toISOString() || data.tokenExpiresAt || null,
            };
        });

        return { success: true, accounts };
    } catch (error) {
        console.error("Error fetching TikTok accounts:", error);
        return { success: false, message: "Failed to fetch TikTok accounts" };
    }
}
