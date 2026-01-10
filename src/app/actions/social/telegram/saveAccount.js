"use server";

import { db } from "@/lib/firebase";
import { collection, addDoc, query, where, getDocs, updateDoc, doc } from "firebase/firestore";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";

export async function saveTelegramAccount(formData) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;

        const user = await verifyToken(token);
        if (!user) {
            throw new Error("Invalid token");
        }

        let { botToken, chatId, displayName } = formData;
        botToken = botToken?.trim();
        chatId = chatId?.trim();

        if (!botToken || !chatId) {
            throw new Error("Bot Token and Chat ID are required");
        }
        
        // Ensure chatId starts with - if it's a channel/group and user forgot it
        // Note: Some private chats don't have -, but most groups/channels do. 
        // We won't force it but we'll trim it.

        // --- VERIFICATION STEP ---
        console.log(`[Telegram] Verifying bot token and chat ID: ${chatId}...`);
        
        // 1. Verify Bot Token and get Bot info
        const botRes = await fetch(`https://api.telegram.org/bot${botToken}/getMe`);
        const botData = await botRes.json();
        
        if (!botData.ok) {
            throw new Error(`Invalid Bot Token: ${botData.description || "Unknown error"}`);
        }
        
        const botUsername = botData.result.username;
        const botName = botData.result.first_name;

        // 2. Verify Chat ID and Bot Permissions
        const chatRes = await fetch(`https://api.telegram.org/bot${botToken}/getChat?chat_id=${chatId}`);
        const chatData = await chatRes.json();

        console.log(`[Telegram] Chat Data: ${JSON.stringify(chatData)}`);

        if (!chatData.ok) {
            let errorMsg = `Telegram Verification Failed: ${chatData.description}`;
            if (chatData.description?.includes("chat not found")) {
                errorMsg = "Chat not found. Ensure the Chat ID is correct (e.g. starting with -100 for channels) and the bot is a member.";
            } else if (chatData.description?.includes("unauthorized")) {
                 errorMsg = "Invalid Bot Token. Please check your credentials.";
            }
            throw new Error(`${errorMsg} (Raw: ${JSON.stringify(chatData)})`);
        }

       

        // Optional: override displayName with bot name if not provided
        if (!displayName) {
            displayName = `${botName} (@${botUsername})`;
        }

        // --- END VERIFICATION ---

        // Check if this specific connection already exists
        const q = query(
            collection(db, "socialAccounts"),
            where("userId", "==", user.id),
            where("platform", "==", "telegram"),
            where("chatId", "==", chatId)
        );

        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
            // Update existing
            const docRef = doc(db, "socialAccounts", snapshot.docs[0].id);
            await updateDoc(docRef, {
                botToken,
                botUsername,
                displayName: displayName,
                status: "active",
                updated_at: new Date()
            });
            return { success: true, message: "Telegram account updated and verified successfully" };
        } else {
            // Create new
            await addDoc(collection(db, "socialAccounts"), {
                userId: user.id,
                platform: "telegram",
                botToken,
                chatId,
                botUsername,
                displayName: displayName,
                status: "active",
                created_at: new Date(),
                updated_at: new Date()
            });
            return { success: true, message: "Telegram account connected and verified successfully" };
        }
    } catch (err) {
        console.error("Error saving Telegram account:", err);
        return { success: false, message: err.message };
    }
}
