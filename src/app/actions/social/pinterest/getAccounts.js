"use server";

import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, updateDoc } from "firebase/firestore";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";
import { getValidPinterestAccessToken } from "./connectAccount";

/**
 * Fetch all connected Pinterest accounts for the current user
 */
export async function getPinterestAccounts() {
    try {
        const user = await verifyToken();

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
        const user = await verifyToken();

        if (!user) {
            console.error("getPinterestBoards: Unauthorized");
            return { success: false, message: "Unauthorized" };
        }

        console.log(`getPinterestBoards: Fetching boards for user ${user.id}, account ${platformUserId}`);

        const q = query(
            collection(db, "socialAccounts"),
            where("userId", "==", user.id),
            where("accountId", "==", platformUserId),
            where("platform", "==", "pinterest"),
            where("status", "==", "active")
        );
        const snapshot = await getDocs(q);
        if (snapshot.empty) {
            console.error("getPinterestBoards: Account not found");
            throw new Error("Pinterest account not found or inactive");
        }

        const account = snapshot.docs[0].data();

        // 1. Return cached boards if available
        if (account.boards && Array.isArray(account.boards) && account.boards.length > 0) {
            console.log("getPinterestBoards: Returning cached boards from Firestore");
            return { success: true, boards: account.boards };
        }

        // 2. Fallback: Fetch from API if cache is empty
        const { accessToken } = await getValidPinterestAccessToken(user.id, platformUserId);
        console.log("getPinterestBoards: Cache empty, fetching from API");

        const apiUrl = process.env.PINTEREST_API_URL || "https://api.pinterest.com/v5";
        const url = `${apiUrl}/boards`;
        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
            cache: "no-store"
        });

        const data = await response.json();
        // console.log("getPinterestBoards: API Response", JSON.stringify(data));

        if (!response.ok) {
            console.error("getPinterestBoards: API Error", data);
            throw new Error(data.message || "Failed to fetch boards");
        }

        const freshBoards = data.items || [];

        // 3. Update cache
        if (freshBoards.length > 0) {
            await updateDoc(snapshot.docs[0].ref, {
                boards: freshBoards,
                updatedAt: new Date() // Use JS Date or imported serverTimestamp if needed, keeping simple Date for now as per previous patterns or imports
            });
            console.log("getPinterestBoards: Updated Firestore cache");
        }

        return { success: true, boards: freshBoards };
    } catch (error) {
        console.error("Error fetching Pinterest boards:", error);
        return { success: false, message: error.message };
    }
}
