"use server";

import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  startAfter,
  getCountFromServer
} from "firebase/firestore";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

/**
 * Fetch posts for a given Instagram Business account (legacy function)
 */
export async function fetchInstagramPosts(igUserId) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    const user = await verifyToken(token);

    if (!user) {
      return { success: false, message: "Invalid or expired token", posts: [] };
    }

    const q = query(
      collection(db, "instagram_posts"),
      where("userId", "==", user.id),
      where("igUserId", "==", igUserId)
    );

    const snapshot = await getDocs(q);
    const posts = [];

    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      posts.push({
        id: docSnap.id,
        caption: data.caption,
        mediaUrl: data.mediaUrl,
        mediaType: data.mediaType,
        timestamp: data.timestamp?.toMillis() || Date.now(),
      });
    });

    return { success: true, posts };
  } catch (err) {
    console.error("Error fetching Instagram posts:", err);
    return { success: false, message: err.message, posts: [] };
  }
}

/**
 * Get published Instagram posts with pagination, filtering, and sorting
 * 
 * @param {Object} params
 * @param {string} params.pageId - Instagram page/account ID
 * @param {Object} params.filters - Filter options
 * @param {string} params.filters.postType - Filter by post type (image, carousel, video, story, all)
 * @param {string} params.filters.searchQuery - Search in caption
 * @param {Date} params.filters.dateFrom - Start date for filtering
 * @param {Date} params.filters.dateTo - End date for filtering
 * @param {Object} params.pagination - Pagination options
 * @param {number} params.pagination.pageSize - Number of posts per page (default: 12)
 * @param {string} params.pagination.lastPostId - ID of last post from previous page
 * @param {Object} params.sorting - Sorting options
 * @param {string} params.sorting.sortBy - Field to sort by (date, likes, comments)
 * @param {string} params.sorting.sortOrder - Sort order (asc, desc)
 */
export async function getPublishedPosts({
  pageId,
  filters = {},
  pagination = {},
  sorting = {}
}) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    const user = await verifyToken(token);

    if (!user) {
      return {
        success: false,
        message: "Invalid or expired token",
        posts: [],
        hasMore: false
      };
    }

    // Build base query
    let constraints = [
      where("platform", "==", "instagram"),
      where("status", "==", "published")
    ];

    // Add pageId filter if provided
    if (pageId) {
      constraints.push(where("pageId", "==", pageId));
    }

    // Add post type filter
    if (filters.postType && filters.postType !== "all") {
      constraints.push(where("postType", "==", filters.postType));
    }

    // Add date range filters
    if (filters.dateFrom) {
      constraints.push(where("createdAt", ">=", filters.dateFrom));
    }
    if (filters.dateTo) {
      constraints.push(where("createdAt", "<=", filters.dateTo));
    }

    // Determine sort field and order
    const sortBy = sorting.sortBy || "date";
    const sortOrder = sorting.sortOrder || "desc";

    // For now, only support sorting by createdAt to avoid complex pagination
    constraints.push(orderBy("createdAt", sortOrder));

    // Add pagination
    const pageSize = pagination.pageSize || 12;

    // Fetch all matching posts (we'll handle pagination client-side for simplicity)
    const q = query(collection(db, "instagram_posts"), ...constraints);
    const snapshot = await getDocs(q);

    // Process all results
    let allPosts = [];

    snapshot.forEach((docSnap) => {
      const data = docSnap.data();

      // Apply client-side search filter if provided
      if (filters.searchQuery) {
        const caption = data.content?.caption || "";
        if (!caption.toLowerCase().includes(filters.searchQuery.toLowerCase())) {
          return; // Skip this post
        }
      }

      allPosts.push({
        id: docSnap.id,
        postType: data.postType,
        caption: data.content?.caption || "",
        mediaUrl: getMediaUrl(data),
        carouselMedia: data.postType === "carousel" ? data.content?.images : [],
        mediaType: data.postType,
        createdAt: data.createdAt?.toDate?.() || new Date(),
        scheduledAt: data.scheduledAt?.toDate?.() || null,
        instagramPostId: data.instagramPostId,
        metrics: {
          likes: data.metrics?.likes || 0,
          comments: data.metrics?.comments || 0,
          reach: data.metrics?.reach || 0,
          engagement: data.metrics?.engagement || 0,
          views: data.metrics?.views || 0
        },
        status: data.status
      });
    });

    // Apply client-side sorting if not by date
    if (sortBy === "likes") {
      allPosts.sort((a, b) => {
        return sortOrder === "desc"
          ? b.metrics.likes - a.metrics.likes
          : a.metrics.likes - b.metrics.likes;
      });
    } else if (sortBy === "comments") {
      allPosts.sort((a, b) => {
        return sortOrder === "desc"
          ? b.metrics.comments - a.metrics.comments
          : a.metrics.comments - b.metrics.comments;
      });
    }

    // Find the starting index for pagination
    let startIndex = 0;
    if (pagination.lastPostId) {
      const lastIndex = allPosts.findIndex(post => post.id === pagination.lastPostId);
      if (lastIndex !== -1) {
        startIndex = lastIndex + 1;
      }
    }

    // Get the page of posts
    const posts = allPosts.slice(startIndex, startIndex + pageSize);
    const hasMore = startIndex + pageSize < allPosts.length;
    const lastPostId = posts.length > 0 ? posts[posts.length - 1].id : null;

    return {
      success: true,
      posts,
      hasMore,
      lastPostId
    };
  } catch (err) {
    console.error("Error fetching published Instagram posts:", err);
    return {
      success: false,
      message: err.message,
      posts: [],
      hasMore: false
    };
  }
}

/**
 * Get total count of published posts with filters
 */
export async function getPublishedPostsCount({ pageId, filters = {} }) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    const user = await verifyToken(token);

    if (!user) {
      return { success: false, message: "Invalid or expired token", count: 0 };
    }

    // Build query constraints
    let constraints = [
      where("platform", "==", "instagram"),
      where("status", "==", "published")
    ];

    if (pageId) {
      constraints.push(where("pageId", "==", pageId));
    }

    if (filters.postType && filters.postType !== "all") {
      constraints.push(where("postType", "==", filters.postType));
    }

    if (filters.dateFrom) {
      constraints.push(where("createdAt", ">=", filters.dateFrom));
    }
    if (filters.dateTo) {
      constraints.push(where("createdAt", "<=", filters.dateTo));
    }

    const q = query(collection(db, "instagram_posts"), ...constraints);
    const snapshot = await getCountFromServer(q);

    return { success: true, count: snapshot.data().count };
  } catch (err) {
    console.error("Error getting posts count:", err);
    return { success: false, message: err.message, count: 0 };
  }
}

/**
 * Get aggregate stats for published posts
 */
export async function getPublishedPostsStats({ pageId }) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    const user = await verifyToken(token);

    if (!user) {
      return {
        success: false,
        message: "Invalid or expired token",
        stats: null
      };
    }

    // Build query
    let constraints = [
      where("platform", "==", "instagram"),
      where("status", "==", "published")
    ];

    if (pageId) {
      constraints.push(where("pageId", "==", pageId));
    }

    const q = query(collection(db, "instagram_posts"), ...constraints);
    const snapshot = await getDocs(q);

    // Calculate stats
    let totalPosts = 0;
    let totalLikes = 0;
    let totalComments = 0;
    let totalReach = 0;
    let totalViews = 0;

    snapshot.forEach((docSnap) => {
      totalPosts++;
      const data = docSnap.data();
      totalLikes += data.metrics?.likes || 0;
      totalComments += data.metrics?.comments || 0;
      totalReach += data.metrics?.reach || 0;
      totalViews += data.metrics?.views || 0;
    });

    const totalEngagement = totalLikes + totalComments;
    const avgEngagement = totalPosts > 0 ? Math.round(totalEngagement / totalPosts) : 0;

    return {
      success: true,
      stats: {
        totalPosts,
        totalLikes,
        totalComments,
        totalReach,
        totalViews,
        totalEngagement,
        avgEngagement
      }
    };
  } catch (err) {
    console.error("Error getting posts stats:", err);
    return {
      success: false,
      message: err.message,
      stats: null
    };
  }
}

/**
 * Helper function to extract media URL from post data
 */
function getMediaUrl(data) {
  if (data.postType === "carousel" && data.content?.images?.length > 0) {
    return data.content.images[0].url;
  }
  if (data.postType === "video" && data.content?.video?.url) {
    return data.content.video.url;
  }
  if (data.postType === "image" && data.content?.image?.url) {
    return data.content.image.url;
  }
  if (data.postType === "story" && data.content?.media?.url) {
    return data.content.media.url;
  }
  return null;
}

/**
 * Get scheduled Instagram posts
 */
export async function getScheduledInstagramPosts({
  pageId,
  filters = {},
  pagination = {},
  sorting = {}
}) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    const user = await verifyToken(token);

    if (!user) {
      return {
        success: false,
        message: "Invalid or expired token",
        posts: [],
        hasMore: false
      };
    }

    // Build base query
    let constraints = [
      where("platform", "==", "instagram"),
      where("status", "==", "scheduled")
    ];

    // Add pageId filter if provided
    if (pageId) {
      constraints.push(where("pageId", "==", pageId));
    }

    // Add post type filter
    if (filters.postType && filters.postType !== "all") {
      constraints.push(where("postType", "==", filters.postType));
    }

    // Determine sort field and order
    const sortOrder = sorting.sortOrder || "asc"; // Default to ASC for scheduled (soonest first)

    // Sort by scheduledAt
    constraints.push(orderBy("scheduledAt", sortOrder));

    // Add pagination
    const pageSize = pagination.pageSize || 12;

    // Fetch all matching posts
    const q = query(collection(db, "instagram_posts"), ...constraints);
    const snapshot = await getDocs(q);

    // Process all results
    let allPosts = [];

    snapshot.forEach((docSnap) => {
      const data = docSnap.data();

      // Apply client-side search filter if provided
      if (filters.searchQuery) {
        const caption = data.content?.caption || "";
        if (!caption.toLowerCase().includes(filters.searchQuery.toLowerCase())) {
          return; // Skip this post
        }
      }

      allPosts.push({
        id: docSnap.id,
        postType: data.postType,
        caption: data.content?.caption || "",
        mediaUrl: getMediaUrl(data),
        carouselMedia: data.postType === "carousel" ? data.content?.images : [],
        mediaType: data.postType,
        createdAt: data.createdAt?.toDate?.() || new Date(),
        scheduledAt: data.scheduledAt?.toDate?.() || null,
        instagramPostId: data.instagramPostId,
        metrics: {
          likes: data.metrics?.likes || 0,
          comments: data.metrics?.comments || 0,
          reach: data.metrics?.reach || 0,
          engagement: data.metrics?.engagement || 0,
          views: data.metrics?.views || 0
        },
        status: data.status,
        pageName: data.pageName,
        pageProfilePicture: data.pageProfilePicture
      });
    });

    // Find the starting index for pagination
    let startIndex = 0;
    if (pagination.lastPostId) {
      const lastIndex = allPosts.findIndex(post => post.id === pagination.lastPostId);
      if (lastIndex !== -1) {
        startIndex = lastIndex + 1;
      }
    }

    // Get the page of posts
    const posts = allPosts.slice(startIndex, startIndex + pageSize);
    const hasMore = startIndex + pageSize < allPosts.length;
    const lastPostId = posts.length > 0 ? posts[posts.length - 1].id : null;

    return {
      success: true,
      posts,
      hasMore,
      lastPostId
    };
  } catch (err) {
    console.error("Error fetching scheduled Instagram posts:", err);
    return {
      success: false,
      message: err.message,
      posts: [],
      hasMore: false
    };
  }
}
