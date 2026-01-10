"use server";

import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";

export async function checkTelegramConnection() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;

        const user = await verifyToken(token);
        if (!user) {
            return { connected: false, message: "Invalid token" };
        }

        // Query Firestore for Telegram account
        const q = query(
            collection(db, "socialAccounts"),
            where("userId", "==", user.id),
            where("platform", "==", "telegram"),
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
                displayName: data.displayName || data.botUsername || "Telegram Bot",
                botUsername: data.botUsername || "",
                chatId: data.chatId || "",
                tokenExpiresAt: null, // Telegram tokens don't usually expire
                count: snapshot.size,
                accounts: snapshot.docs.map(d => ({
                    id: d.id,
                    name: d.data().displayName || d.data().botUsername || "Telegram Bot",
                    botUsername: d.data().botUsername || "",
                    chatId: d.data().chatId || ""
                }))
            };
        }

        return accountData || { connected: false };
    } catch (err) {
        console.error("Error checking Telegram connection:", err);
        return { connected: false, message: err.message };
    }
}
