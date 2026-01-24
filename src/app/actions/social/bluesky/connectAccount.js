"use server";

import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";

/**
 * Check if the user has a connected BlueSky account
 */
export async function checkBlueSkyConnection(userId = null) {
    try {
        const user = await verifyToken();

        if (!user) {
            return { connected: false };
        }

        // Determine target user ID
        // If admin and userId provided, use that. Otherwise use authenticated user's id.
        const targetUserId = (user.role === 'Administrator' && userId) ? userId : user.id;

        const q = query(
            collection(db, "socialAccounts"),
            where("userId", "==", targetUserId),
            where("platform", "==", "bluesky"),
            where("status", "==", "active")
        );

        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            return { connected: false };
        }

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

        const mainAccount = accounts[0];

        return {
            connected: true,
            displayName: mainAccount.username || mainAccount.pageName,
            tokenExpiresAt: mainAccount.tokenExpiresAt,
            count: accounts.length,
            accounts: accounts.map(acc => ({
                id: acc.id,
                displayName: acc.username || acc.pageName,
                profilePicture: acc.profilePicture,
                tokenExpiresAt: acc.tokenExpiresAt
            }))
        };

    } catch (error) {
        console.error("Error checking BlueSky connection:", error);
        return { connected: false };
    }
}
