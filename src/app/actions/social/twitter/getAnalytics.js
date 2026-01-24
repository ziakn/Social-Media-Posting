"use server";

import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { refreshTwitterToken } from "./tokenRefresh";

export async function getTwitterPostAnalytics(accountId, postId, forceRefresh = false) {
    try {
        const user = await verifyToken();

        if (!user) {
            return { success: false, message: "Unauthorized" };
        }

        // 1. Get the post data from Firestore
        const postRef = doc(db, "twitter_posts", postId);
        const postSnap = await getDoc(postRef);

        if (!postSnap.exists()) {
            return { success: false, message: "Post not found" };
        }

        const postData = postSnap.data();
        const twitterPostId = postData.twitterPostId;

        if (!twitterPostId) {
            return { success: false, message: "Twitter Post ID not found" };
        }

        // 2. Determine if we need to fetch from Twitter API
        const lastUpdate = postData.lastAnalyticsUpdate?.toDate?.() || new Date(0);
        const now = new Date();
        const needsRefresh = forceRefresh || (now.getTime() - lastUpdate.getTime() > 30 * 60 * 1000); // 30 minutes cache

        let metrics = postData.metrics || {};

        if (needsRefresh) {
            console.log(`[Twitter Analytics] Fetching fresh metrics for tweet ${twitterPostId}...`);

            // 3. Get Twitter Access Token
            const accountRef = doc(db, "socialAccounts", accountId || postData.accountId);
            const accountSnap = await getDoc(accountRef);

            if (!accountSnap.exists()) {
                return { success: false, message: "Social account not found" };
            }

            const accountData = accountSnap.data();
            let accessToken = accountData.accessToken;
            const refreshToken = accountData.refreshToken;

            // 4. Refresh token if needed
            const isExpired = accountData.tokenExpiresAt && (accountData.tokenExpiresAt.toDate().getTime() < Date.now() + 5 * 60 * 1000);
            if (isExpired && refreshToken) {
                const refreshResult = await refreshTwitterToken(accountId || postData.accountId, refreshToken);
                accessToken = refreshResult.access_token;
            }

            // 5. Call Twitter API v2
            // We request public_metrics (likes, retweets, replies, quotes)
            // and optionally organic_metrics (impressions) if the account has access
            const twitterRes = await fetch(`https://api.twitter.com/2/tweets/${twitterPostId}?tweet.fields=public_metrics,organic_metrics,non_public_metrics`, {
                headers: {
                    "Authorization": `Bearer ${accessToken}`,
                },
            });

            const twitterData = await twitterRes.json();

            if (!twitterRes.ok) {
                console.error("Twitter API Error (Analytics):", twitterData);

                // Special handling for rate limiting (429)
                if (twitterRes.status === 429) {
                    return {
                        success: true,
                        data: {
                            summary: {
                                likes: metrics.likes || 0,
                                replies: metrics.replies || 0,
                                retweets: metrics.retweets || 0,
                                quotes: metrics.quotes || 0,
                                impressions: metrics.impressions || 0,
                                profile_visits: metrics.profileVisits || 0
                            },
                            insights: [],
                            permalink_url: `https://twitter.com/${postData.username}/status/${twitterPostId}`
                        },
                        lastRefreshed: lastUpdate.toISOString(),
                        isRateLimited: true,
                        message: "Twitter rate limit exceeded. Displaying cached data."
                    };
                }
            } else {
                const tweetData = twitterData.data;
                const publicMetrics = tweetData.public_metrics || {};
                const organicMetrics = tweetData.organic_metrics || {};
                const nonPublicMetrics = tweetData.non_public_metrics || {};

                metrics = {
                    likes: publicMetrics.like_count || 0,
                    retweets: publicMetrics.retweet_count || 0,
                    replies: publicMetrics.reply_count || 0,
                    quotes: publicMetrics.quote_count || 0,
                    impressions: organicMetrics.impression_count || nonPublicMetrics.impression_count || 0,
                    profileVisits: organicMetrics.user_profile_clicks || 0,
                };

                // Update Firestore
                await updateDoc(postRef, {
                    metrics,
                    lastAnalyticsUpdate: serverTimestamp(),
                    updatedAt: serverTimestamp()
                });
            }
        }

        // 6. Return formatted data
        const analyticsData = {
            summary: {
                likes: metrics.likes || 0,
                replies: metrics.replies || 0,
                retweets: metrics.retweets || 0,
                quotes: metrics.quotes || 0,
                impressions: metrics.impressions || 0,
                profile_visits: metrics.profileVisits || 0
            },
            insights: [],
            permalink_url: `https://twitter.com/${postData.username}/status/${twitterPostId}`
        };

        return {
            success: true,
            data: analyticsData,
            lastRefreshed: needsRefresh && !forceRefresh ? now.toISOString() : lastUpdate.toISOString()
        };
    } catch (error) {
        console.error("Error fetching Twitter analytics:", error);
        return { success: false, message: "Failed to fetch analytics" };
    }
}
