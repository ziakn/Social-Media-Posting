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

                // Scalable Approach: Run 3 targeted queries to fetch ONLY potential candidates
                // This ensures we only read O(MonthlyUsage) docs instead of O(TotalHistory)
                // REQUIRED INDEXES:
                // 1. userId (ASC) + createdAt (ASC/DESC)
                // 2. userId (ASC) + scheduledAt (ASC/DESC)
                // 3. userId (ASC) + publishedAt (ASC/DESC)

                const qCreated = query(
                    collection(db, collectionName),
                    where("userId", "==", userId),
                    where("createdAt", ">=", usageStartTimestamp)
                );

                const qScheduled = query(
                    collection(db, collectionName),
                    where("userId", "==", userId),
                    where("scheduledAt", ">=", usageStartTimestamp)
                );

                const qPublished = query(
                    collection(db, collectionName),
                    where("userId", "==", userId),
                    where("publishedAt", ">=", usageStartTimestamp)
                );

                try {
                    // Run in parallel
                    const [snapCreated, snapScheduled, snapPublished] = await Promise.all([
                        getDocs(qCreated),
                        getDocs(qScheduled),
                        getDocs(qPublished)
                    ]);

                    // Deduplicate using a Map
                    const uniqueDocs = new Map();

                    const processSnap = (snap) => {
                        snap.forEach(doc => {
                            uniqueDocs.set(doc.id, doc);
                        });
                    };

                    processSnap(snapCreated);
                    processSnap(snapScheduled);
                    processSnap(snapPublished);

                    // Filter valid usage in memory (double check date & strict delete)
                    return Array.from(uniqueDocs.values()).filter(doc => {
                        const data = doc.data();

                        if (data.delete === 1) return false;

                        let effectiveDate = null;
                        if (data.publishedAt) {
                            effectiveDate = data.publishedAt.toDate ? data.publishedAt.toDate() : new Date(data.publishedAt);
                        } else if (data.scheduledAt) {
                            effectiveDate = data.scheduledAt.toDate ? data.scheduledAt.toDate() : new Date(data.scheduledAt);
                        } else if (data.createdAt) {
                            effectiveDate = data.createdAt.toDate ? data.createdAt.toDate() : new Date(data.createdAt);
                        }

                        if (!effectiveDate) return false;

                        return effectiveDate >= usageStart;
                    }).length;

                } catch (idxError) {
                    // If index is missing, Firestore usually returns a link to create it.
                    // We log this clearly for the developer/user.
                    if (idxError.code === 'failed-precondition') {
                        console.error(`MISSING INDEX for ${collectionName}. Create it here:`, idxError.message);
                    }
                    throw idxError; // Re-throw to be caught by outer catch and potentially fail gracefully or return 0
                }
            } catch (e) {
                // If collection doesn't exist, ignore
                console.warn(`Error counting posts for ${platform}:`, e);
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
                    limit: limits.monthlyPosts || 0,
                    percent: Math.min(100, Math.round((totalMonthlyPosts / (limits.monthlyPosts || 1)) * 100))
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
