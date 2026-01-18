"use server";

import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";

/**
 * Fetch all connected Pinterest accounts for the current user
 */
export async function getPinterestAccounts() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;
        const user = await verifyToken(token);

        if (!user) {
            return { success: false, message: "Unauthorized" };
        }

        const q = query(
            collection(db, "socialAccounts"),
            where("userId", "==", user.id),
            where("platform", "==", "pinterest"),
            where("status", "==", "active")
        );

        const snapshot = await getDocs(q);
        const accounts = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            tokenExpiresAt: doc.data().tokenExpiresAt?.toDate?.().toISOString() || doc.data().tokenExpiresAt || null,
            createdAt: doc.data().createdAt?.toDate?.().toISOString() || doc.data().createdAt || null,
            updatedAt: doc.data().updatedAt?.toDate?.().toISOString() || doc.data().updatedAt || null,
        }));

        return { success: true, accounts };

    } catch (error) {
        console.error("Error fetching Pinterest accounts:", error);
        return { success: false, message: error.message };
    }
}

/**
 * Fetch available boards for a Pinterest account
 */
export async function getPinterestBoards(platformUserId) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;
        const user = await verifyToken(token);

        if (!user) {
            return { success: false, message: "Unauthorized" };
        }

        const q = query(
            collection(db, "socialAccounts"),
            where("userId", "==", user.id),
            where("accountId", "==", platformUserId),
            where("platform", "==", "pinterest"),
            where("status", "==", "active")
        );
        const snapshot = await getDocs(q);
        if (snapshot.empty) throw new Error("Pinterest account not found or inactive");

        const account = snapshot.docs[0].data();
        const accessToken = account.accessToken;

        const url = `https://api.pinterest.com/v5/boards`;
        const response = await fetch(url, {
            headers: {
                "Authorization": `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            }
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || "Failed to fetch boards");
        }

        return { success: true, boards: data.items || [] };
    } catch (error) {
        console.error("Error fetching Pinterest boards:", error);
        return { success: false, message: error.message };
    }
}
