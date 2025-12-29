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
        // First, fetch basic media fields including media_type
        const mediaFields = "media_type,like_count,comments_count,timestamp,permalink,shortcode";
        const mediaRes = await fetch(
            `https://graph.facebook.com/v24.0/${postId}?fields=${mediaFields}&access_token=${accessToken}`
        );
        const mediaData = await mediaRes.json();

        if (mediaData.error) {
            console.error("Instagram API Error (Media):", mediaData.error);
            return { success: false, message: mediaData.error.message };
        }

        const mediaType = mediaData.media_type;
        let metrics = "impressions,reach,saved";

        // Add specific metrics based on type
        if (mediaType === "VIDEO" || mediaType === "REELS") { // REELS might be VIDEO in API
            metrics += ",video_views"; // plays might be better for reels, but video_views is standard
            // For Reels, 'plays' is often used instead of 'video_views' in newer API versions, but let's stick to standard first or try both if needed.
            // Actually v19.0+ often uses 'plays' for Reels. Let's try to add it.
            metrics += ",plays";
            metrics += ",total_interactions";
        } else if (mediaType === "CAROUSEL_ALBUM") {
            metrics += ",carousel_album_impressions,carousel_album_reach,carousel_album_saved,carousel_album_video_views"; // older metrics, might just be same as image
            // Actually for Carousel, strictly it's impressions, reach, saved.
        }

        // Simple approach: Try to fetch common insights. API will ignore or error on invalid ones? 
        // Best to be specific.
        // Documentation says: 
        // Image/Carousel: impressions, reach, saved, total_interactions
        // Video: impressions, reach, saved, video_views, total_interactions (and 30s views etc)
        // Reels: plays, reach, total_interactions, saved, various others.

        // Let's stick to basic set that covers most user requests
        // "Impressions, Views, Likes, Shares"
        // Likes -> like_count (from media object)
        // Shares -> not always available as insight, sometimes public metric. 
        // Note: 'shares' metric exists for some objects.

        let insightsMetricParam = "impressions,reach,saved,total_interactions";
        if (mediaType === "VIDEO" || mediaType === "REELS") {
            insightsMetricParam += ",video_views,plays"; // hope API handles 'plays' if it's Reel
        }

        const insightsRes = await fetch(
            `https://graph.facebook.com/v24.0/${postId}/insights?metric=${insightsMetricParam}&access_token=${accessToken}`
        );
        const insightsData = await insightsRes.json();

        // If specific metrics fail (e.g. video_views on image), we might need to retry with safer list 
        // or just handle the error.
        // However, Graph API often returns partial data or error if ONE metric is invalid.

        let finalInsights = [];
        if (insightsData.data) {
            finalInsights = insightsData.data;
        } else if (insightsData.error) {
            // Fallback: try simpler metrics if complex one failed
            console.warn("Instagram API Insights Warning:", insightsData.error);
            // Try very basic
            const basicRes = await fetch(
                `https://graph.facebook.com/v24.0/${postId}/insights?metric=impressions,reach,saved&access_token=${accessToken}`
            );
            const basicData = await basicRes.json();
            if (basicData.data) finalInsights = basicData.data;
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
