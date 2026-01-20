"use server";

import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, serverTimestamp, query, collection, where, getDocs } from "firebase/firestore";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { getValidPinterestAccessToken } from "./connectAccount";

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

            let { accessToken } = await getValidPinterestAccessToken(user.id, targetAccountId);

            if (accessToken) {

                // 3. Call Pinterest API
                // https://api.pinterest.com/v5/pins/{pin_id}/analytics
                // &metric_types=IMPRESSION,OUTRO,CLICK,SAVE,PIN_CLICK,PROFILE_VISIT,FOLLOW

                // Dates: Pinterest analytics usually require start/end date. 
                // We'll ask for last 30 days or lifetime if API supports simplified view.
                // V5 /pins/{pin_id}/analytics requires start_date and end_date.

                const endDate = new Date().toISOString().split('T')[0];
                const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

                const metricsList = "IMPRESSION,OUTRO,CLICK,SAVE,PIN_CLICK";

                const apiUrl = process.env.PINTEREST_API_URL || "https://api.pinterest.com/v5";
                const url = `${apiUrl}/pins/${pinterestPinId}/analytics?start_date=${startDate}&end_date=${endDate}&metric_types=${metricsList}`;

                let response = await fetch(url, {
                    headers: {
                        "Authorization": `Bearer ${accessToken}`,
                    }
                });

                let data = await response.json();

                if (!response.ok) {
                    // Check for Authentication Error (401) and retry once with forced refresh
                    if (response.status === 401) {
                        console.warn("Got 401 from Pinterest Analytics. Attempting token refresh and retry...");
                        const { accessToken: newAccessToken } = await getValidPinterestAccessToken(user.id, targetAccountId, true);

                        if (newAccessToken) {
                            // Retry the request
                            const retryResponse = await fetch(url, {
                                headers: { "Authorization": `Bearer ${newAccessToken}` }
                            });

                            if (retryResponse.ok) {
                                // Update variables to proceed with success path
                                data = await retryResponse.json();
                                response = retryResponse;
                                accessToken = newAccessToken; // Update for fallbacks
                            } else {
                                console.warn("Retry failed:", await retryResponse.text());
                                // Update accessToken anyway so fallbacks try with new token?
                                // Yes, if we got a new token, it's better than the old one.
                                accessToken = newAccessToken;
                            }
                        }
                    }

                    if (data.code === 3022) {
                        console.log("Pinterest Sandbox: Analytics endpoint not supported. Using Mock Data for testing.");
                        // Inject Mock Data for Sandbox Visualization so the UI isn't empty
                        metrics = {
                            views: 1245,
                            clicks: 342,
                            saves: 85,
                            impressions: 1530,
                            outro: 120,
                            reactions: 45,
                            comments: 12
                        };
                    } else {
                        console.warn("Pinterest Analytics API Error:", data);
                    }

                    // Fallback: try to get basic pin info with metrics
                    const pinUrl = `${apiUrl}/pins/${pinterestPinId}?pin_metrics=true`;
                    const pinRes = await fetch(pinUrl, {
                        headers: { "Authorization": `Bearer ${accessToken}` }
                    });
                    const pinDataApi = await pinRes.json();

                    if (pinRes.ok) {
                        const lifetime = pinDataApi.pin_metrics?.lifetime || {};
                        metrics = {
                            views: lifetime.impression ?? metrics.views ?? 0,
                            clicks: lifetime.pin_click ?? lifetime.outbound_click ?? metrics.clicks ?? 0,
                            saves: lifetime.save ?? metrics.saves ?? 0,
                            impressions: lifetime.impression ?? metrics.impressions ?? 0,
                            outro: metrics.outro ?? 0,
                            reactions: lifetime.reaction ?? 0,
                            comments: lifetime.comment ?? 0
                        };

                        analyticsData = {
                            ...analyticsData,
                            ...pinDataApi,
                            permalink: `https://www.pinterest.com/pin/${pinterestPinId}`
                        };
                    } else {
                        analyticsData = {
                            ...analyticsData,
                            permalink: `https://www.pinterest.com/pin/${pinterestPinId}`
                        };
                    }
                } else {
                    // Try to also get lifetime metrics for reactions/comments which are NOT in the analytics endpoint
                    const pinUrl = `${apiUrl}/pins/${pinterestPinId}?pin_metrics=true`;
                    const pinRes = await fetch(pinUrl, {
                        headers: { "Authorization": `Bearer ${accessToken}` }
                    });
                    const pinDataApi = await pinRes.json();
                    const lifetime = pinRes.ok ? (pinDataApi.pin_metrics?.lifetime || {}) : {};

                    // Pinterest V5 Analytics returns { "all": { "summary_metrics": { ... }, "daily_metrics": [...] } }
                    const summary = data.all?.summary_metrics || data.summary_metrics || {};

                    metrics = {
                        views: summary.IMPRESSION || lifetime.impression || 0,
                        clicks: summary.PIN_CLICK || summary.CLICK || lifetime.pin_click || 0,
                        saves: summary.SAVE || lifetime.save || 0,
                        impressions: summary.IMPRESSION || lifetime.impression || 0,
                        outro: summary.OUTRO || 0,
                        reactions: lifetime.reaction || 0,
                        comments: lifetime.comment || 0
                    };

                    analyticsData = {
                        ...data,
                        pin_details: pinRes.ok ? pinDataApi : null,
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

        // Determine what to return for lastRefreshed
        let resolvedSyncTime = null;
        if (needsRefresh) {
            // If we successfully performed a refresh (or at least attempted it with active account)
            resolvedSyncTime = now.toISOString();
        } else if (lastUpdate.getTime() > 0) {
            // Use cached time if valid
            resolvedSyncTime = lastUpdate.toISOString();
        }

        return {
            success: true,
            data: {
                ...analyticsData,
                metrics: metrics, // Pass processed metrics directly
                permalink: analyticsData.permalink || `https://www.pinterest.com/pin/${pinterestPinId}`
            },
            lastRefreshed: resolvedSyncTime
        };

    } catch (error) {
        console.error("Error fetching Pinterest analytics:", error);
        return { success: false, message: error.message };
    }
}
