"use server";

import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

export async function getTwitterPostAnalytics(accountId, postId, forceRefresh = false) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;
        const user = await verifyToken(token);

        if (!user) {
            return { success: false, message: "Unauthorized" };
        }

        // In a real implementation, this would call the Twitter API (v2) to get fresh metrics
        // For now, we'll fetch from our local database which stores the last known metrics

        const postRef = doc(db, "twitter_posts", postId);
        const postSnap = await getDoc(postRef);

        if (!postSnap.exists()) {
            return { success: false, message: "Post not found" };
        }

        const postData = postSnap.data();
        const metrics = postData.metrics || {};

        // Mock data structure matching Facebook's format for the UI
        const analyticsData = {
            summary: {
                likes: metrics.likes || 0,
                replies: metrics.replies || 0,
                retweets: metrics.retweets || 0,
                quotes: metrics.quotes || 0, // Twitter specific
                impressions: metrics.impressions || 0,
                profile_visits: metrics.profileVisits || 0
            },
            insights: [], // Could be time-series data
            permalink_url: `https://twitter.com/${postData.username}/status/${postData.tweetId || postId}`
        };

        return {
            success: true,
            data: analyticsData,
            lastRefreshed: postData.lastAnalyticsUpdate?.toDate?.() || new Date()
        };
    } catch (error) {
        console.error("Error fetching Twitter analytics:", error);
        return { success: false, message: "Failed to fetch analytics" };
    }
}
