"use server";

import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

/**
 * Resolve safe metrics based on media type
 */
function getSafeMetrics(mediaType, productType) {
    // REELS
    if (productType === "REELS") {
        return [
            "plays",
            "reach",
            "total_interactions",
            "ig_reels_avg_watch_time",
            "ig_reels_video_view_total_time"
        ];
    }

    // FEED VIDEO
    if (mediaType === "VIDEO") {
        return [
            "impressions",
            "reach",
            "likes",
            "comments",
            "saved",
            "total_interactions"
        ];
    }

    // CAROUSEL
    if (mediaType === "CAROUSEL_ALBUM") {
        return [
            "impressions",
            "reach",
            "likes",
            "comments",
            "total_interactions"
        ];
    }

    // IMAGE (default)
    return [
        "impressions",
        "reach",
        "likes",
        "comments",
        "saved",
        "total_interactions"
    ];
}

export async function getInstagramPostAnalytics(pageId, postId, refresh = false) {
    try {
        /* ---------------- AUTH ---------------- */
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;
        const user = await verifyToken(token);

        if (!user) {
            return { success: false, message: "Invalid or expired token" };
        }

        /* ---------------- DATABASE LOOKUP ---------------- */
        let postDocId = null;
        let cachedData = null;

        const postQ = query(
            collection(db, "instagram_posts"),
            where("userId", "==", user.id),
            where("instagramPostId", "==", postId)
        );

        const postSnapshot = await getDocs(postQ);
        if (!postSnapshot.empty) {
            const docSnap = postSnapshot.docs[0];
            postDocId = docSnap.id;
            const data = docSnap.data();

            // If we have cached analytics and it's not a forced refresh, return them
            if (!refresh && data.analytics) {
                console.log("Returning cached Instagram analytics for", postId);
                return {
                    success: true,
                    data: data.analytics,
                    cached: true,
                    lastRefreshed: data.analyticsFetchedAt?.toDate?.() || null
                };
            }
            cachedData = data;
        }

        /* ---------------- ACCOUNT ---------------- */
        const q = query(
            collection(db, "socialAccounts"),
            where("userId", "==", user.id),
            where("accountId", "==", pageId),
            where("platform", "==", "instagram"),
            where("status", "==", "active")
        );

        const snapshot = await getDocs(q);
        if (snapshot.empty) {
            return { success: false, message: "Instagram account not linked" };
        }

        const accountData = snapshot.docs[0].data();
        const accessToken = accountData.accessToken;

        if (!accessToken) {
            return { success: false, message: "Missing access token" };
        }

        /* ---------------- MEDIA INFO ---------------- */
        const mediaRes = await fetch(
            `https://graph.instagram.com/v24.0/${postId}?fields=media_type,media_product_type,like_count,comments_count,timestamp,permalink,shortcode&access_token=${accessToken}`
        );

        const mediaData = await mediaRes.json();

        if (mediaData?.error) {
            return { success: false, message: mediaData.error.message };
        }

        const mediaType = mediaData.media_type;
        const mediaProductType = mediaData.media_product_type;

        /* ---------------- METRICS ---------------- */
        const metrics = getSafeMetrics(mediaType, mediaProductType);

        let insights = [];

        try {
            const insightsRes = await fetch(
                `https://graph.instagram.com/v24.0/${postId}/insights?metric=${metrics.join(",")}&access_token=${accessToken}`
            );

            const insightsJson = await insightsRes.json();

            if (insightsJson?.data) {
                insights = insightsJson.data;
            } else {
                throw insightsJson.error;
            }
        } catch (err) {
            console.warn("Primary insights failed:", err?.message);

            // Fallback – guaranteed-safe metrics
            try {
                const fallbackRes = await fetch(
                    `https://graph.instagram.com/v24.0/${postId}/insights?metric=reach,total_interactions&access_token=${accessToken}`
                );

                const fallbackJson = await fallbackRes.json();
                insights = fallbackJson.data || [];
            } catch (fallbackErr) {
                console.warn("Fallback failed:", fallbackErr?.message);
                insights = [];
            }
        }

        const finalData = {
            ...mediaData,
            insights
        };

        /* ---------------- UPDATE DATABASE ---------------- */
        if (postDocId) {
            try {
                // Extract useful metrics for easy access in lists
                const getInsightValue = (name) => {
                    const insight = insights.find(i => i.name === name);
                    return insight?.values?.[0]?.value || 0;
                };

                const updatePayload = {
                    analytics: finalData,
                    analyticsFetchedAt: new Date(),
                    metrics: {
                        likes: mediaData.like_count || 0,
                        comments: mediaData.comments_count || 0,
                        reach: getInsightValue("reach"),
                        views: getInsightValue("plays") || getInsightValue("impressions") || 0,
                        engagement: (mediaData.like_count || 0) + (mediaData.comments_count || 0) + getInsightValue("total_interactions")
                    }
                };

                // Use updateDoc to update only specific fields, avoiding serverTimestamp for updatedAt
                const postRef = doc(db, "instagram_posts", postDocId);
                await updateDoc(postRef, updatePayload);
                console.log("Successfully updated Instagram analytics in DB for post:", postId);
            } catch (dbErr) {
                console.error("Failed to update post analytics in DB:", dbErr);
            }
        }

        /* ---------------- RESPONSE ---------------- */
        return {
            success: true,
            data: finalData,
            cached: false,
            lastRefreshed: new Date()
        };

    } catch (err) {
        console.error("getInstagramPostAnalytics error:", err);
        return { success: false, message: err.message };
    }
}
