"use server";

import { db } from "@/lib/firebase";
import { doc, setDoc, serverTimestamp, collection, query, where, getDocs } from "firebase/firestore";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

export async function createTelegramPost({
    accountId,
    message,
    mediaUrls = [],
    scheduledTime,
    postType,
    link,
}) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;
        const user = await verifyToken(token);

        if (!user) {
            return { success: false, message: "Invalid or expired token" };
        }

        const userId = user.id;

        // 1. Get Telegram Bot info from Firestore
        let accountData;
        let finalAccountId = accountId;

        if (accountId) {
            const accountSnap = await getDocs(query(
                collection(db, "socialAccounts"),
                where("__name__", "==", accountId)
            ));
            if (accountSnap.empty) {
                return { success: false, message: "Selected Telegram account not found" };
            }
            accountData = accountSnap.docs[0].data();
            if (accountData.userId !== userId || accountData.platform !== "telegram") {
                return { success: false, message: "Unauthorized account access" };
            }
        } else {
            // Fallback to first active account (legacy/generic)
            const q = query(
                collection(db, "socialAccounts"),
                where("userId", "==", userId),
                where("platform", "==", "telegram"),
                where("status", "==", "active")
            );
            const snapshot = await getDocs(q);

            if (snapshot.empty) {
                return { success: false, message: "Telegram bot not connected" };
            }

            const accountDoc = snapshot.docs[0];
            accountData = accountDoc.data();
            finalAccountId = accountDoc.id;
        }

        const { botToken, chatId } = accountData;

        console.log(`[Telegram Broadcast] Using Account: ${finalAccountId}`);
        console.log(`[Telegram Broadcast] Chat ID: ${chatId}`);
        console.log(`[Telegram Broadcast] Bot Token: ${botToken?.substring(0, 6)}...${botToken?.substring(botToken.length - 4)}`);

        if (scheduledTime) {
            // Logic for scheduling (saving to Firestore for a background worker)
            const postRef = doc(collection(db, "telegram_posts"));
            const postId = postRef.id;

            await setDoc(postRef, {
                platform: "telegram",
                userId,
                accountId: finalAccountId,
                chatId,
                message,
                mediaUrls: mediaUrls.length ? mediaUrls : null,
                link: link || null,
                postType: mediaUrls.length > 0 ? (mediaUrls[0].type?.startsWith("video") ? "video" : "image") : (link ? "link" : "text"),
                status: "scheduled",
                scheduledAt: new Date(scheduledTime),
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });

            return { success: true, message: "Telegram post scheduled successfully", postId };
        }

        // Instant post
        let telegramResponse;
        let finalMessage = message?.trim() || "";
        if (link) {
            finalMessage = finalMessage ? `${finalMessage}\n\n${link}` : link;
        }

        if (mediaUrls.length > 0) {
            const media = mediaUrls[0]; // Telegram simple post handles one media or a group, we start with one
            const endpoint = media.type?.startsWith("video") ? "sendVideo" : "sendPhoto";
            const payload = {
                chat_id: chatId,
                caption: finalMessage,
                [media.type?.startsWith("video") ? "video" : "photo"]: media.url,
                parse_mode: "HTML"
            };

            const res = await fetch(`https://api.telegram.org/bot${botToken}/${endpoint}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            telegramResponse = await res.json();
        } else {
            const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    chat_id: chatId,
                    text: finalMessage,
                    parse_mode: "HTML"
                })
            });
            telegramResponse = await res.json();
        }

        if (!telegramResponse.ok) {
            console.error("[Telegram API Error Response]", JSON.stringify(telegramResponse, null, 2));
            let errorMsg = telegramResponse.description || "Failed to send Telegram message";
            if (telegramResponse.description?.includes("chat not found")) {
                errorMsg = "Chat not found. Please verify the Chat ID and ensure the bot is a member.";
            } else if (telegramResponse.description?.includes("forbidden")) {
                errorMsg = "Bot doesn't have permission to post in this chat. Please ensure it's an administrator.";
            }
            throw new Error(errorMsg);
        }

        // Save to Firestore
        const postRef = doc(collection(db, "telegram_posts"));
        const postId = postRef.id;

        await setDoc(postRef, {
            platform: "telegram",
            userId,
            accountId: finalAccountId,
            chatId,
            message,
            mediaUrls: mediaUrls.length ? mediaUrls : null,
            link: link || null,
            postType: mediaUrls.length > 0 ? (mediaUrls[0].type?.startsWith("video") ? "video" : "image") : (link ? "link" : "text"),
            status: "posted",
            telegramMessageId: telegramResponse.result.message_id,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });

        return { success: true, message: "Telegram post published successfully", postId };

    } catch (error) {
        console.error("Telegram post creation error:", error);
        return {
            success: false,
            message: `Failed to create Telegram post: ${error.message}`,
        };
    }
}
