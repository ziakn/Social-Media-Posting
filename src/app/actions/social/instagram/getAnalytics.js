"use server";

import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
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

export async function getInstagramPostAnalytics(pageId, postId) {
    try {
        /* ---------------- AUTH ---------------- */
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;
        const user = await verifyToken(token);

        if (!user) {
            return { success: false, message: "Invalid or expired token" };
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

        /* ---------------- RESPONSE ---------------- */
        return {
            success: true,
            data: {
                ...mediaData,
                insights
            }
        };

    } catch (err) {
        console.error("getInstagramPostAnalytics error:", err);
        return { success: false, message: err.message };
    }
}
