"use server";

import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, orderBy, limit, startAfter, doc, getDoc, deleteDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { verifyToken } from "@/lib/auth";

/**
 * Get unified scheduled posts from all platforms with enhanced features
 * @param {Object} options - Query options
 * @param {string} options.platform - Platform filter ('all' or specific platform)
 * @param {string} options.startDate - Start date ISO string
 * @param {string} options.endDate - End date ISO string
 * @param {string} options.accountId - Specific account filter
 * @param {string} options.postType - Post type filter ('all', 'text', 'image', 'video')
 * @param {string} options.searchQuery - Search term for caption/message
 * @param {number} options.pageSize - Number of posts per page (default 20)
 * @param {string} options.cursor - Cursor for pagination (post ID to start after)
 */
export async function getUnifiedScheduledPosts({
    startDate,
    endDate,
    accountId,
    platform,
    postType,
    searchQuery,
    pageSize = 20,
    cursor
} = {}) {
    try {
        const user = await verifyToken();

        if (!user) {
            return { success: false, message: "Unauthorized", posts: [], hasMore: false };
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

            // Soft delete filter
            if (['facebook', 'instagram', 'tiktok', 'pinterest', 'threads', 'bluesky', 'twitter'].includes(platformName)) {
                constraints.push(where("delete", "==", 0));
            }

            // User restriction (non-admins see only their own posts)
            if (!isAdmin) {
                constraints.push(where("userId", "==", user.id));
            }

            // Account filter
            if (accountId && accountId !== 'all') {
                constraints.push(where("accountId", "==", accountId));
            }

            // Date filtering
            if (startDate) {
                constraints.push(where("scheduledAt", ">=", new Date(startDate)));
            }
            if (endDate) {
                constraints.push(where("scheduledAt", "<=", new Date(endDate)));
            }

            // Fetch more than pageSize to allow for client-side filtering (search, postType)
            // This is a trade-off since Firestore doesn't support full-text search
            constraints.push(limit(100));

            return constraints;
        };

        const fetchPromises = targetPlatforms.map(async (p) => {
            try {
                const collectionName = `${p}_posts`;
                const constraints = getConstraints(p);
                const q = query(collection(db, collectionName), ...constraints);
                const snapshot = await getDocs(q);

                return snapshot.docs.map(docSnap => {
                    const data = docSnap.data();

                    // Determine post type
                    let detectedPostType = 'text';
                    const mediaUrls = data.mediaUrls || data.media || data.content?.media || [];
                    if (mediaUrls.length > 0) {
                        const firstMedia = mediaUrls[0];
                        if (firstMedia?.type?.includes('video') || firstMedia?.mediaType === 'video') {
                            detectedPostType = 'video';
                        } else {
                            detectedPostType = 'image';
                        }
                    } else if (data.imageUrl || data.videoUrl) {
                        detectedPostType = data.videoUrl ? 'video' : 'image';
                    }

                    return {
                        id: docSnap.id,
                        platform: p,
                        ...data,
                        // Normalize critical fields
                        scheduledAt: data.scheduledAt?.toDate ? data.scheduledAt.toDate().toISOString() : data.scheduledAt,
                        createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt,
                        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : data.updatedAt,
                        // Content normalization
                        caption: data.message || data.caption || data.text || data.description || data.content?.text || "",
                        media: mediaUrls.length > 0 ? mediaUrls : (data.imageUrl ? [{ url: data.imageUrl, type: 'image' }] : []),
                        postType: detectedPostType,
                        // Account and author info
                        accountId: data.accountId,
                        userId: data.userId
                    };
                });
            } catch (err) {
                console.error(`Error fetching ${p} posts:`, err);
                return [];
            }
        });

        const results = await Promise.all(fetchPromises);
        let allPosts = results.flat();

        // Client-side filtering (since Firestore doesn't support full-text search)

        // Post type filter
        if (postType && postType !== 'all') {
            allPosts = allPosts.filter(post => post.postType === postType);
        }

        // Search filter (case-insensitive)
        if (searchQuery && searchQuery.trim()) {
            const query = searchQuery.toLowerCase().trim();
            allPosts = allPosts.filter(post =>
                post.caption?.toLowerCase().includes(query) ||
                post.message?.toLowerCase().includes(query) ||
                post.accountName?.toLowerCase().includes(query)
            );
        }

        // Sort by scheduled date (earliest first)
        allPosts.sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt));

        // Collect unique account IDs for enrichment
        const accountIds = [...new Set(allPosts.map(p => p.accountId).filter(Boolean))];
        const accountMap = {};

        // Fetch account details for each platform
        if (accountIds.length > 0) {
            const accountCollections = [
                'facebook_accounts', 'instagram_accounts', 'twitter_accounts',
                'linkedin_accounts', 'tiktok_accounts', 'pinterest_accounts',
                'threads_accounts', 'bluesky_accounts'
            ];

            for (const colName of accountCollections) {
                try {
                    // Fetch accounts that match our IDs
                    const accountsQ = query(
                        collection(db, colName),
                        where("accountId", "in", accountIds.slice(0, 10)) // Firestore 'in' limit
                    );
                    const accountsSnap = await getDocs(accountsQ);
                    accountsSnap.forEach(doc => {
                        const acc = doc.data();
                        accountMap[acc.accountId] = {
                            id: doc.id,
                            name: acc.name || acc.username || acc.pageName || acc.displayName || "Unknown",
                            username: acc.username || acc.handle || acc.screenName || "",
                            profilePicture: acc.profilePicture || acc.profileImage || acc.picture || acc.avatar || null,
                            platform: colName.replace('_accounts', '')
                        };
                    });
                } catch (e) {
                    // Collection might not exist for some platforms
                }
            }
        }

        // Enrich posts with account info
        allPosts.forEach(post => {
            if (post.accountId && accountMap[post.accountId]) {
                post.account = accountMap[post.accountId];
            }
        });

        // Enrich with user info if Admin
        if (isAdmin) {
            const userIds = [...new Set(allPosts.map(p => p.userId).filter(Boolean))];
            if (userIds.length > 0) {
                const userMap = {};
                const chunks = [];
                for (let i = 0; i < userIds.length; i += 10) {
                    chunks.push(userIds.slice(i, i + 10));
                }

                for (const chunk of chunks) {
                    try {
                        const usersQ = query(collection(db, "users"), where("__name__", "in", chunk));
                        const usersSnap = await getDocs(usersQ);
                        usersSnap.forEach(doc => {
                            const uData = doc.data();
                            userMap[doc.id] = {
                                name: uData.name || `${uData.firstName || ''} ${uData.lastName || ''}`.trim() || "User",
                                email: uData.email,
                                avatar: uData.profileImage || uData.picture
                            };
                        });
                    } catch (e) {
                        console.error("Error fetching users:", e);
                    }
                }

                allPosts.forEach(post => {
                    if (post.userId && userMap[post.userId]) {
                        post.author = userMap[post.userId];
                    }
                });
            }
        }

        // Pagination: find cursor position and slice
        let startIndex = 0;
        if (cursor) {
            const cursorIndex = allPosts.findIndex(p => p.id === cursor);
            if (cursorIndex !== -1) {
                startIndex = cursorIndex + 1;
            }
        }

        const paginatedPosts = allPosts.slice(startIndex, startIndex + pageSize);
        const hasMore = startIndex + pageSize < allPosts.length;
        const nextCursor = paginatedPosts.length > 0 ? paginatedPosts[paginatedPosts.length - 1].id : null;

        return {
            success: true,
            posts: paginatedPosts,
            hasMore,
            nextCursor,
            total: allPosts.length
        };

    } catch (error) {
        console.error("Error fetching unified scheduled posts:", error);
        return { success: false, message: error.message, posts: [], hasMore: false };
    }
}

/**
 * Delete a scheduled post from any platform
 */
export async function deleteScheduledPost(postId, platform) {
    try {
        const user = await verifyToken();
        if (!user) {
            return { success: false, message: "Unauthorized" };
        }

        const collectionName = `${platform}_posts`;
        const postRef = doc(db, collectionName, postId);
        const postSnap = await getDoc(postRef);

        if (!postSnap.exists()) {
            return { success: false, message: "Post not found" };
        }

        const postData = postSnap.data();

        // Authorization check
        if (user.role !== 'Administrator' && postData.userId !== user.id) {
            return { success: false, message: "Access denied" };
        }

        // Soft delete
        await updateDoc(postRef, {
            delete: 1,
            status: "deleted",
            deletedAt: serverTimestamp(),
            deletedBy: user.id
        });

        return { success: true, message: "Post deleted successfully" };
    } catch (error) {
        console.error("Error deleting scheduled post:", error);
        return { success: false, message: error.message };
    }
}

/**
 * Update a scheduled post's content
 */
export async function updateScheduledPostContent(postId, platform, newContent) {
    try {
        const user = await verifyToken();
        if (!user) {
            return { success: false, message: "Unauthorized" };
        }

        const collectionName = `${platform}_posts`;
        const postRef = doc(db, collectionName, postId);
        const postSnap = await getDoc(postRef);

        if (!postSnap.exists()) {
            return { success: false, message: "Post not found" };
        }

        const postData = postSnap.data();

        // Authorization check
        if (user.role !== 'Administrator' && postData.userId !== user.id) {
            return { success: false, message: "Access denied" };
        }

        // Determine the correct field name for this platform's content
        const contentField = postData.message !== undefined ? 'message' :
            postData.caption !== undefined ? 'caption' :
                postData.text !== undefined ? 'text' :
                    postData.description !== undefined ? 'description' : 'message';

        await updateDoc(postRef, {
            [contentField]: newContent,
            updatedAt: serverTimestamp()
        });

        return { success: true, message: "Post updated successfully" };
    } catch (error) {
        console.error("Error updating scheduled post:", error);
        return { success: false, message: error.message };
    }
}

/**
 * Reschedule a post to a new date/time (must be in the future)
 */
export async function reschedulePost(postId, platform, newScheduledAt) {
    try {
        const user = await verifyToken();
        if (!user) {
            return { success: false, message: "Unauthorized" };
        }

        // Validate that the new date is in the future
        const newDate = new Date(newScheduledAt);
        const now = new Date();
        if (newDate <= now) {
            return { success: false, message: "Scheduled time must be in the future" };
        }

        const collectionName = `${platform}_posts`;
        const postRef = doc(db, collectionName, postId);
        const postSnap = await getDoc(postRef);

        if (!postSnap.exists()) {
            return { success: false, message: "Post not found" };
        }

        const postData = postSnap.data();

        // Authorization check
        if (user.role !== 'Administrator' && postData.userId !== user.id) {
            return { success: false, message: "Access denied" };
        }


        await updateDoc(postRef, {
            scheduledAt: new Date(newScheduledAt),
            updatedAt: serverTimestamp()
        });

        return { success: true, message: "Post rescheduled successfully" };
    } catch (error) {
        console.error("Error rescheduling post:", error);
        return { success: false, message: error.message };
    }
}

/**
 * Get all connected social accounts for the current user
 */
export async function getAllConnectedAccounts() {
    try {
        const user = await verifyToken();
        if (!user) {
            return { success: false, accounts: [] };
        }

        const isAdmin = user.role === 'Administrator';
        const accountCollections = [
            { name: 'facebook_accounts', platform: 'facebook' },
            { name: 'instagram_accounts', platform: 'instagram' },
            { name: 'twitter_accounts', platform: 'twitter' },
            { name: 'linkedin_accounts', platform: 'linkedin' },
            { name: 'tiktok_accounts', platform: 'tiktok' },
            { name: 'pinterest_accounts', platform: 'pinterest' },
            { name: 'threads_accounts', platform: 'threads' },
            { name: 'bluesky_accounts', platform: 'bluesky' }
        ];

        const allAccounts = [];

        for (const col of accountCollections) {
            try {
                let q;
                if (isAdmin) {
                    q = query(collection(db, col.name), limit(50));
                } else {
                    q = query(collection(db, col.name), where("userId", "==", user.id));
                }

                const snap = await getDocs(q);
                snap.forEach(doc => {
                    const data = doc.data();
                    allAccounts.push({
                        id: doc.id,
                        accountId: data.accountId || doc.id,
                        platform: col.platform,
                        name: data.name || data.username || data.pageName || data.displayName || "Account",
                        username: data.username || data.handle || data.screenName || "",
                        profilePicture: data.profilePicture || data.profileImage || data.picture || null,
                        userId: data.userId
                    });
                });
            } catch (e) {
                // Collection might not exist
            }
        }

        return { success: true, accounts: allAccounts };
    } catch (error) {
        console.error("Error fetching connected accounts:", error);
        return { success: false, accounts: [] };
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
