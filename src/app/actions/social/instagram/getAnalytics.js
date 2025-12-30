"use server";

import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

/**
 * Determine safe metrics based on Instagram media type
 * This avoids ALL unsupported combinations.
 */
function resolveMetrics(mediaType, productType) {
    // Reels (most restrictive)
    if (productType === "REELS") {
        return ["plays", "reach", "total_interactions"];
    }

    // Carousel posts
    if (mediaType === "CAROUSEL_ALBUM") {
        return ["reach", "total_interactions"];
    }

    // Video (non-reel)
    if (mediaType === "VIDEO") {
        return ["impressions", "reach", "total_interactions"];
    }

    // Image posts
    return ["impressions", "reach", "total_interactions"];
}

export async function getInstagramPostAnalytics(pageId, postId, refresh = false) {
    try {
        /* ---------- AUTH ---------- */
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;
        const user = await verifyToken(token);

        if (!user) {
            return { success: false, message: "Invalid or expired token" };
        }

        /* ---------- LOAD CACHED DATA ---------- */
        const postQuery = query(
            collection(db, "instagram_posts"),
            where("userId", "==", user.id),
            where("instagramPostId", "==", postId)
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

        /* ---------- ACCOUNT TOKEN ---------- */
        const accountQuery = query(
            collection(db, "socialAccounts"),
            where("userId", "==", user.id),
            where("accountId", "==", pageId),
            where("platform", "==", "instagram"),
            where("status", "==", "active")
        );

        const accountSnap = await getDocs(accountQuery);
        if (accountSnap.empty) {
            return { success: false, message: "Instagram account not linked" };
        }

        const accessToken = accountSnap.docs[0].data().accessToken;

        /* ---------- MEDIA INFO ---------- */
        const mediaRes = await fetch(
            `https://graph.instagram.com/v24.0/${postId}?fields=media_type,media_product_type,like_count,comments_count,permalink,timestamp&access_token=${accessToken}`
        );

        const mediaData = await mediaRes.json();

        if (mediaData?.error) {
            return { success: false, message: mediaData.error.message };
        }

        /* ---------- SAFE METRICS ---------- */
        const metrics = resolveMetrics(
            mediaData.media_type,
            mediaData.media_product_type
        );

        const insightsRes = await fetch(
            `https://graph.instagram.com/v24.0/${postId}/insights?metric=${metrics.join(",")}&access_token=${accessToken}`
        );

        const insightsJson = await insightsRes.json();
        const insights = insightsJson?.data || [];

        /* ---------- NORMALIZE ---------- */
        const getMetric = (key) =>
            insights.find(i => i.name === key)?.values?.[0]?.value ?? 0;

        const analyticsPayload = {
            ...mediaData,
            insights
        };

        const metricsPayload = {
            likes: mediaData.like_count || 0,
            comments: mediaData.comments_count || 0,
            reach: getMetric("reach"),
            views:
                getMetric("plays") ||
                getMetric("impressions") ||
                getMetric("reach"),
            engagement:
                (mediaData.like_count || 0) +
                (mediaData.comments_count || 0) +
                getMetric("total_interactions")
        };

        /* ---------- UPDATE DATABASE ---------- */
        if (postDocId) {
            await updateDoc(doc(db, "instagram_posts", postDocId), {
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
        console.error("getInstagramPostAnalytics error:", err);
        return { success: false, message: err.message };
    }
}
