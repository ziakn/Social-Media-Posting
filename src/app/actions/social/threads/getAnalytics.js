"use server";

import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, serverTimestamp, query, collection, where, getDocs } from "firebase/firestore";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

/**
 * Fetch analytics for a Threads post
 */
export async function getThreadsPostAnalytics(pageId, postId, forceRefresh = false) {
    try {
        const user = await verifyToken();

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

        // 2. Identify Threads Media ID
        // It could be stored as threadsPostId
        const threadsPostId = postData.threadsPostId;

        if (!threadsPostId) {
            return { success: false, message: "Threads Post ID not found." };
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
                where("platform", "==", "threads"),
                where("status", "==", "active")
            );

            const accountSnap = await getDocs(q);

            if (!accountSnap.empty) {
                const accountData = accountSnap.docs[0].data();
                const accessToken = accountData.accessToken;

                // 4. Call Threads API

                // A. Basic Media Info (Permalink, etc)
                const mediaResponse = await fetch(`https://graph.threads.net/v1.0/${threadsPostId}?fields=id,permalink,shortcode,media_type,media_product_type&access_token=${accessToken}`);
                const mediaInfo = await mediaResponse.json();

                if (!mediaResponse.ok) {
                    console.error("Threads Media API Error:", mediaInfo);
                    // If error is 429, handle rate limit?
                    if (mediaResponse.status === 429) {
                        return {
                            success: true,
                            data: { ...analyticsData, permalink: `https://www.threads.net/t/${threadsPostId}` },
                            lastRefreshed: lastUpdate.toISOString(),
                            message: "Rate limit exceeded. Showing cached data."
                        };
                    }
                }

                // B. Insights (Metrics)
                // Metrics: views, likes, replies, reposts, quotes
                const insightsResponse = await fetch(`https://graph.threads.net/v1.0/${threadsPostId}/insights?metric=views,likes,replies,reposts,quotes&access_token=${accessToken}`);
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
                    console.warn("Threads Insights API Warning:", insightsData.error);
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
                return { success: false, message: "Threads account not found" };
            }
        }

        return {
            success: true,
            data: {
                ...analyticsData,
                // Ensure permalink is present even if API failed or cache was used
                permalink: analyticsData.permalink || `https://www.threads.net/t/${threadsPostId}`
            },
            lastRefreshed: (needsRefresh && !forceRefresh) ? now.toISOString() : lastUpdate.toISOString()
        };

    } catch (error) {
        console.error("Error fetching Threads analytics:", error);
        return { success: false, message: "Failed to fetch analytics" };
    }
}
