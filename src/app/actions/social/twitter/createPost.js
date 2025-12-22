"use server";

import { db } from "@/lib/firebase";
import { doc, setDoc, serverTimestamp, collection, query, where, getDocs } from "firebase/firestore";
import { readFile } from 'fs/promises';
import path from 'path';

/**
 * Create a Twitter Post
 */
export async function createTwitterPost({
    userId, // Portal user ID
    message,
    mediaUrls = [],
    scheduledTime,
    postType,
}) {
    try {
        // 1. Get Twitter Access Token from Firestore
        const q = query(
            collection(db, "socialAccounts"),
            where("userId", "==", userId),
            where("platform", "==", "twitter"),
            where("status", "==", "active")
        );
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            return { success: false, message: "Twitter account not connected" };
        }

        const accountData = snapshot.docs[0].data();
        const accessToken = accountData.accessToken;
        const twitterUserId = accountData.platformUserId;

        // TODO: Handle token refresh if expired

        // 2. Upload Media if needed
        let mediaIds = [];
        if (mediaUrls.length > 0) {
            // Note: This is a simplified media upload. 
            // Twitter Media Upload v1.1 usually requires OAuth 1.0a. 
            // If OAuth 2.0 doesn't work, we might need to restrict to text or implement OAuth 1.0a.
            // For this implementation, we'll try to use the access token.
            // If this fails, we might need to use a library or different auth.

            // For now, let's assume we can't easily upload media with just OAuth 2.0 user token without a library handling the complex signing.
            // We will implement text-only for now if media fails, or try a basic upload.

            // Actually, let's try to upload one by one.
            for (const media of mediaUrls) {
                // This part is tricky without a library. 
                // We will skip media upload implementation for raw fetch in this step 
                // and focus on text posts, or return an error for media posts for now 
                // unless we use a library like `twitter-api-v2`.

                // For the sake of the task, let's assume we use a helper or library if available.
                // Since we don't have it, we'll return a warning for media.
                return { success: false, message: "Media upload not supported with current configuration. Text only." };
            }
        }

        // 3. Create Tweet
        const tweetBody = {
            text: message,
        };

        if (mediaIds.length > 0) {
            tweetBody.media = { media_ids: mediaIds };
        }

        if (!scheduledTime) {
            const res = await fetch("https://api.twitter.com/2/tweets", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(tweetBody),
            });

            const data = await res.json();

            if (data.errors) {
                throw new Error(data.errors[0].message);
            }

            const tweetId = data.data.id;

            // 4. Save to Firestore
            const postId = `twitter_${Date.now()}`;
            await setDoc(doc(db, "twitter_posts", postId), {
                platform: "twitter",
                userId,
                twitterUserId,
                message,
                mediaUrls: mediaUrls.length ? mediaUrls : null,
                postType,
                status: "posted",
                twitterPostId: tweetId,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });

            return {
                success: true,
                message: "Tweet published successfully",
                postId,
            };
        } else {
            // Scheduling logic (Twitter API doesn't support scheduling directly via API in the same way, 
            // usually you schedule on your backend and post later. 
            // For now, we'll just save as scheduled in DB).

            const postId = `twitter_${Date.now()}`;
            await setDoc(doc(db, "twitter_posts", postId), {
                platform: "twitter",
                userId,
                twitterUserId,
                message,
                mediaUrls: mediaUrls.length ? mediaUrls : null,
                postType,
                status: "scheduled",
                scheduledAt: scheduledTime,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });

            return {
                success: true,
                message: "Tweet scheduled successfully",
                postId,
            };
        }

    } catch (error) {
        console.error("Twitter post creation error:", error);
        return {
            success: false,
            message: `Failed to create tweet: ${error.message}`,
        };
    }
}
