"use server";

import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, setDoc, collection, query, where, getDocs } from "firebase/firestore";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";

/**
 * Fetch LinkedIn post analytics using the socialActions API
 * 
 * @param {string} accountId - The LinkedIn account ID
 * @param {string} postId - The Firestore post document ID
 * @param {boolean} forceRefresh - Whether to bypass cache
 * @returns {Promise<object>} Analytics data
 */
export async function getLinkedinPostAnalytics(accountId, postId, forceRefresh = false) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;
        const user = await verifyToken(token);

        if (!user) return { success: false, message: "Unauthorized" };

        // Get the post document
        const postRef = doc(db, "linkedin_posts", postId);
        const postSnap = await getDoc(postRef);

        if (!postSnap.exists()) {
            return { success: false, message: "Post not found" };
        }

        const postData = postSnap.data();

        // If not published, return basic/empty metrics
        if (postData.status !== 'posted' && postData.status !== 'published') {
            return {
                success: true,
                data: {
                    summary: postData.metrics || {
                        likes: 0,
                        comments: 0,
                        shares: 0,
                        views: 0
                    }
                }
            };
        }

        // Check cache if not forceRefresh
        const analyticsRef = doc(db, "linkedin_analytics", postId);
        const analyticsSnap = await getDoc(analyticsRef);

        if (!forceRefresh && analyticsSnap.exists()) {
            const cachedData = analyticsSnap.data();
            const lastUpdated = cachedData.updatedAt?.toDate?.() || cachedData.updatedAt;

            // If cache is less than 30 minutes old, return it
            if (lastUpdated && (new Date() - new Date(lastUpdated)) < 30 * 60 * 1000) {
                return {
                    success: true,
                    data: cachedData.data,
                    lastRefreshed: lastUpdated instanceof Date ? lastUpdated.toISOString() : lastUpdated
                };
            }
        }

        // Get account access token
        const accountQuery = query(
            collection(db, "socialAccounts"),
            where("userId", "==", user.id),
            where("accountId", "==", accountId),
            where("platform", "==", "linkedin")
        );

        const accountSnap = await getDocs(accountQuery);

        if (accountSnap.empty) {
            // Fallback: try to find any LinkedIn account for this user
            const fallbackQuery = query(
                collection(db, "socialAccounts"),
                where("userId", "==", user.id),
                where("platform", "==", "linkedin"),
                where("status", "==", "active")
            );
            const fallbackSnap = await getDocs(fallbackQuery);

            if (fallbackSnap.empty) {
                // Return cached/stored metrics if no account found
                return {
                    success: true,
                    data: {
                        summary: postData.metrics || {
                            likes: 0,
                            comments: 0,
                            shares: 0,
                            views: 0
                        }
                    },
                    message: "LinkedIn account not connected",
                    isRateLimited: true
                };
            }
        }

        const accountData = accountSnap.empty ? null : accountSnap.docs[0].data();
        const accessToken = accountData?.accessToken;

        if (!accessToken) {
            // Return cached metrics if no access token
            return {
                success: true,
                data: {
                    summary: postData.metrics || {
                        likes: 0,
                        comments: 0,
                        shares: 0,
                        views: 0
                    }
                },
                message: "Access token not available"
            };
        }

        // Fetch from LinkedIn socialActions API
        const linkedinPostId = postData.linkedinPostId;

        if (!linkedinPostId) {
            // No LinkedIn post ID stored, return cached metrics
            return {
                success: true,
                data: {
                    summary: postData.metrics || {
                        likes: 0,
                        comments: 0,
                        shares: 0,
                        views: 0
                    }
                },
                message: "LinkedIn post ID not available"
            };
        }

        let analyticsData = {
            summary: {
                likes: 0,
                comments: 0,
                shares: 0,
                views: 0
            }
        };

        try {
            // Encode the URN for the API call
            const encodedUrn = encodeURIComponent(linkedinPostId);

            console.log("[LinkedIn Analytics] Fetching real data from API...");
            console.log("[LinkedIn Analytics] Post URN:", linkedinPostId);
            console.log("[LinkedIn Analytics] API URL:", `https://api.linkedin.com/v2/socialActions/${encodedUrn}`);

            // Fetch social actions (likes, comments, shares)
            const socialActionsRes = await fetch(
                `https://api.linkedin.com/v2/socialActions/${encodedUrn}`,
                {
                    headers: {
                        "Authorization": `Bearer ${accessToken}`,
                        "X-Restli-Protocol-Version": "2.0.0"
                    }
                }
            );

            console.log("[LinkedIn Analytics] API Response Status:", socialActionsRes.status);

            if (socialActionsRes.ok) {
                const socialData = await socialActionsRes.json();
                console.log("[LinkedIn Analytics] API Response Data:", JSON.stringify(socialData, null, 2));

                analyticsData.summary = {
                    likes: socialData.likesSummary?.totalLikes || 0,
                    comments: socialData.commentsSummary?.totalFirstLevelComments ||
                        socialData.commentsSummary?.aggregatedTotalComments || 0,
                    shares: socialData.likesSummary?.likedByCurrentUser ? 1 : 0, // Shares are harder to get
                    views: 0 // LinkedIn doesn't provide views via this endpoint for personal posts
                };

                // Try to get shares count from a different approach if available
                if (socialData.sharesSummary) {
                    analyticsData.summary.shares = socialData.sharesSummary?.totalShares || 0;
                }

                console.log("[LinkedIn Analytics] Extracted Metrics:", analyticsData.summary);
            } else {
                // API call failed, check if rate limited
                const errorData = await socialActionsRes.json().catch(() => ({}));
                console.warn("[LinkedIn Analytics] API Error:", socialActionsRes.status, errorData);

                // Return cached data with rate limit flag
                if (socialActionsRes.status === 429 || socialActionsRes.status === 403) {
                    console.log("[LinkedIn Analytics] Rate limited - returning cached data");
                    return {
                        success: true,
                        data: {
                            summary: postData.metrics || analyticsData.summary
                        },
                        isRateLimited: true,
                        message: "LinkedIn API rate limit reached. Showing cached data.",
                        lastRefreshed: analyticsSnap.exists() ?
                            (analyticsSnap.data().updatedAt?.toDate?.()?.toISOString() || null) : null
                    };
                }

                // For other errors, return existing metrics
                analyticsData.summary = postData.metrics || analyticsData.summary;
            }
        } catch (apiError) {
            console.error("[LinkedIn Analytics] API call failed:", apiError);
            // Fallback to cached/stored metrics
            analyticsData.summary = postData.metrics || analyticsData.summary;
        }

        // Update cache
        await setDoc(analyticsRef, {
            data: analyticsData,
            updatedAt: new Date(),
            accountId,
            postId
        }, { merge: true });

        // Also update post document with latest metrics
        await updateDoc(postRef, {
            metrics: analyticsData.summary,
            updatedAt: new Date()
        });

        return {
            success: true,
            data: analyticsData,
            lastRefreshed: new Date().toISOString()
        };

    } catch (error) {
        console.error("Error in getLinkedinPostAnalytics:", error);
        return { success: false, message: error.message };
    }
}
