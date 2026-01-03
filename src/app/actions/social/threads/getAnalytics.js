// app/actions/social/threads/getAnalytics.js
"use server";

import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

/**
 * Fetch analytics for a Threads post
 */
export async function getThreadsPostAnalytics(accountId, postId, forceRefresh = false) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;
        const user = await verifyToken(token);

        if (!user) {
            return { success: false, message: "Unauthorized" };
        }

        // 1. Get the post data from Firestore
        const postRef = doc(db, "threads_posts", postId);
        const postSnap = await getDoc(postRef);

        if (!postSnap.exists()) {
            return { success: false, message: "Post not found" };
        }

        const postData = postSnap.data();
        const threadsPostId = postData.threadsPostId;

        if (!threadsPostId) {
            return { success: false, message: "Threads Post ID not found" };
        }

        // 2. Caching logic (30 mins)
        const lastUpdate = postData.lastAnalyticsUpdate?.toDate?.() || new Date(0);
        const now = new Date();
        const needsRefresh = forceRefresh || (now.getTime() - lastUpdate.getTime() > 30 * 60 * 1000);

        let metrics = postData.metrics || {};

        if (needsRefresh) {
            // Find account
            const accountRef = doc(db, "socialAccounts", accountId || postData.accountId);
            const accountSnap = await getDoc(accountRef);

            if (accountSnap.exists()) {
                const accountData = accountSnap.data();
                const accessToken = accountData.accessToken;

                // 3. Call Threads API
                // GET /{threads-media-id}?fields=metrics
                const response = await fetch(`https://graph.threads.net/v1.0/${threadsPostId}?fields=like_count,reply_count,repost_count,quote_count,view_count&access_token=${accessToken}`);
                const data = await response.json();

                if (response.ok) {
                    metrics = {
                        likes: data.like_count || 0,
                        replies: data.reply_count || 0,
                        reposts: data.repost_count || 0,
                        quotes: data.quote_count || 0,
                        views: data.view_count || 0,
                    };

                    // Update Firestore
                    await updateDoc(postRef, {
                        metrics,
                        lastAnalyticsUpdate: serverTimestamp(),
                        updatedAt: serverTimestamp()
                    });
                } else if (response.status === 429) {
                    return {
                        success: true,
                        data: {
                            summary: metrics,
                            permalink_url: `https://www.threads.net/t/${threadsPostId}`
                        },
                        lastRefreshed: lastUpdate.toISOString(),
                        isRateLimited: true,
                        message: "Threads rate limit exceeded. Displaying cached data."
                    };
                }
            }
        }

        const analyticsData = {
            summary: metrics,
            permalink_url: `https://www.threads.net/t/${threadsPostId}`
        };

        return {
            success: true,
            data: analyticsData,
            lastRefreshed: (needsRefresh && !forceRefresh) ? now.toISOString() : lastUpdate.toISOString()
        };

    } catch (error) {
        console.error("Error fetching Threads analytics:", error);
        return { success: false, message: "Failed to fetch analytics" };
    }
}
