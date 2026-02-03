"use server";

import { db } from "@/lib/firebase";
import {
    collection,
    query,
    where,
    getDocs,
    doc,
    getDoc,
    Timestamp
} from "firebase/firestore";
import { verifyToken } from "@/lib/auth";
import { getPackageConfig } from "@/lib/package-configs";

/**
 * Calculates the current user's usage stats (connected accounts and monthly posts)
 */
export async function getUserUsageAction() {
    try {
        const user = await verifyToken();
        if (!user) {
            return { success: false, error: "Unauthorized" };
        }

        const userId = user.id;

        // Administrator Bypass
        if (user.role === 'Administrator') {
            return {
                success: true,
                usage: {
                    accounts: { used: 0, limit: -1, percent: 0 },
                    posts: { used: 0, limit: -1, percent: 0 },
                    package: "Administrator (Unlimited)",
                    cycleStart: new Date().toISOString()
                }
            };
        }

        // 1. Get Package Limits
        // We prefer the limits stored in the user document, fallback to hardcoded configs
        const userDoc = await getDoc(doc(db, "users", userId));
        const userData = userDoc.exists() ? userDoc.data() : {};
        const packageId = userData.subscription?.packageId || 'free';
        const limits = userData.subscription?.limits || getPackageConfig(packageId);

        // 2. Count Connected Accounts
        const accountsQuery = query(
            collection(db, "socialAccounts"),
            where("userId", "==", userId),
            where("status", "==", "active")
        );
        const accountsSnap = await getDocs(accountsQuery);

        let connectedAccounts = 0;
        accountsSnap.forEach((doc) => {
            const data = doc.data();
            if (data.platform === 'facebook' && Array.isArray(data.pages) && data.pages.length > 0) {
                connectedAccounts += data.pages.length;
            } else {
                connectedAccounts += 1;
            }
        });

        // 3. Count Monthly Posts
        // We need to determine the start of the current billing cycle
        // Fallback to the first of the current calendar month if billing profile is missing
        let usageStart = new Date();
        usageStart.setDate(1);
        usageStart.setHours(0, 0, 0, 0);

        const billingProfileSnap = await getDoc(doc(db, "billing_profiles", userId));
        if (billingProfileSnap.exists()) {
            const billingData = billingProfileSnap.data();
            if (billingData.nextBillingDate) {
                const nextBilling = billingData.nextBillingDate.toDate ? billingData.nextBillingDate.toDate() : new Date(billingData.nextBillingDate);
                const cycleStart = new Date(nextBilling);
                if (billingData.billingCycle === 'monthly') {
                    cycleStart.setMonth(cycleStart.getMonth() - 1);
                } else {
                    cycleStart.setFullYear(cycleStart.getFullYear() - 1);
                }

                // If the calculated cycle start is in the future, it means we are in the previous cycle
                if (cycleStart > new Date()) {
                    if (billingData.billingCycle === 'monthly') {
                        cycleStart.setMonth(cycleStart.getMonth() - 1);
                    } else {
                        cycleStart.setFullYear(cycleStart.getFullYear() - 1);
                    }
                }
                usageStart = cycleStart;
            }
        }

        const usageStartTimestamp = Timestamp.fromDate(usageStart);

        // Query across all platform post collections
        const platforms = ['facebook', 'instagram', 'twitter', 'linkedin', 'tiktok', 'pinterest', 'threads', 'bluesky'];
        let totalMonthlyPosts = 0;

        const postQueries = platforms.map(async (platform) => {
            try {
                const collectionName = `${platform}_posts`;
                // We count all posts created in this cycle, regardless of status (published or scheduled)
                // because they consume the allocation.
                const q = query(
                    collection(db, collectionName),
                    where("userId", "==", userId),
                    where("createdAt", ">=", usageStartTimestamp)
                );

                // Filtering out deleted posts
                // Note: Not all collections might have the 'delete' field yet, but we'll try
                const snap = await getDocs(q);
                return snap.docs.filter(doc => doc.data().delete !== 1).length;
            } catch (e) {
                // If collection doesn't exist, ignore
                return 0;
            }
        });

        const counts = await Promise.all(postQueries);
        totalMonthlyPosts = counts.reduce((acc, curr) => acc + curr, 0);

        return {
            success: true,
            usage: {
                accounts: {
                    used: connectedAccounts,
                    limit: limits.socialAccounts || 0,
                    percent: Math.min(100, Math.round((connectedAccounts / (limits.socialAccounts || 1)) * 100))
                },
                posts: {
                    used: totalMonthlyPosts,
                    limit: limits.monthlyPosts || limits.scheduledPosts || 0,
                    percent: Math.min(100, Math.round((totalMonthlyPosts / (limits.monthlyPosts || limits.scheduledPosts || 1)) * 100))
                },
                package: limits.name,
                cycleStart: usageStart.toISOString()
            }
        };

    } catch (error) {
        console.error("Error calculating user usage:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Checks if a user has remaining quota for a specific action
 * @param {string} type - 'post' or 'account'
 */
export async function checkUsageLimitAction(type) {
    const data = await getUserUsageAction();
    if (!data.success) return data;

    const { usage } = data;
    if (type === 'post') {
        if (usage.posts.used >= usage.posts.limit && usage.posts.limit !== -1) {
            return { success: false, error: "Monthly post limit reached for your plan." };
        }
    } else if (type === 'account') {
        if (usage.accounts.used >= usage.accounts.limit && usage.accounts.limit !== -1) {
            return { success: false, error: "Connected accounts limit reached for your plan." };
        }
    }

    return { success: true };
}
/**
 * Professionals only: Centralized enforcement of usage limits and authentication
 * @param {string} type - 'post' or 'account'
 * @param {boolean} skipQuotaCheck - Whether to skip the quota check (e.g. for edits)
 * @returns {Promise<Object>} - The authenticated user object
 * @throws {Error} - If unauthorized or quota exceeded
 */
export async function enforceUsageLimit(type, skipQuotaCheck = false) {
    const user = await verifyToken();
    if (!user) {
        throw new Error("Invalid or expired token. Please log in again.");
    }

    if (!skipQuotaCheck) {
        const usageCheck = await checkUsageLimitAction(type);
        if (!usageCheck.success) {
            throw new Error(usageCheck.error);
        }
    }

    return user;
}
