// app/actions/social/facebook/facebookPostsActions.js
"use server";

import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  limit,
  startAfter,
  doc,
  getDoc,
  updateDoc,
  deleteDoc
} from "firebase/firestore";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { fetchFacebookPages } from "./getPages";

// Get user's Facebook pages for filtering
export async function getUserFacebookPages() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    const user = await verifyToken(token);
    if (!user) {
      return { success: false, message: "Invalid token" };
    }

    const socialAccountsQuery = query(
      collection(db, "socialAccounts"),
      where("userId", "==", user.id),
      where("platform", "==", "facebook")
    );

    const socialAccountsSnapshot = await getDocs(socialAccountsQuery);

    const pages = [];
    socialAccountsSnapshot.forEach((accountDoc) => {
      const accountData = accountDoc.data();
      if (accountData.pages?.length) {
        pages.push(...accountData.pages.map(page => ({
          pageId: page.pageId,
          pageName: page.pageName,
          profilePicture: page.profilePicture,
          category: page.category,
          fans: page.fans
        })));
      }
    });

    return {
      success: true,
      pages: pages.sort((a, b) => a.pageName.localeCompare(b.pageName))
    };
  } catch (err) {
    console.error("Error fetching Facebook pages:", err);
    return { success: false, message: err.message };
  }
}

// Enhanced getFacebookPosts with more filters
export async function getFacebookPosts({
  pageSize = 12,
  lastDocId = null,
  filters = {},
  sortBy = "createdAt_desc"
} = {}) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    const user = await verifyToken(token);
    if (!user) {
      return { success: false, message: "Invalid token" };
    }

    // Build base query
    let constraints = [
      where("userId", "==", user.id),
      limit(pageSize + 1)
    ];

    // Apply sorting
    let sortField = "createdAt";
    let sortDirection = "desc";

    if (sortBy === "newest") {
      sortField = "createdAt";
      sortDirection = "desc";
    } else if (sortBy === "oldest") {
      sortField = "createdAt";
      sortDirection = "asc";
    } else if (sortBy === "engagement_high") {
      sortField = "metrics.engagements";
      sortDirection = "desc";
    } else if (sortBy === "engagement_low") {
      sortField = "metrics.engagements";
      sortDirection = "asc";
    } else if (sortBy === "reach_high") {
      sortField = "metrics.reach";
      sortDirection = "desc";
    } else if (sortBy === "reach_low") {
      sortField = "metrics.reach";
      sortDirection = "asc";
    } else if (sortBy === "scheduled") {
      sortField = "scheduledAt";
      sortDirection = "asc";
    }

    constraints.push(orderBy(sortField, sortDirection));

    // Apply filters
    if (filters.postType && filters.postType !== 'all') {
      constraints.unshift(where("postType", "==", filters.postType));
    }

    if (filters.status && filters.status !== 'all') {
      if (filters.status === 'published') {
        constraints.unshift(where("status", "==", "published"));
      } else if (filters.status === 'scheduled') {
        constraints.unshift(where("scheduledAt", ">", new Date()));
      } else if (filters.status === 'draft') {
        constraints.unshift(where("status", "==", "draft"));
      }
    }

    if (filters.startDate) {
      constraints.unshift(where("createdAt", ">=", new Date(filters.startDate)));
    }

    if (filters.endDate) {
      constraints.unshift(where("createdAt", "<=", new Date(filters.endDate)));
    }

    if (filters.pageId && filters.pageId !== 'all') {
      constraints.unshift(where("pageId", "==", filters.pageId));
    }

    if (filters.minEngagementRate) {
      constraints.unshift(where("metrics.engagementRate", ">=", parseFloat(filters.minEngagementRate)));
    }

    // Filter out deleted posts logic (application level or if possible query level)
    // Since existing posts might not have 'deleted' field, we can't easily query using != 1 without an index or backfill.
    // We will filter efficiently in memory after fetching or try to use a constraint if possible.
    // For now, let's just fetch and filter in memory as it's safer without migration.
    // However, to avoid messing up pagination, we should ideally use a query.
    // Let's rely on the client side not showing them or filter here. 
    // To be safe with pagination, we'll try to filter here but it might affect page size.
    // Better approach: Since 'deleted' is a new field, we can't query on it for old docs.
    // So we will filter in the map loop.

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
      let pageCategory = null;
      let pageFans = 0;

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
              pageCategory = page.category;
              pageFans = page.fans || 0;
              break;
            }
          }
        }
      } catch (error) {
        console.error("Error fetching page details:", error);
      }

      // Calculate engagement rate
      const reach = data.metrics?.reach || 1;
      const engagements = data.metrics?.engagements ||
        (data.metrics?.likes || 0) +
        (data.metrics?.comments || 0) +
        (data.metrics?.shares || 0);
      const engagementRate = ((engagements / reach) * 100).toFixed(1);

      // Determine post type for display
      let postType = data.postType || 'text';
      if (data.mediaUrls && data.mediaUrls.length > 0) {
        const firstMedia = data.mediaUrls[0];
        if (firstMedia.type?.startsWith('video/')) {
          postType = 'video';
        } else if (data.mediaUrls.length > 1) {
          postType = 'carousel';
        } else if (firstMedia.type?.startsWith('image/')) {
          postType = 'image';
        }
      }

      return {
        id: docSnap.id,
        ...data,
        postType,
        pageName,
        pageProfilePicture,
        pageCategory,
        pageFans,
        metrics: {
          reach: data.metrics?.reach || 0,
          likes: data.metrics?.likes || 0,
          comments: data.metrics?.comments || 0,
          shares: data.metrics?.shares || 0,
          engagements: engagements,
          engagementRate: parseFloat(engagementRate),
          clicks: data.metrics?.clicks || 0,
          impressions: data.metrics?.impressions || 0
        },
        // Determine status
        status: data.scheduledAt && new Date(data.scheduledAt) > new Date() ? 'scheduled' : 'published',
        // Serialize Firestore Timestamps
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
        scheduledAt: data.scheduledAt?.toDate?.()?.toISOString() || data.scheduledAt,
        deleted: data.deleted || 0
      };
    }));

    // Filter out deleted posts
    const activePosts = posts.filter(p => p.deleted !== 1);

    const lastVisible = posts.length > 0 ? posts[posts.length - 1].id : null;

    // Calculate statistics
    const totalReach = posts.reduce((sum, post) => sum + (post.metrics.reach || 0), 0);
    const totalEngagements = posts.reduce((sum, post) => sum + (post.metrics.engagements || 0), 0);
    const avgEngagementRate = posts.length > 0
      ? (posts.reduce((sum, post) => sum + (post.metrics.engagementRate || 0), 0) / posts.length).toFixed(1)
      : 0;

    return {
      success: true,
      success: true,
      posts: activePosts,
      statistics: {
        totalPosts: activePosts.length,
        totalReach,
        totalEngagements,
        avgEngagementRate
      },
      pagination: {
        hasMore,
        lastVisible, // This might be slightly off if the last item was deleted, but acceptable for now
        count: activePosts.length,
        total: snapshot.size
      }
    };
  } catch (err) {
    console.error("Error fetching Facebook posts:", err);
    return {
      success: false,
      message: err.message || "Failed to fetch posts",
      posts: [],
      statistics: { totalPosts: 0, totalReach: 0, totalEngagements: 0, avgEngagementRate: 0 },
      pagination: { hasMore: false, lastVisible: null, count: 0 }
    };
  }
}

// Delete a post
export async function deleteFacebookPost(postId) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    const user = await verifyToken(token);
    if (!user) {
      return { success: false, message: "Invalid token" };
    }

    const postRef = doc(db, "facebook_posts", postId);
    const postSnap = await getDoc(postRef);

    if (!postSnap.exists()) {
      return { success: false, message: "Post not found" };
    }

    const postData = postSnap.data();

    if (postData.userId !== user.id) {
      return { success: false, message: "Unauthorized" };
    }

    // Call Facebook API to delete if it has a Facebook ID
    if (postData.facebookPostId && postData.pageId) {
      try {
        console.log(`Attempting to delete post from Facebook: ${postData.facebookPostId} (Page: ${postData.pageId})`);

        // Get Access Token
        const { pages } = await fetchFacebookPages();
        // Use String() for safe comparison
        const page = pages.find(p => String(p.pageId) === String(postData.pageId));

        if (page && page.accessToken) {
          const response = await fetch(`https://graph.facebook.com/${postData.facebookPostId}?access_token=${page.accessToken}`, {
            method: 'DELETE',
          });
          const data = await response.json();

          if (data.success) {
            console.log("Successfully deleted from Facebook API");
          } else if (data.error) {
            console.warn("Error deleting from Facebook:", data.error);
            // We continue to soft delete even if FB delete fails, but log it
          }
        } else {
          console.warn(`Page not found or no access token for pageId: ${postData.pageId}`);
        }
      } catch (fbError) {
        console.error("Failed to delete from Facebook:", fbError);
      }
    } else {
      console.log("Skipping Facebook API delete: Missing facebookPostId or pageId in post data");
    }

    // Soft delete
    await updateDoc(postRef, {
      deleted: 1,
      updatedAt: new Date()
    });

    revalidatePath("/admin/social/facebook/posts");

    return { success: true, message: "Post deleted successfully" };
  } catch (error) {
    console.error("Error deleting post:", error);
    return { success: false, message: error.message };
  }
}

// Update a post
export async function updateFacebookPost(postId, message) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    const user = await verifyToken(token);
    if (!user) {
      return { success: false, message: "Invalid token" };
    }

    const postRef = doc(db, "facebook_posts", postId);
    const postSnap = await getDoc(postRef);

    if (!postSnap.exists()) {
      return { success: false, message: "Post not found" };
    }

    const postData = postSnap.data();

    if (postData.userId !== user.id) {
      return { success: false, message: "Unauthorized" };
    }

    // Update on Facebook if it has an ID
    if (postData.facebookPostId && postData.pageId) {
      const { pages } = await fetchFacebookPages();
      const page = pages.find(p => p.pageId === postData.pageId);

      if (!page || !page.accessToken) {
        return { success: false, message: "Page access token not found" };
      }

      const response = await fetch(`https://graph.facebook.com/${postData.facebookPostId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: message,
          access_token: page.accessToken
        })
      });

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error.message);
      }
    }

    // Update in Firestore
    await updateDoc(postRef, {
      message: message,
      updatedAt: new Date()
    });

    revalidatePath("/admin/social/facebook/posts");

    return { success: true, message: "Post updated successfully" };
  } catch (error) {
    console.error("Error updating post:", error);
    return { success: false, message: error.message };
  }
}

// Update post schedule
export async function updatePostSchedule(postId, scheduledAt) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    const user = await verifyToken(token);
    if (!user) {
      return { success: false, message: "Invalid token" };
    }

    const postRef = doc(db, "facebook_posts", postId);
    const postSnap = await getDoc(postRef);

    if (!postSnap.exists()) {
      return { success: false, message: "Post not found" };
    }

    if (postSnap.data().userId !== user.id) {
      return { success: false, message: "Unauthorized" };
    }

    await updateDoc(postRef, {
      scheduledAt: new Date(scheduledAt),
      updatedAt: new Date(),
      status: 'scheduled'
    });

    revalidatePath("/admin/social/facebook/posts");

    return { success: true, message: "Post schedule updated successfully" };
  } catch (error) {
    console.error("Error updating post schedule:", error);
    return { success: false, message: error.message };
  }
}

// Duplicate a post
export async function duplicateFacebookPost(postId) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    const user = await verifyToken(token);
    if (!user) {
      return { success: false, message: "Invalid token" };
    }

    const postRef = doc(db, "facebook_posts", postId);
    const postSnap = await getDoc(postRef);

    if (!postSnap.exists()) {
      return { success: false, message: "Post not found" };
    }

    if (postSnap.data().userId !== user.id) {
      return { success: false, message: "Unauthorized" };
    }

    const postData = postSnap.data();

    // Create new post with same data but new ID and timestamps
    const newPostRef = doc(collection(db, "facebook_posts"));
    await updateDoc(newPostRef, {
      ...postData,
      id: newPostRef.id,
      userId: user.id,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'draft', // Reset status to draft
      scheduledAt: null, // Remove schedule
      metrics: {
        reach: 0,
        likes: 0,
        comments: 0,
        shares: 0,
        engagements: 0,
        clicks: 0,
        impressions: 0
      }
    });

    revalidatePath("/admin/social/facebook/posts");

    return {
      success: true,
      message: "Post duplicated successfully",
      newPostId: newPostRef.id
    };
  } catch (error) {
    console.error("Error duplicating post:", error);
    return { success: false, message: error.message };
  }
}

// Export posts to CSV
export async function exportPostsToCSV(filters = {}) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    const user = await verifyToken(token);
    if (!user) {
      return { success: false, message: "Invalid token" };
    }

    // Build query (similar to getFacebookPosts but without pagination)
    let constraints = [
      where("userId", "==", user.id),
      orderBy("createdAt", "desc")
    ];

    if (filters.postType && filters.postType !== 'all') {
      constraints.unshift(where("postType", "==", filters.postType));
    }

    if (filters.status && filters.status !== 'all') {
      constraints.unshift(where("status", "==", filters.status));
    }

    if (filters.pageId && filters.pageId !== 'all') {
      constraints.unshift(where("pageId", "==", filters.pageId));
    }

    const q = query(collection(db, "facebook_posts"), ...constraints);
    const snapshot = await getDocs(q);

    const posts = [];
    for (const docSnap of snapshot.docs) {
      const data = docSnap.data();

      // Get page name
      let pageName = "Unknown Page";
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
              break;
            }
          }
        }
      } catch (error) {
        console.error("Error fetching page details:", error);
      }

      posts.push({
        id: docSnap.id,
        message: data.message || '',
        pageName,
        postType: data.postType || 'text',
        status: data.status || 'published',
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
        scheduledAt: data.scheduledAt?.toDate?.()?.toISOString() || data.scheduledAt,
        reach: data.metrics?.reach || 0,
        likes: data.metrics?.likes || 0,
        comments: data.metrics?.comments || 0,
        shares: data.metrics?.shares || 0,
        engagements: (data.metrics?.likes || 0) + (data.metrics?.comments || 0) + (data.metrics?.shares || 0),
        engagementRate: ((data.metrics?.reach || 1) > 0 ?
          (((data.metrics?.likes || 0) + (data.metrics?.comments || 0) + (data.metrics?.shares || 0)) / (data.metrics?.reach || 1) * 100).toFixed(2) : 0
        )
      });
    }

    // Convert to CSV
    const headers = ['ID', 'Message', 'Page', 'Type', 'Status', 'Created At', 'Scheduled At', 'Reach', 'Likes', 'Comments', 'Shares', 'Engagements', 'Engagement Rate %'];
    const csvRows = [headers.join(',')];

    for (const post of posts) {
      const row = [
        `"${post.id}"`,
        `"${post.message.replace(/"/g, '""')}"`,
        `"${post.pageName}"`,
        `"${post.postType}"`,
        `"${post.status}"`,
        `"${post.createdAt}"`,
        `"${post.scheduledAt || ''}"`,
        post.reach,
        post.likes,
        post.comments,
        post.shares,
        post.engagements,
        post.engagementRate
      ];
      csvRows.push(row.join(','));
    }

    const csvContent = csvRows.join('\n');

    return {
      success: true,
      csv: csvContent,
      filename: `facebook_posts_${new Date().toISOString().split('T')[0]}.csv`
    };
  } catch (error) {
    console.error("Error exporting posts:", error);
    return { success: false, message: error.message };
  }
}

// Get post statistics summary
export async function getPostsStatistics() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    const user = await verifyToken(token);
    if (!user) {
      return { success: false, message: "Invalid token" };
    }

    const q = query(
      collection(db, "facebook_posts"),
      where("userId", "==", user.id)
    );

    const snapshot = await getDocs(q);

    let totalPosts = 0;
    let totalReach = 0;
    let totalEngagements = 0;
    let scheduledPosts = 0;
    let publishedPosts = 0;

    snapshot.docs.forEach((docSnap) => {
      const data = docSnap.data();
      totalPosts++;
      totalReach += data.metrics?.reach || 0;
      totalEngagements += (data.metrics?.likes || 0) + (data.metrics?.comments || 0) + (data.metrics?.shares || 0);

      if (data.scheduledAt && new Date(data.scheduledAt) > new Date()) {
        scheduledPosts++;
      } else {
        publishedPosts++;
      }
    });

    const avgEngagementRate = totalReach > 0 ? ((totalEngagements / totalReach) * 100).toFixed(1) : 0;

    return {
      success: true,
      statistics: {
        totalPosts,
        totalReach,
        totalEngagements,
        avgEngagementRate: parseFloat(avgEngagementRate),
        scheduledPosts,
        publishedPosts
      }
    };
  } catch (error) {
    console.error("Error getting post statistics:", error);
    return { success: false, message: error.message };
  }
}