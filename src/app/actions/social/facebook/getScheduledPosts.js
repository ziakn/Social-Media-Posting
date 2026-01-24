// app/actions/social/facebook/getScheduledPosts.js
"use server";

import { db } from "@/lib/firebase";
import { collection, query, where, orderBy, getDocs, limit, startAfter, doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";
import { fetchFacebookPages } from "./getPages";
export async function getScheduledPosts({
    pageSize = 12,
    lastDocId = null,
    filters = {},
    status = "scheduled" // 'scheduled', 'paused', 'draft'
} = {}) {
    try {
        const user = await verifyToken();
        if (!user) {
            return { success: false, message: "Invalid token" };
        }

        // Build base query - only get posts with scheduledAt in future
        const now = new Date();

        let constraints = [
            where("userId", "==", user.id),
            where("scheduledAt", ">=", now), // Only future scheduled posts
            orderBy("scheduledAt", "asc"),
            limit(pageSize + 1)
        ];

        // Apply status filter if provided
        if (status && status !== 'all') {
            constraints.unshift(where("status", "==", status));
        }

        // Apply post type filter
        if (filters.postType && filters.postType !== 'all') {
            constraints.unshift(where("postType", "==", filters.postType));
        }

        // Apply page filter
        if (filters.pageId) {
            constraints.unshift(where("pageId", "==", filters.pageId));
        }

        let q = query(collection(db, "facebook_posts"), ...constraints);

        // Add cursor for pagination
        if (lastDocId) {
            const lastDocRef = doc(db, "facebook_posts", lastDocId);
            const lastDocSnap = await getDoc(lastDocRef);
            if (lastDocSnap.exists()) {
                constraints.pop(); // Remove limit
                constraints.push(startAfter(lastDocSnap));
                constraints.push(limit(pageSize + 1));
                q = query(collection(db, "facebook_posts"), ...constraints);
            }
        }

        const snapshot = await getDocs(q);

        // Determine if more pages exist
        const hasMore = snapshot.docs.length > pageSize;
        const docsToProcess = snapshot.docs.slice(0, pageSize);

        const posts = await Promise.all(docsToProcess.map(async (docSnap) => {
            const data = docSnap.data();

            // Get page details
            let pageName = "Unknown Page";
            let pageProfilePicture = null;

            try {
                const socialAccountsQuery = query(
                    collection(db, "socialAccounts"),
                    where("userId", "==", user.id),
                    where("platform", "==", "facebook")
                );

                const socialAccountsSnapshot = await getDocs(socialAccountsQuery);

                for (const accountDoc of socialAccountsSnapshot.docs) {
                    const accountData = accountDoc.data();
                    if (accountData.pages?.length) {
                        const page = accountData.pages.find(p => p.pageId === data.pageId);
                        if (page) {
                            pageName = page.pageName;
                            pageProfilePicture = page.profilePicture;
                            break;
                        }
                    }
                }
            } catch (error) {
                console.error("Error fetching page details:", error);
            }

            // Determine post type for display
            let postType = data.postType || 'text';
            if (data.mediaUrls && data.mediaUrls.length > 0) {
                const firstMedia = data.mediaUrls[0];
                if (firstMedia.type?.startsWith('video/')) {
                    postType = 'video';
                } else if (data.mediaUrls.length > 1) {
                    postType = 'carousel';
                } else {
                    postType = 'photo';
                }
            }

            return {
                id: docSnap.id,
                ...data,
                postType,
                pageName,
                pageProfilePicture,
                // Expected metrics based on previous performance or default
                metrics: {
                    expectedReach: data.expectedReach || 10000,
                    previousEngagement: data.previousEngagement || 4.5
                },
                // Serialize Firestore Timestamps
                scheduledAt: data.scheduledAt?.toDate?.()?.toISOString() || data.scheduledAt,
                createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
                updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
                publishedAt: data.publishedAt?.toDate?.()?.toISOString() || data.publishedAt,
                analyticsFetchedAt: data.analyticsFetchedAt?.toDate?.()?.toISOString() || data.analyticsFetchedAt,
                delete: data.delete || 0
            };
        }));

        // Filter out deleted posts
        const activePosts = posts.filter(p => p.delete !== 1);

        const lastVisible = posts.length > 0 ? posts[posts.length - 1].id : null;

        return {
            success: true,
            posts: activePosts,
            pagination: {
                hasMore,
                lastVisible,
                count: activePosts.length,
                total: snapshot.size
            }
        };
    } catch (err) {
        console.error("Error fetching scheduled posts:", err);
        return {
            success: false,
            message: err.message || "Failed to fetch scheduled posts",
            posts: [],
            pagination: { hasMore: false, lastVisible: null, count: 0 }
        };
    }
}

// Additional actions for managing scheduled posts

export async function updateScheduledPost(postId, updates) {
    try {
        const user = await verifyToken();
        if (!user) {
            return { success: false, message: "Invalid token" };
        }

        const postRef = doc(db, "facebook_posts", postId);

        // Verify post belongs to user
        const postSnap = await getDoc(postRef);
        if (!postSnap.exists() || postSnap.data().userId !== user.id) {
            return { success: false, message: "Post not found or unauthorized" };
        }

        const postData = postSnap.data();
        if (postData.delete === 1) {
            return { success: false, message: "Cannot edit deleted post" };
        }

        // If message is being updated and post is scheduled on Facebook, update it there too
        if (updates.message && postData.facebookPostId && postData.pageId) {
            try {
                const { pages } = await fetchFacebookPages();
                const page = pages.find(p => p.pageId === postData.pageId);

                if (page && page.accessToken) {
                    await fetch(`https://graph.facebook.com/${postData.facebookPostId}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            message: updates.message,
                            access_token: page.accessToken
                        })
                    });
                }
            } catch (fbError) {
                console.error("Failed to update scheduled post on Facebook:", fbError);
                // Continue to update local DB
            }
        }

        await updateDoc(postRef, {
            ...updates,
            updatedAt: new Date()
        });

        return { success: true, message: "Post updated successfully" };
    } catch (error) {
        console.error("Error updating scheduled post:", error);
        return { success: false, message: error.message };
    }
}

export async function deleteScheduledPost(postId) {
    try {
        const user = await verifyToken();
        if (!user) {
            return { success: false, message: "Invalid token" };
        }

        const postRef = doc(db, "facebook_posts", postId);

        // Verify post belongs to user
        const postSnap = await getDoc(postRef);
        if (!postSnap.exists() || postSnap.data().userId !== user.id) {
            return { success: false, message: "Post not found or unauthorized" };
        }

        // If it sends a facebookPostId, delete from Facebook
        const postData = postSnap.data();
        if (postData.facebookPostId && postData.pageId) {
            try {
                const { pages } = await fetchFacebookPages();
                const page = pages.find(p => p.pageId === postData.pageId);

                if (page && page.accessToken) {
                    await fetch(`https://graph.facebook.com/${postData.facebookPostId}?access_token=${page.accessToken}`, {
                        method: 'DELETE',
                    });
                }
            } catch (fbError) {
                console.error("Failed to delete scheduled post from Facebook:", fbError);
            }
        }

        // Soft delete
        await updateDoc(postRef, {
            delete: 1,
            updatedAt: new Date()
        });

        // await deleteDoc(postRef); // OLD HARD DELETE

        return { success: true, message: "Post deleted successfully" };
    } catch (error) {
        console.error("Error deleting scheduled post:", error);
        return { success: false, message: error.message };
    }
}

export async function togglePostStatus(postId, currentStatus) {
    try {
        const user = await verifyToken();
        if (!user) {
            return { success: false, message: "Invalid token" };
        }

        const postRef = doc(db, "facebook_posts", postId);

        // Verify post belongs to user
        const postSnap = await getDoc(postRef);
        if (!postSnap.exists() || postSnap.data().userId !== user.id) {
            return { success: false, message: "Post not found or unauthorized" };
        }

        const newStatus = currentStatus === 'scheduled' ? 'paused' : 'scheduled';

        await updateDoc(postRef, {
            status: newStatus,
            updatedAt: new Date()
        });

        return {
            success: true,
            message: `Post ${newStatus === 'scheduled' ? 'resumed' : 'paused'}`,
            newStatus
        };
    } catch (error) {
        console.error("Error toggling post status:", error);
        return { success: false, message: error.message };
    }
}

export async function reschedulePost(postId, newScheduledAt) {
    try {
        const user = await verifyToken();
        if (!user) {
            return { success: false, message: "Invalid token" };
        }

        const postRef = doc(db, "facebook_posts", postId);

        // Verify post belongs to user
        const postSnap = await getDoc(postRef);
        if (!postSnap.exists() || postSnap.data().userId !== user.id) {
            return { success: false, message: "Post not found or unauthorized" };
        }

        await updateDoc(postRef, {
            scheduledAt: new Date(newScheduledAt),
            updatedAt: new Date()
        });

        return { success: true, message: "Post rescheduled successfully" };
    } catch (error) {
        console.error("Error rescheduling post:", error);
        return { success: false, message: error.message };
    }
}