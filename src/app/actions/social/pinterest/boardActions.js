"use server";

import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, updateDoc } from "firebase/firestore";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";

/**
 * Create a new Pinterest Board
 */
export async function createPinterestBoard(platformUserId, boardName) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;
        const user = await verifyToken(token);

        if (!user) {
            return { success: false, message: "Unauthorized" };
        }

        console.log(`createPinterestBoard: User ${user.id} attempting to create board '${boardName}' for account '${platformUserId}'`);

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

        const apiUrl = process.env.PINTEREST_API_URL || "https://api.pinterest.com/v5";

        const url = `${apiUrl}/boards`;
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name: boardName,
                privacy: "PUBLIC"
            })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("Create Board Error:", data);
            throw new Error(data.message || "Failed to create board");
        }

        // --- UPDATE FIRESTORE START ---
        // Fetch fresh list of boards to sync everything
        const boardsRes = await fetch(`${apiUrl}/boards`, {
            headers: {
                "Authorization": `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
            cache: "no-store"
        });
        const boardsData = await boardsRes.json();

        if (boardsRes.ok && boardsData.items) {
            const docRef = snapshot.docs[0].ref;
            await updateDoc(docRef, {
                boards: boardsData.items,
                updatedAt: new Date()
            });
            console.log("Updated Firestore with fresh Pinterest boards");
        }
        // --- UPDATE FIRESTORE END ---

        return { success: true, board: data };

    } catch (error) {
        console.error("Error creating Pinterest board:", error);
        return { success: false, message: error.message };
    }
}
