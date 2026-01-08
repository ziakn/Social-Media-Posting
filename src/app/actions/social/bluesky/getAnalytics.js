"use server";

import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, serverTimestamp, query, collection, where, getDocs } from "firebase/firestore";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

/**
 * Fetch analytics for a BlueSky post
 */
export async function getBlueSkyPostAnalytics(pageId, postId, forceRefresh = false) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;
        const user = await verifyToken(token);

        if (!user) {
            return { success: false, message: "Unauthorized" };
        }

        // 1. Get the post data from Firestore
        const postRef = doc(db, "bluesky_posts", postId);
        const postSnap = await getDoc(postRef);

        if (!postSnap.exists()) {
            return { success: false, message: "Post not found" };
        }

        const postData = postSnap.data();

        // 2. Identify BlueSky Media ID
        // It could be stored as blueskyPostId
        const blueskyPostId = postData.blueskyPostId;

        if (!blueskyPostId) {
            return { success: false, message: "BlueSky Post ID not found." };
        }

        // 3. Caching logic (30 mins)
        const lastUpdate = postData.lastAnalyticsUpdate?.toDate?.() || new Date(0);
        const now = new Date();
        const needsRefresh = forceRefresh || (now.getTime() - lastUpdate.getTime() > 30 * 60 * 1000);

        let metrics = postData.metrics || {};
        let analyticsData = postData.analytics || {};

        if (needsRefresh) {
            // Get Account Access Token
            // Use pageId if provided (which maps to accountId usually), or fallback to post's accountId
            const targetAccountId = pageId || postData.accountId;

            const q = query(
                collection(db, "socialAccounts"),
                where("userId", "==", user.id),
                where("accountId", "==", targetAccountId),
                where("platform", "==", "bluesky"),
                where("status", "==", "active")
            );

            const accountSnap = await getDocs(q);

            if (!accountSnap.empty) {
                const accountData = accountSnap.docs[0].data();
                const accessToken = accountData.accessToken;

                // 4. Call BlueSky API

                // A. Basic Media Info (Permalink, etc)
                const mediaResponse = await fetch(`https://graph.bluesky.net/v1.0/${blueskyPostId}?fields=id,permalink,shortcode,media_type,media_product_type&access_token=${accessToken}`);
                const mediaInfo = await mediaResponse.json();

                if (!mediaResponse.ok) {
                    console.error("BlueSky Media API Error:", mediaInfo);
                    // If error is 429, handle rate limit?
                    if (mediaResponse.status === 429) {
                        return {
                            success: true,
                            data: { ...analyticsData, permalink: `https://www.bluesky.net/t/${blueskyPostId}` },
                            lastRefreshed: lastUpdate.toISOString(),
                            message: "Rate limit exceeded. Showing cached data."
                        };
                    }
                }

                // B. Insights (Metrics)
                // Metrics: views, likes, replies, reposts, quotes
                const insightsResponse = await fetch(`https://graph.bluesky.net/v1.0/${blueskyPostId}/insights?metric=views,likes,replies,reposts,quotes&access_token=${accessToken}`);
                const insightsData = await insightsResponse.json();

                // Process Metrics
                const newMetrics = {
                    likes: 0,
                    replies: 0,
                    reposts: 0,
                    quotes: 0,
                    views: 0
                };

                if (insightsData && insightsData.data) {
                    insightsData.data.forEach(m => {
                        const val = m.values?.[0]?.value || 0;
                        if (m.name === 'likes') newMetrics.likes = val;
                        if (m.name === 'replies') newMetrics.replies = val;
                        if (m.name === 'reposts') newMetrics.reposts = val;
                        if (m.name === 'quotes') newMetrics.quotes = val;
                        if (m.name === 'views') newMetrics.views = val;
                    });
                } else if (insightsData.error) {
                    console.warn("BlueSky Insights API Warning:", insightsData.error);
                    // Fallback to what we can get? 
                    // Often "views" is unavailable for some posts, but likes/replies might be avail via fields if insights fails.
                    // For now, assume 0 or keep old.
                }

                // Construct Analytics Data Object (consistent with UI expectations)
                analyticsData = {
                    ...mediaInfo, // includes permalink, shortcode
                    ...newMetrics, // flat metrics for easy access
                    insights: insightsData.data || [] // raw insights array if needed
                };

                metrics = newMetrics;

                // Update Firestore
                await updateDoc(postRef, {
                    analytics: analyticsData,
                    metrics: metrics,
                    lastAnalyticsUpdate: serverTimestamp(),
                    updatedAt: serverTimestamp()
                });
            } else {
                return { success: false, message: "BlueSky account not found" };
            }
        }

        return {
            success: true,
            data: {
                ...analyticsData,
                // Ensure permalink is present even if API failed or cache was used
                permalink: analyticsData.permalink || `https://www.bluesky.net/t/${blueskyPostId}`
            },
            lastRefreshed: (needsRefresh && !forceRefresh) ? now.toISOString() : lastUpdate.toISOString()
        };

    } catch (error) {
        console.error("Error fetching BlueSky analytics:", error);
        return { success: false, message: "Failed to fetch analytics" };
    }
}
