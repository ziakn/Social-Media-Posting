"use server";

import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, serverTimestamp, query, collection, where, getDocs } from "firebase/firestore";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

/**
 * Fetch analytics for a Pinterest post
 */
export async function getPinterestPostAnalytics(pageId, postId, forceRefresh = false) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;
        const user = await verifyToken(token);

        if (!user) {
            return { success: false, message: "Unauthorized" };
        }

        // 1. Get post data
        const postRef = doc(db, "pinterest_posts", postId);
        const postSnap = await getDoc(postRef);

        if (!postSnap.exists()) {
            return { success: false, message: "Post not found" };
        }

        const postData = postSnap.data();
        const pinterestPinId = postData.pinterestPinId;

        if (!pinterestPinId) {
            return { success: false, message: "Pinterest Pin ID not found." };
        }

        // 2. Caching logic (30 mins)
        const lastUpdate = postData.lastAnalyticsUpdate?.toDate?.() || new Date(0);
        const now = new Date();
        const needsRefresh = forceRefresh || (now.getTime() - lastUpdate.getTime() > 30 * 60 * 1000);

        let metrics = postData.metrics || {};
        let analyticsData = postData.analytics || {};

        if (needsRefresh) {
            // Get Account Access Token
            const targetAccountId = pageId || postData.accountId;

            const q = query(
                collection(db, "socialAccounts"),
                where("userId", "==", user.id),
                where("accountId", "==", targetAccountId),
                where("platform", "==", "pinterest"),
                where("status", "==", "active")
            );

            const accountSnap = await getDocs(q);

            if (!accountSnap.empty) {
                const accountData = accountSnap.docs[0].data();
                const accessToken = accountData.accessToken;

                // 3. Call Pinterest API
                // https://api.pinterest.com/v5/pins/{pin_id}/analytics
                // &metric_types=IMPRESSION,OUTRO,CLICK,SAVE,PIN_CLICK,PROFILE_VISIT,FOLLOW

                // Dates: Pinterest analytics usually require start/end date. 
                // We'll ask for last 30 days or lifetime if API supports simplified view.
                // V5 /pins/{pin_id}/analytics requires start_date and end_date.

                const endDate = new Date().toISOString().split('T')[0];
                const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

                const metricsList = "IMPRESSION,OUTRO,CLICK,SAVE,PIN_CLICK";

                const url = `https://api.pinterest.com/v5/pins/${pinterestPinId}/analytics?start_date=${startDate}&end_date=${endDate}&metric_types=${metricsList}`;

                const response = await fetch(url, {
                    headers: {
                        "Authorization": `Bearer ${accessToken}`,
                    }
                });

                const data = await response.json();

                if (!response.ok) {
                    // Check if it's because pin is too new or other error
                    console.warn("Pinterest Analytics API Error:", data);

                    // Fallback: try to get basic pin info which has some counts
                    const pinUrl = `https://api.pinterest.com/v5/pins/${pinterestPinId}`;
                    const pinRes = await fetch(pinUrl, {
                        headers: { "Authorization": `Bearer ${accessToken}` }
                    });
                    const pinDataApi = await pinRes.json();

                    if (pinRes.ok) {
                        // Note: Standard Pin object might not have detailed metrics but has saves/comments sometimes?
                        // V5 Pin object usually has 'note', 'link', etc. Not metrics directly.
                        // We will just store what we have or 0s.
                    }

                    // Allow partial success if analytics fail
                } else {
                    // Pinterest V5 Analytics returns { "all": { "summary_metrics": { ... }, "daily_metrics": [...] } }
                    // or similar structure.

                    // Helper: map Pinterest metrics to our standard keys
                    const summary = data.summary_metrics || {};

                    metrics = {
                        views: summary.IMPRESSION || 0,
                        clicks: summary.PIN_CLICK || summary.CLICK || 0, // Outbound clicks
                        saves: summary.SAVE || 0,
                        impressions: summary.IMPRESSION || 0,
                    };

                    analyticsData = {
                        ...data,
                        permalink: `https://www.pinterest.com/pin/${pinterestPinId}`
                    };

                    // Update Firestore
                    await updateDoc(postRef, {
                        analytics: analyticsData,
                        metrics: metrics,
                        lastAnalyticsUpdate: serverTimestamp(),
                        updatedAt: serverTimestamp()
                    });
                }

            }
        }

        return {
            success: true,
            data: {
                ...analyticsData,
                permalink: analyticsData.permalink || `https://www.pinterest.com/pin/${pinterestPinId}`
            },
            lastRefreshed: (needsRefresh && !forceRefresh) ? now.toISOString() : lastUpdate.toISOString()
        };

    } catch (error) {
        console.error("Error fetching Pinterest analytics:", error);
        return { success: false, message: error.message };
    }
}
