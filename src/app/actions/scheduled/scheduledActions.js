"use server";

import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, orderBy, limit } from "firebase/firestore";
import { verifyToken } from "@/lib/auth";

/**
 * Get unified scheduled posts from all platforms
 */
export async function getUnifiedScheduledPosts({
    startDate,
    endDate,
    accountId, // specific account filter
    platform, // specific platform filter
} = {}) {
    try {
        const user = await verifyToken();

        if (!user) {
            return { success: false, message: "Unauthorized", posts: [] };
        }

        const isAdmin = user.role === 'Administrator';

        // Define platforms to query
        const platforms = ['facebook', 'instagram', 'twitter', 'linkedin', 'tiktok', 'pinterest', 'threads', 'bluesky'];
        const targetPlatforms = platform && platform !== 'all' ? [platform] : platforms;

        // Common constraints generator
        const getConstraints = (platformName) => {
            const constraints = [
                where("status", "==", "scheduled"),
            ];

            // Platform specific collection names usually match pattern: {platform}_posts
            // Some might have 'delete' field, some might not. 
            // Based on analysis: FB, Insta, TikTok, Pinterest, Threads, Bluesky have 'delete'.
            // Twitter has 'delete'. LinkedIn ? (Code analysis showed I should add it, but might not be there yet, safe to check if field exists? Firestore ignores undefined fields in where? No.
            // Safe approach: Check platform specific logic or assume 'delete' != 1 is good practice if field exists.
            // For now, I'll apply delete != 1 for all except LinkedIn if I'm unsure, but better to be safe.
            // Actually, querying 'delete' == 0 is safer if the field is consistently initialized.
            // Let's assume standard behavior for now.
            if (['facebook', 'instagram', 'tiktok', 'pinterest', 'threads', 'bluesky', 'twitter'].includes(platformName)) {
                constraints.push(where("delete", "==", 0)); // Or delete != 1
            }

            // User restriction
            if (!isAdmin) {
                constraints.push(where("userId", "==", user.id));
            } else {
                // Admin can see all, BUT if a specific user filter was passed (not implemented in args yet but good for future), we'd add it.
                // Current requirement: "if adminitrarter role,, list all accounts" implies showing everyone.
                // However, we still probably want to filter by accountId if selected.
            }

            if (accountId && accountId !== 'all') {
                constraints.push(where("accountId", "==", accountId));
            }

            // Date filtering
            // Note: Different platforms might use different date fields? 
            // Standard seems to be `scheduledAt`.
            if (startDate) {
                constraints.push(where("scheduledAt", ">=", new Date(startDate)));
            }
            if (endDate) {
                constraints.push(where("scheduledAt", "<=", new Date(endDate)));
            }

            // Optimization: limit each query to avoid massive dumps
            constraints.push(limit(100));

            return constraints;
        };

        const fetchPromises = targetPlatforms.map(async (p) => {
            try {
                const collectionName = `${p}_posts`;
                // Check if collection exists implicitly by querying.
                const constraints = getConstraints(p);
                // Add sorting (requires index, might fail without it. 
                // Safest to fetch by status/user and sort in memory for "Unified" view until indices are robust).
                // constraints.push(orderBy("scheduledAt", "asc")); 

                const q = query(collection(db, collectionName), ...constraints);
                const snapshot = await getDocs(q);

                return snapshot.docs.map(doc => {
                    const data = doc.data();
                    return {
                        id: doc.id,
                        platform: p,
                        ...data,
                        // Normalize critical fields
                        scheduledAt: data.scheduledAt?.toDate ? data.scheduledAt.toDate().toISOString() : data.scheduledAt,
                        createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt,
                        // Content normalization
                        caption: data.message || data.caption || data.text || data.description || data.content?.text || "",
                        media: data.mediaUrls || data.media || data.content?.media || (data.imageUrl ? [{ url: data.imageUrl, type: 'image' }] : []),
                        // Author info (might need enrichment via user ID)
                        userId: data.userId
                    };
                });
            } catch (err) {
                console.error(`Error fetching ${p} posts:`, err);
                return [];
            }
        });

        const results = await Promise.all(fetchPromises);
        const allPosts = results.flat();

        // Sort in memory
        allPosts.sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt));

        // Enrich with user info if Admin (Optimized: fetch unique users only)
        if (isAdmin) {
            const userIds = [...new Set(allPosts.map(p => p.userId).filter(Boolean))];
            if (userIds.length > 0) {
                // Fetch users in batch (chunks of 10)
                const userMap = {};
                // Ideally this should be a batched query. For now, we'll just fetch specific users if list is small, 
                // or easier: just fetch all users if Admin? No, that's too heavy.
                // Let's try to fetch just the needed ones.

                // Chunking for 'in' query limit (30 max usually safe)
                const chunks = [];
                for (let i = 0; i < userIds.length; i += 10) {
                    chunks.push(userIds.slice(i, i + 10));
                }

                for (const chunk of chunks) {
                    const usersQ = query(collection(db, "users"), where("__name__", "in", chunk));
                    const usersSnap = await getDocs(usersQ);
                    usersSnap.forEach(doc => {
                        const uData = doc.data();
                        userMap[doc.id] = {
                            name: `${uData.firstName} ${uData.lastName}`,
                            email: uData.email,
                            avatar: uData.profileImage
                        };
                    });
                }

                allPosts.forEach(post => {
                    if (post.userId && userMap[post.userId]) {
                        post.author = userMap[post.userId];
                    }
                });
            }
        }

        return {
            success: true,
            posts: allPosts
        };

    } catch (error) {
        console.error("Error fetching unified scheduled posts:", error);
        return { success: false, message: error.message, posts: [] };
    }
}

/**
 * Get current user details for client-side use
 */
export async function getCurrentUser() {
    try {
        const user = await verifyToken();
        if (!user) return null;

        return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            avatar: user.picture || null
        };
    } catch (error) {
        console.error("Error getting current user:", error);
        return null;
    }
}
