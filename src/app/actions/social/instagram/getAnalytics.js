"use server";

import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

export async function getInstagramPostAnalytics(pageId, postId) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;
        const user = await verifyToken(token);

        if (!user) {
            return { success: false, message: "Invalid or expired token" };
        }

        // 1. Get Access Token for the Page
        const q = query(
            collection(db, "socialAccounts"),
            where("userId", "==", user.id),
            where("accountId", "==", pageId),
            where("platform", "==", "instagram"),
            where("status", "==", "active")
        );

        const snapshot = await getDocs(q);
        if (snapshot.empty) {
            return { success: false, message: "Instagram account not linked or active" };
        }

        const accountData = snapshot.docs[0].data();
        const accessToken = accountData.accessToken;

        if (!accessToken) {
            return { success: false, message: "Access token missing for this account" };
        }

        // 2. Determine Metrics based on media type (we might not know media type yet, so we can try to fetch media fields first)
        // First, fetch basic media fields including media_type and media_product_type
        const mediaFields = "media_type,media_product_type,like_count,comments_count,timestamp,permalink,shortcode";
        const mediaRes = await fetch(
            `https://graph.instagram.com/v24.0/${postId}?fields=${mediaFields}&access_token=${accessToken}`
        );
        const mediaData = await mediaRes.json();

        if (mediaData.error) {
            console.error("Instagram API Error (Media):", mediaData.error);
            return { success: false, message: mediaData.error.message };
        }

        const mediaType = mediaData.media_type;
        const mediaProductType = mediaData.media_product_type;
        let insightsMetricParam = "";

        // Determine metrics based on media type and product type
        if (mediaProductType === "REELS") {
            // Reels metrics - use 'plays' instead of 'impressions'
            insightsMetricParam = "plays,shares,reach,saved,total_interactions";
        } else if (mediaType === "VIDEO") {
            // Feed videos - use 'impressions' for feed videos
            insightsMetricParam = "impressions,shares,reach,saved,total_interactions";
        } else if (mediaType === "CAROUSEL_ALBUM") {
            // Carousel metrics
            // Reverting to album-specific metrics as 'impressions' is not supported for albums
            insightsMetricParam = "carousel_album_impressions,carousel_album_reach,carousel_album_saved,total_interactions";
        } else {
            // Image / Default metrics
            insightsMetricParam = "impressions,shares,reach,saved,total_interactions";
        }

        let insightsData;
        try {
            const insightsRes = await fetch(
                `https://graph.instagram.com/v24.0/${postId}/insights?metric=${insightsMetricParam}&access_token=${accessToken}`
            );
            insightsData = await insightsRes.json();
        } catch (e) {
            insightsData = { error: { message: "Network or parsing error", details: e.message } };
        }

        let finalInsights = [];
        if (insightsData.data) {
            finalInsights = insightsData.data;
        } else if (insightsData.error) {
            console.warn("Instagram API Insights Warning (Primary Metrics):", insightsData.error);

            // FALLBACK: Try a minimal safe set of metrics if specific ones fail
            // 'saved' and 'total_interactions' are generally safe for all types
            // We'll also try 'reach' as it's very common.
            const fallbackMetricParam = "saved,total_interactions";
            try {
                const fallbackRes = await fetch(
                    `https://graph.instagram.com/v24.0/${postId}/insights?metric=${fallbackMetricParam}&access_token=${accessToken}`
                );
                const fallbackData = await fallbackRes.json();
                if (fallbackData.data) {
                    finalInsights = fallbackData.data;
                } else {
                    console.warn("Instagram API Insights Warning (Fallback Metrics):", fallbackData.error);
                }
            } catch (fallbackErr) {
                console.warn("Instagram API Insights Fallback Failed:", fallbackErr);
            }
        }

        return {
            success: true,
            data: {
                ...mediaData,
                insights: finalInsights
            }
        };

    } catch (err) {
        console.error("Error in getInstagramPostAnalytics:", err);
        return { success: false, message: err.message };
    }
}
