"use server";

import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, orderBy, limit, doc, getDoc } from "firebase/firestore";
import { verifyToken } from "@/lib/auth";

/**
 * Main dashboard metrics function - routes to admin or user based on role
 */
export async function getDashboardMetrics() {
    try {
        const user = await verifyToken();

        if (!user) {
            return { success: false, error: "Unauthorized" };
        }

        const isAdmin = user.role === 'Administrator';

        if (isAdmin) {
            return await getAdminDashboardMetrics(user);
        } else {
            return await getUserDashboardMetrics(user);
        }
    } catch (error) {
        console.error("Error fetching dashboard metrics:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Get system-wide metrics for Administrators
 */
async function getAdminDashboardMetrics(user) {
    try {
        // Parallel data fetching for performance
        const [
            usersData,
            postsData,
            scheduledData,
            failedData,
            mediaData,
            subscriptionsData,
            platformsData,
            activityData
        ] = await Promise.all([
            getTotalUsers(),
            getTotalPosts(),
            getTotalScheduledPosts(),
            getTotalFailedPosts(),
            getTotalMediaItems(),
            getSubscriptionsBreakdown(),
            getPlatformConnectivity(),
            getRecentActivity(20, true) // Admin sees all activity
        ]);

        return {
            success: true,
            role: 'Administrator',
            metrics: {
                users: usersData,
                posts: postsData,
                scheduled: scheduledData,
                failed: failedData,
                media: mediaData,
                subscriptions: subscriptionsData,
                platforms: platformsData,
                activity: activityData
            }
        };
    } catch (error) {
        console.error("Error fetching admin dashboard metrics:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Get personal metrics for regular users
 */
async function getUserDashboardMetrics(user) {
    try {
        // Parallel data fetching for performance
        const [
            postsData,
            scheduledData,
            failedData,
            mediaData,
            subscriptionData,
            platformsData,
            activityData
        ] = await Promise.all([
            getUserPosts(user.id),
            getUserScheduledPosts(user.id),
            getUserFailedPosts(user.id),
            getUserMediaItems(user.id),
            getUserSubscription(user.id),
            getUserPlatforms(user.id),
            getRecentActivity(10, false, user.id) // User sees only their activity
        ]);

        return {
            success: true,
            role: user.role || 'User',
            metrics: {
                posts: postsData,
                scheduled: scheduledData,
                failed: failedData,
                media: mediaData,
                subscription: subscriptionData,
                platforms: platformsData,
                activity: activityData
            }
        };
    } catch (error) {
        console.error("Error fetching user dashboard metrics:", error);
        return { success: false, error: error.message };
    }
}

// ============================================================================
// ADMIN-SPECIFIC FUNCTIONS
// ============================================================================

/**
 * Get total users count
 */
async function getTotalUsers() {
    try {
        const usersSnap = await getDocs(collection(db, "users"));
        const total = usersSnap.size;

        // Calculate growth (mock for now - would need historical data)
        const growth = "+12%"; // TODO: Calculate from historical data

        return {
            total,
            growth,
            trend: "up"
        };
    } catch (error) {
        console.error("Error fetching total users:", error);
        return { total: 0, growth: "0%", trend: "neutral" };
    }
}

/**
 * Get total posts across all platforms
 */
async function getTotalPosts() {
    try {
        const platforms = ['facebook', 'instagram', 'twitter', 'linkedin', 'tiktok', 'pinterest', 'threads', 'bluesky', 'youtube'];

        let totalCount = 0;
        const platformBreakdown = {};

        await Promise.all(platforms.map(async (platform) => {
            try {
                const collectionName = `${platform}_posts`;
                const q = query(
                    collection(db, collectionName),
                    where("delete", "==", 0)
                );
                const snapshot = await getDocs(q);
                const count = snapshot.size;
                totalCount += count;
                platformBreakdown[platform] = count;
            } catch (e) {
                // Collection might not exist
                platformBreakdown[platform] = 0;
            }
        }));

        return {
            total: totalCount,
            breakdown: platformBreakdown,
            trend: "up",
            growth: "+8%"
        };
    } catch (error) {
        console.error("Error fetching total posts:", error);
        return { total: 0, breakdown: {}, trend: "neutral", growth: "0%" };
    }
}

/**
 * Get total scheduled posts
 */
async function getTotalScheduledPosts() {
    try {
        const platforms = ['facebook', 'instagram', 'twitter', 'linkedin', 'tiktok', 'pinterest', 'threads', 'bluesky'];

        let totalCount = 0;

        await Promise.all(platforms.map(async (platform) => {
            try {
                const collectionName = `${platform}_posts`;
                const q = query(
                    collection(db, collectionName),
                    where("status", "==", "scheduled"),
                    where("delete", "==", 0)
                );
                const snapshot = await getDocs(q);
                totalCount += snapshot.size;
            } catch (e) {
                // Collection might not exist
            }
        }));

        return {
            total: totalCount,
            trend: "neutral"
        };
    } catch (error) {
        console.error("Error fetching scheduled posts:", error);
        return { total: 0, trend: "neutral" };
    }
}

/**
 * Get total failed posts
 */
async function getTotalFailedPosts() {
    try {
        const platforms = ['facebook', 'instagram', 'twitter', 'linkedin', 'tiktok', 'pinterest', 'threads', 'bluesky'];

        let totalCount = 0;

        await Promise.all(platforms.map(async (platform) => {
            try {
                const collectionName = `${platform}_posts`;
                const q = query(
                    collection(db, collectionName),
                    where("status", "==", "failed"),
                    where("delete", "==", 0)
                );
                const snapshot = await getDocs(q);
                totalCount += snapshot.size;
            } catch (e) {
                // Collection might not exist
            }
        }));

        return {
            total: totalCount,
            trend: totalCount > 5 ? "down" : "neutral",
            message: totalCount > 5 ? "Needs Attention" : "Healthy"
        };
    } catch (error) {
        console.error("Error fetching failed posts:", error);
        return { total: 0, trend: "neutral", message: "Unknown" };
    }
}

/**
 * Get total media items and storage
 */
async function getTotalMediaItems() {
    try {
        const gallerySnap = await getDocs(collection(db, "gallery"));
        const total = gallerySnap.size;

        // Calculate total storage (sum of file sizes)
        let totalBytes = 0;
        gallerySnap.forEach(doc => {
            const data = doc.data();
            totalBytes += data.size || 0;
        });

        // Convert to GB
        const totalGB = (totalBytes / (1024 * 1024 * 1024)).toFixed(2);

        return {
            total,
            storage: `${totalGB} GB`,
            storageBytes: totalBytes
        };
    } catch (error) {
        console.error("Error fetching media items:", error);
        return { total: 0, storage: "0 GB", storageBytes: 0 };
    }
}

/**
 * Get subscriptions breakdown
 */
async function getSubscriptionsBreakdown() {
    try {
        const usersSnap = await getDocs(collection(db, "users"));

        const breakdown = {
            Free: 0,
            Creator: 0,
            Pro: 0,
            Agency: 0,
            active: 0,
            inactive: 0
        };

        usersSnap.forEach(doc => {
            const data = doc.data();
            const subscription = data.subscription;

            if (subscription && subscription.packageName) {
                const planName = subscription.packageName;
                if (breakdown[planName] !== undefined) {
                    breakdown[planName]++;
                }

                if (subscription.status === 'active') {
                    breakdown.active++;
                } else {
                    breakdown.inactive++;
                }
            } else {
                breakdown.Free++;
                breakdown.inactive++;
            }
        });

        return breakdown;
    } catch (error) {
        console.error("Error fetching subscriptions breakdown:", error);
        return { Free: 0, Creator: 0, Pro: 0, Agency: 0, active: 0, inactive: 0 };
    }
}

/**
 * Get platform connectivity status for all users
 */
async function getPlatformConnectivity() {
    try {
        const platforms = [
            { name: 'Facebook', platformId: 'facebook', icon: 'Facebook' },
            { name: 'Instagram', platformId: 'instagram', icon: 'Instagram' },
            { name: 'Twitter', platformId: 'twitter', icon: 'Twitter' },
            { name: 'LinkedIn', platformId: 'linkedin', icon: 'Linkedin' },
            { name: 'TikTok', platformId: 'tiktok', icon: 'Video' },
            { name: 'Pinterest', platformId: 'pinterest', icon: 'Image' },
            { name: 'Threads', platformId: 'threads', icon: 'MessageCircle' },
            { name: 'Bluesky', platformId: 'bluesky', icon: 'Cloud' },
            { name: 'YouTube', platformId: 'youtube', icon: 'Video' }
        ];

        const platformStatus = [];

        for (const platform of platforms) {
            try {
                // Query socialAccounts collection filtered by platform
                const q = query(
                    collection(db, "socialAccounts"),
                    where("platform", "==", platform.platformId),
                    where("status", "==", "active")
                );
                const accountsSnap = await getDocs(q);
                const accounts = [];

                accountsSnap.forEach(doc => {
                    const data = doc.data();
                    accounts.push({
                        id: doc.id,
                        name: data.name || data.username || data.pageName || data.displayName || 'Unknown',
                        expiresAt: data.tokenExpiresAt?.toDate ? data.tokenExpiresAt.toDate() : data.expiresAt?.toDate ? data.expiresAt.toDate() : null,
                        lastSync: data.lastSync?.toDate ? data.lastSync.toDate() : data.createdAt?.toDate ? data.createdAt.toDate() : new Date()
                    });
                });

                // Determine status based on token expiry
                let status = 'disconnected';
                let expiryWarning = null;

                if (accounts.length > 0) {
                    status = 'connected';

                    // Check for expiring tokens (within 7 days)
                    const now = new Date();
                    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

                    for (const account of accounts) {
                        if (account.expiresAt && account.expiresAt < sevenDaysFromNow) {
                            status = 'expiring';
                            const daysLeft = Math.ceil((account.expiresAt - now) / (1000 * 60 * 60 * 24));
                            expiryWarning = `${daysLeft} day${daysLeft !== 1 ? 's' : ''}`;
                            break;
                        }
                    }
                }

                platformStatus.push({
                    platform: platform.name,
                    icon: platform.icon,
                    status,
                    accountCount: accounts.length,
                    accounts: accounts.slice(0, 3), // Top 3 accounts
                    expiryWarning
                });
            } catch (e) {
                console.error(`Error fetching ${platform.name} accounts:`, e);
                // Platform might not have any accounts
                platformStatus.push({
                    platform: platform.name,
                    icon: platform.icon,
                    status: 'disconnected',
                    accountCount: 0,
                    accounts: []
                });
            }
        }

        return platformStatus;
    } catch (error) {
        console.error("Error fetching platform connectivity:", error);
        return [];
    }
}

// ============================================================================
// USER-SPECIFIC FUNCTIONS
// ============================================================================

/**
 * Get user's total posts
 */
async function getUserPosts(userId) {
    try {
        const platforms = ['facebook', 'instagram', 'twitter', 'linkedin', 'tiktok', 'pinterest', 'threads', 'bluesky', 'youtube'];

        let totalCount = 0;
        const platformBreakdown = {};

        await Promise.all(platforms.map(async (platform) => {
            try {
                const collectionName = `${platform}_posts`;
                const q = query(
                    collection(db, collectionName),
                    where("userId", "==", userId),
                    where("delete", "==", 0)
                );
                const snapshot = await getDocs(q);
                const count = snapshot.size;
                totalCount += count;
                if (count > 0) {
                    platformBreakdown[platform] = count;
                }
            } catch (e) {
                // Collection might not exist
            }
        }));

        return {
            total: totalCount,
            breakdown: platformBreakdown
        };
    } catch (error) {
        console.error("Error fetching user posts:", error);
        return { total: 0, breakdown: {} };
    }
}

/**
 * Get user's scheduled posts
 */
async function getUserScheduledPosts(userId) {
    try {
        const platforms = ['facebook', 'instagram', 'twitter', 'linkedin', 'tiktok', 'pinterest', 'threads', 'bluesky'];

        let totalCount = 0;

        await Promise.all(platforms.map(async (platform) => {
            try {
                const collectionName = `${platform}_posts`;
                const q = query(
                    collection(db, collectionName),
                    where("userId", "==", userId),
                    where("status", "==", "scheduled"),
                    where("delete", "==", 0)
                );
                const snapshot = await getDocs(q);
                totalCount += snapshot.size;
            } catch (e) {
                // Collection might not exist
            }
        }));

        return {
            total: totalCount
        };
    } catch (error) {
        console.error("Error fetching user scheduled posts:", error);
        return { total: 0 };
    }
}

/**
 * Get user's failed posts
 */
async function getUserFailedPosts(userId) {
    try {
        const platforms = ['facebook', 'instagram', 'twitter', 'linkedin', 'tiktok', 'pinterest', 'threads', 'bluesky'];

        let totalCount = 0;

        await Promise.all(platforms.map(async (platform) => {
            try {
                const collectionName = `${platform}_posts`;
                const q = query(
                    collection(db, collectionName),
                    where("userId", "==", userId),
                    where("status", "==", "failed"),
                    where("delete", "==", 0)
                );
                const snapshot = await getDocs(q);
                totalCount += snapshot.size;
            } catch (e) {
                // Collection might not exist
            }
        }));

        return {
            total: totalCount,
            message: totalCount > 0 ? "Review needed" : "All good"
        };
    } catch (error) {
        console.error("Error fetching user failed posts:", error);
        return { total: 0, message: "Unknown" };
    }
}

/**
 * Get user's media items and storage
 */
async function getUserMediaItems(userId) {
    try {
        const q = query(
            collection(db, "gallery"),
            where("userId", "==", userId)
        );
        const gallerySnap = await getDocs(q);
        const total = gallerySnap.size;

        // Calculate total storage
        let totalBytes = 0;
        gallerySnap.forEach(doc => {
            const data = doc.data();
            totalBytes += data.size || 0;
        });

        // Convert to appropriate unit
        let storageDisplay;
        if (totalBytes < 1024 * 1024) {
            storageDisplay = `${(totalBytes / 1024).toFixed(2)} KB`;
        } else if (totalBytes < 1024 * 1024 * 1024) {
            storageDisplay = `${(totalBytes / (1024 * 1024)).toFixed(2)} MB`;
        } else {
            storageDisplay = `${(totalBytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
        }

        return {
            total,
            storage: storageDisplay,
            storageBytes: totalBytes
        };
    } catch (error) {
        console.error("Error fetching user media items:", error);
        return { total: 0, storage: "0 KB", storageBytes: 0 };
    }
}

/**
 * Get user's subscription details
 */
async function getUserSubscription(userId) {
    try {
        const userDoc = await getDoc(doc(db, "users", userId));

        if (!userDoc.exists()) {
            return { plan: "Free", status: "inactive" };
        }

        const userData = userDoc.data();
        const subscription = userData.subscription;

        if (!subscription || !subscription.packageName) {
            return {
                plan: "Free",
                status: "inactive",
                limits: {
                    posts: 10,
                    storage: "1 GB"
                }
            };
        }

        return {
            plan: subscription.packageName,
            status: subscription.status || "active",
            billingCycle: subscription.billingCycle || "monthly",
            nextPayment: subscription.currentPeriodEnd?.toDate ? subscription.currentPeriodEnd.toDate().toISOString() : null,
            amount: subscription.amount || 0,
            currency: subscription.currency || "USD"
        };
    } catch (error) {
        console.error("Error fetching user subscription:", error);
        return { plan: "Free", status: "inactive" };
    }
}

/**
 * Get user's connected platforms
 */
async function getUserPlatforms(userId) {
    try {
        console.log('[getUserPlatforms] Fetching platforms for userId:', userId);

        const platforms = [
            { name: 'Facebook', platformId: 'facebook', icon: 'Facebook' },
            { name: 'Instagram', platformId: 'instagram', icon: 'Instagram' },
            { name: 'Twitter', platformId: 'twitter', icon: 'Twitter' },
            { name: 'LinkedIn', platformId: 'linkedin', icon: 'Linkedin' },
            { name: 'TikTok', platformId: 'tiktok', icon: 'Video' },
            { name: 'Pinterest', platformId: 'pinterest', icon: 'Image' },
            { name: 'Threads', platformId: 'threads', icon: 'MessageCircle' },
            { name: 'Bluesky', platformId: 'bluesky', icon: 'Cloud' },
            { name: 'YouTube', platformId: 'youtube', icon: 'Video' }
        ];

        const connectedPlatforms = [];

        for (const platform of platforms) {
            try {
                // Query socialAccounts collection filtered by userId and platform
                const q = query(
                    collection(db, "socialAccounts"),
                    where("userId", "==", userId),
                    where("platform", "==", platform.platformId),
                    where("status", "==", "active")
                );
                const accountsSnap = await getDocs(q);

                console.log(`[getUserPlatforms] ${platform.name}: Found ${accountsSnap.size} accounts`);

                if (!accountsSnap.empty) {
                    const accounts = [];
                    accountsSnap.forEach(doc => {
                        const data = doc.data();
                        console.log(`[getUserPlatforms] ${platform.name} account:`, {
                            id: doc.id,
                            name: data.name || data.username || data.pageName,
                            platform: data.platform,
                            status: data.status
                        });
                        accounts.push({
                            id: doc.id,
                            name: data.name || data.username || data.pageName || data.displayName || 'Unknown',
                            profilePicture: data.profilePicture || data.profileImage || null,
                            expiresAt: data.tokenExpiresAt?.toDate ? data.tokenExpiresAt.toDate() : data.expiresAt?.toDate ? data.expiresAt.toDate() : null,
                            lastSync: data.lastSync?.toDate ? data.lastSync.toDate() : data.createdAt?.toDate ? data.createdAt.toDate() : new Date()
                        });
                    });

                    // Determine status based on token expiry
                    let status = 'connected';
                    let expiryWarning = null;

                    // Check for expiring tokens (within 7 days)
                    const now = new Date();
                    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

                    for (const account of accounts) {
                        if (account.expiresAt && account.expiresAt < sevenDaysFromNow) {
                            status = 'expiring';
                            const daysLeft = Math.ceil((account.expiresAt - now) / (1000 * 60 * 60 * 24));
                            expiryWarning = `${daysLeft} day${daysLeft !== 1 ? 's' : ''}`;
                            break;
                        }
                    }

                    connectedPlatforms.push({
                        platform: platform.name,
                        icon: platform.icon,
                        status,
                        accountCount: accounts.length,
                        accounts,
                        expiryWarning
                    });
                }
            } catch (e) {
                console.error(`Error fetching ${platform.name} for user ${userId}:`, e);
            }
        }

        console.log('[getUserPlatforms] Total connected platforms:', connectedPlatforms.length);
        console.log('[getUserPlatforms] Platforms:', connectedPlatforms.map(p => `${p.platform} (${p.accountCount})`));

        return connectedPlatforms;
    } catch (error) {
        console.error("Error fetching user platforms:", error);
        return [];
    }
}



// ============================================================================
// SHARED FUNCTIONS
// ============================================================================

/**
 * Get recent activity (system-wide for admin, user-specific for users)
 */
async function getRecentActivity(limitCount = 10, isAdmin = false, userId = null) {
    try {
        // For now, we'll create mock activity data
        // TODO: Implement actual activity logging system

        const activities = [];

        // This would be replaced with actual activity_logs collection queries
        // For now, returning empty array until activity logging is implemented

        return activities;
    } catch (error) {
        console.error("Error fetching recent activity:", error);
        return [];
    }
}
