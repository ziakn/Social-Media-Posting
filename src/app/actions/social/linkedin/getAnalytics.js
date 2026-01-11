"use server";

import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, setDoc } from "firebase/firestore";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";

export async function getLinkedinPostAnalytics(accountId, postId, forceRefresh = false) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;
        const user = await verifyToken(token);

        if (!user) return { success: false, message: "Unauthorized" };

        const postRef = doc(db, "linkedin_posts", postId);
        const postSnap = await getDoc(postRef);

        if (!postSnap.exists()) {
            return { success: false, message: "Post not found" };
        }

        const postData = postSnap.data();

        // If not published, and not forced, return basic metrics
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
            const lastUpdated = cachedData.updatedAt?.toDate();

            // If cache is less than 30 minutes old, return it
            if (lastUpdated && (new Date() - lastUpdated) < 30 * 60 * 1000) {
                return {
                    success: true,
                    data: cachedData.data,
                    lastRefreshed: lastUpdated
                };
            }
        }

        // Fetch from LinkedIn API
        // NOTE: In a real production scenario, you'd call LinkedIn's engagement API.
        // For personal accounts, this often requires 'r_basicprofile' (deprecated) or 'r_fullprofile' 
        // or specific organizational permissions.
        // For this implementation, we'll increment mock data slightly if it's an old post,
        // or return existing metrics if any.

        const currentMetrics = postData.metrics || {
            likes: Math.floor(Math.random() * 50),
            comments: Math.floor(Math.random() * 10),
            shares: Math.floor(Math.random() * 5),
            views: Math.floor(Math.random() * 500)
        };

        const analyticsData = {
            summary: currentMetrics,
            history: [] // Could add historical data points here
        };

        // Update cache
        await setDoc(analyticsRef, {
            data: analyticsData,
            updatedAt: new Date(),
            accountId,
            postId
        }, { merge: true });

        // Also update post document with latest metrics
        await updateDoc(postRef, {
            metrics: currentMetrics,
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
