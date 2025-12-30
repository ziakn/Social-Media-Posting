"use server";

import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

/**
 * Main analytics function for Facebook
 */
export async function getFacebookPostAnalytics(pageId, postId, refresh = false) {
    try {
        /* ================= AUTH ================= */
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;
        const user = await verifyToken(token);

        if (!user) {
            return { success: false, message: "Invalid or expired token" };
        }

        /* ================= LOAD CACHED DATA ================= */
        const postQuery = query(
            collection(db, "facebook_posts"),
            where("userId", "==", user.id),
            where("facebookPostId", "==", postId)
        );

        const postSnap = await getDocs(postQuery);

        let postDocId = null;
        let cachedData = null;

        if (!postSnap.empty) {
            postDocId = postSnap.docs[0].id;
            cachedData = postSnap.docs[0].data();

            if (!refresh && cachedData.analytics) {
                return {
                    success: true,
                    data: cachedData.analytics,
                    cached: true,
                    lastRefreshed: cachedData.analyticsFetchedAt?.toDate?.() || null
                };
            }
        }

        /* ================= ACCOUNT & PAGE TOKEN ================= */
        const accountQuery = query(
            collection(db, "socialAccounts"),
            where("userId", "==", user.id),
            where("platform", "==", "facebook"),
            where("status", "==", "active")
        );

        const accountSnap = await getDocs(accountQuery);
        if (accountSnap.empty) {
            return { success: false, message: "Facebook account not linked" };
        }

        let pageAccessToken = null;
        accountSnap.forEach((docSnap) => {
            const data = docSnap.data();
            const page = data.pages?.find(p => p.pageId === pageId);
            if (page) {
                pageAccessToken = page.pageAccessToken;
            }
        });

        if (!pageAccessToken) {
            return { success: false, message: "Could not find access token for the specified page" };
        }

        /* ================= FETCH POST DATA & INSIGHTS ================= */
        // 1. Basic counts (likes, comments, shares)
        const fields = "message,created_time,permalink_url,shares,reactions.summary(true),comments.summary(true)";
        const postRes = await fetch(
            `https://graph.facebook.com/v21.0/${postId}?fields=${fields}&access_token=${pageAccessToken}`
        );
        const postData = await postRes.json();

        if (postData?.error) {
            return { success: false, message: postData.error.message };
        }

        // 2. Insights (impressions, reach, clicks)
        const metrics = [
            "post_impressions",
            "post_impressions_unique",
            "post_clicks"
        ];

        let insights = [];
        try {
            const insightsRes = await fetch(
                `https://graph.facebook.com/v21.0/${postId}/insights?metric=${metrics.join(",")}&access_token=${pageAccessToken}`
            );
            const insightsJson = await insightsRes.json();
            insights = insightsJson?.data || [];
        } catch (err) {
            console.warn("Facebook insights fetch failed:", err.message);
        }

        /* ================= NORMALIZE METRICS ================= */
        const getInsight = (name) =>
            insights.find(i => i.name === name)?.values?.[0]?.value ?? 0;

        const likes = postData.reactions?.summary?.total_count || 0;
        const comments = postData.comments?.summary?.total_count || 0;
        const shares = postData.shares?.count || 0;
        const reach = getInsight("post_impressions_unique");
        const impressions = getInsight("post_impressions");
        const clicks = getInsight("post_clicks");

        const analyticsPayload = {
            ...postData,
            insights,
            summary: {
                likes,
                comments,
                shares,
                reach,
                impressions,
                clicks
            }
        };

        const metricsPayload = {
            likes,
            comments,
            shares,
            reach,
            views: impressions,
            engagements: likes + comments + shares
        };

        /* ================= UPDATE DB ================= */
        if (postDocId) {
            await updateDoc(doc(db, "facebook_posts", postDocId), {
                analytics: analyticsPayload,
                analyticsFetchedAt: new Date(),
                metrics: metricsPayload
            });
        }

        return {
            success: true,
            data: analyticsPayload,
            cached: false,
            lastRefreshed: new Date()
        };

    } catch (err) {
        console.error("getFacebookPostAnalytics error:", err);
        return { success: false, message: err.message };
    }
}
