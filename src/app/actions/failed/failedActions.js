"use server";

import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, limit, doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { verifyToken } from "@/lib/auth";

/**
 * Get failed posts from all platforms
 */
export async function getFailedPosts({
    platform,
    searchQuery,
    pageSize = 50
} = {}) {
    try {
        const user = await verifyToken();

        if (!user) {
            return { success: false, message: "Unauthorized", posts: [] };
        }

        const isAdmin = user.role === 'Administrator';

        const platforms = ['facebook', 'instagram', 'twitter', 'linkedin', 'tiktok', 'pinterest', 'threads', 'bluesky'];
        const targetPlatforms = platform && platform !== 'all' ? [platform] : platforms;

        const fetchPromises = targetPlatforms.map(async (p) => {
            try {
                const collectionName = `${p}_posts`;
                const constraints = [
                    where("status", "==", "failed"),
                ];

                // User restriction
                if (!isAdmin) {
                    constraints.push(where("userId", "==", user.id));
                }

                constraints.push(limit(pageSize));

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
                    }

                    return {
                        id: docSnap.id,
                        platform: p,
                        ...data,
                        scheduledAt: data.scheduledAt?.toDate ? data.scheduledAt.toDate().toISOString() : data.scheduledAt,
                        createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt,
                        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : data.updatedAt,
                        failedAt: data.failedAt?.toDate ? data.failedAt.toDate().toISOString() : data.failedAt,
                        caption: data.message || data.caption || data.text || data.description || data.content?.text || "",
                        media: mediaUrls.length > 0 ? mediaUrls : (data.imageUrl ? [{ url: data.imageUrl, type: 'image' }] : []),
                        postType: detectedPostType,
                        errorMessage: data.errorMessage || data.error || "Unknown error",
                        userId: data.userId
                    };
                });
            } catch (err) {
                console.error(`Error fetching ${p} failed posts:`, err);
                return [];
            }
        });

        const results = await Promise.all(fetchPromises);
        let allPosts = results.flat();

        // Search filter
        if (searchQuery && searchQuery.trim()) {
            const q = searchQuery.toLowerCase().trim();
            allPosts = allPosts.filter(post =>
                post.caption?.toLowerCase().includes(q) ||
                post.errorMessage?.toLowerCase().includes(q)
            );
        }

        // Sort by most recent failure
        allPosts.sort((a, b) => new Date(b.failedAt || b.updatedAt || b.createdAt) - new Date(a.failedAt || a.updatedAt || a.createdAt));

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

        return {
            success: true,
            posts: allPosts,
            total: allPosts.length
        };

    } catch (error) {
        console.error("Error fetching failed posts:", error);
        return { success: false, message: error.message, posts: [] };
    }
}

/**
 * Retry a failed post - resets status to scheduled
 */
export async function retryFailedPost(postId, platform, newScheduledAt = null) {
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

        if (user.role !== 'Administrator' && postData.userId !== user.id) {
            return { success: false, message: "Access denied" };
        }

        // Set scheduled time to provided time or 5 minutes from now
        const scheduledAt = newScheduledAt ? new Date(newScheduledAt) : new Date(Date.now() + 5 * 60 * 1000);

        await updateDoc(postRef, {
            status: "scheduled",
            scheduledAt,
            errorMessage: null,
            failedAt: null,
            retryCount: (postData.retryCount || 0) + 1,
            updatedAt: serverTimestamp()
        });

        return { success: true, message: "Post scheduled for retry" };
    } catch (error) {
        console.error("Error retrying failed post:", error);
        return { success: false, message: error.message };
    }
}

/**
 * Delete a failed post (soft delete)
 */
export async function deleteFailedPost(postId, platform) {
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
        console.error("Error deleting failed post:", error);
        return { success: false, message: error.message };
    }
}
