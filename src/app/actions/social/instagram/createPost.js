// app/actions/social/instagram/createPost.js
"use server";

import fs from "fs";
import { db, storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { fetchInstagramAccounts } from "./getPages";
import { cookies, headers } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { getDateTime } from "@/lib/utils";
import { getAbsoluteUrl, getTestUrl, needsTestUrl } from "./mediaUtils";
import path from "path";
import { checkVideoMetadata, validatePlatformCompliance, convertVideoForPlatform } from "@/lib/media/videoProcessor";
import { syncPostJob } from "@/lib/queue/queues";

import { checkUsageLimitAction } from "../../usage/usageActions";
/**
 * Upload local file or File object to Firebase and return public URL
 */
async function uploadToFirebase(input, folder = "instagram") {
  let buffer, fileName;

  if (typeof input === "string") {
    // Local path
    buffer = fs.readFileSync(input);
    fileName = `${folder}/${Date.now()}-${input.split("/").pop()}`;
  } else {
    // File object from client
    buffer = await input.arrayBuffer();
    fileName = `${folder}/${Date.now()}-${input.name}`;
  }

  const storageRef = ref(storage, fileName);
  await uploadBytes(storageRef, buffer);
  return await getDownloadURL(storageRef);
}

/**
 * Make POST request to Instagram Graph API
 */
async function makeInstagramRequest(endpoint, formData, accessToken) {
  formData.append("access_token", accessToken);
  const response = await fetch(`https://graph.instagram.com/v24.0${endpoint}`, {
    method: "POST",
    body: formData,
  });
  const data = await response.json();
  console.log("IG API response:", data);
  if (!response.ok) throw new Error(data.error?.message || "Instagram API error");
  return data;
}

/**
 * Create media container
 */
export async function createMediaContainer(instagramId, mediaData, accessToken, isCarouselContainer = false) {
  const formData = new FormData();

  if (mediaData.image_url) formData.append("image_url", getAbsoluteUrl(mediaData.image_url));
  if (mediaData.video_url) {
    formData.append("video_url", getAbsoluteUrl(mediaData.video_url));
  }

  if (mediaData.caption && mediaData.media_type !== "STORIES") formData.append("caption", mediaData.caption);
  if (mediaData.is_carousel_item) formData.append("is_carousel_item", "true");

  // Use provided media_type (e.g., STORIES, REELS, CAROUSEL)
  if (mediaData.media_type) {
    formData.append("media_type", mediaData.media_type);
  }
  // Default to VIDEO for carousel items or REELS for standalone videos
  else if (mediaData.video_url) {
    formData.append("media_type", mediaData.is_carousel_item ? "VIDEO" : "REELS");
  }

  if (isCarouselContainer && mediaData.children) {
    formData.append("children", mediaData.children.join(","));
    formData.append("media_type", "CAROUSEL");
  }

  if (mediaData.scheduled_publish_time) {
    formData.append("scheduled_publish_time", mediaData.scheduled_publish_time.toString());
  }

  const container = await makeInstagramRequest(`/${instagramId}/media`, formData, accessToken);
  return container.id;
}

/**
 * Publish container
 */
export async function publishMediaContainer(instagramId, containerId, accessToken) {
  const formData = new FormData();
  formData.append("creation_id", containerId);
  return await makeInstagramRequest(`/${instagramId}/media_publish`, formData, accessToken);
}

/**
 * Check media status
 */
export async function checkMediaStatus(instagramId, containerId, accessToken) {
  const response = await fetch(
    `https://graph.instagram.com/v24.0/${containerId}?fields=status_code,status&access_token=${accessToken}`
  );
  return await response.json();
}

/**
 * Get Instagram account info
 */
export async function getInstagramAccount(pageId) {
  const result = await fetchInstagramAccounts();
  if (!result.success) throw new Error(result.message || "Failed to fetch Instagram accounts");
  const account = result.accounts.find(acc => acc.igUserId === pageId);
  if (!account) throw new Error("Instagram account not found");
  return { instagramId: account.igUserId, accessToken: account.accessToken };
}

/**
 * Save post to Firestore
 */
async function saveToFirestore(postData, userId) {
  const postRef = await addDoc(collection(db, "instagram_posts"), {
    ...postData,
    delete: 0,
    userId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return postRef.id;
}

/**
 * Get authenticated user
 */
async function getAuthenticatedUser() {
  const user = await verifyToken();

  if (!user) {
    throw new Error("Invalid or expired token. Please log in again.");
  }

  return user;
}

/**
 * Helper to construct Date object correctly from date string/object and time string
 * Ensures we get YYYY-MM-DD from the date and combine it with the time
 */

/**
 * Create single image post
 */
export async function createInstagramImagePost({ pageId, image, caption, scheduling }) {
  try {
    const user = await getAuthenticatedUser();

    // Check usage limits
    const usageCheck = await checkUsageLimitAction('post');
    if (!usageCheck.success) return { success: false, message: usageCheck.error };

    // DEVELOPMENT: Use test URL if the provided URL is not public
    const imageUrl = needsTestUrl(image.url) ? getTestUrl('image') : getAbsoluteUrl(image.url);
    console.log("Queueing Instagram Image Post with URL:", imageUrl);

    const firestoreId = await saveToFirestore({
      platform: "instagram",
      pageId,
      postType: "image",
      content: { caption, image: { url: imageUrl, name: image.name, type: image.type, size: image.size } },
      status: "scheduled", // Always scheduled initially (even if delay=0)
      scheduledAt: scheduling?.schedule ? getDateTime(scheduling.date, scheduling.time) : serverTimestamp(),
      metrics: { reach: 0, engagement: 0, likes: 0, comments: 0 },
    }, user.id);

    // Synchronize with Queue
    const scheduledTime = scheduling?.schedule ? getDateTime(scheduling.date, scheduling.time) : new Date();
    const delay = Math.max(0, new Date(scheduledTime).getTime() - Date.now());

    await syncPostJob("instagram", firestoreId, {
      postId: firestoreId,
      pageId,
      userId: user.id,
      userEmail: user.email
    }, { delay });

    return {
      success: true,
      firestoreId,
      scheduled: !!scheduling?.schedule,
      message: scheduling?.schedule ? "Post scheduled successfully" : "Post submission queued for publishing"
    };
  } catch (error) {
    console.error("Instagram Image Post Error:", error);
    return { success: false, message: error.message || "Failed to create Instagram image post" };
  }
}

/**
 * Create carousel post
 */
export async function createInstagramCarouselPost({ pageId, media, caption, scheduling }) {
  try {
    const user = await getAuthenticatedUser();

    // Check usage limits
    const usageCheck = await checkUsageLimitAction('post');
    if (!usageCheck.success) return { success: false, message: usageCheck.error };

    console.log("Queueing Instagram Carousel Post");

    const processedMedia = [];
    for (let i = 0; i < media.length; i++) {
      const item = media[i];
      const mediaUrl = needsTestUrl(item.url) ? getTestUrl(item.type, i) : getAbsoluteUrl(item.url);
      processedMedia.push({ url: mediaUrl, type: item.type });
    }

    const firestoreId = await saveToFirestore({
      platform: "instagram",
      pageId,
      postType: "carousel",
      content: { caption, media: processedMedia },
      status: "scheduled",
      scheduledAt: scheduling?.schedule ? getDateTime(scheduling.date, scheduling.time) : serverTimestamp(),
      metrics: { reach: 0, engagement: 0, likes: 0, comments: 0 },
    }, user.id);

    // Synchronize with Queue
    const scheduledTime = scheduling?.schedule ? getDateTime(scheduling.date, scheduling.time) : new Date();
    const delay = Math.max(0, new Date(scheduledTime).getTime() - Date.now());

    await syncPostJob("instagram", firestoreId, {
      postId: firestoreId,
      pageId,
      userId: user.id,
      userEmail: user.email
    }, { delay });

    return {
      success: true,
      firestoreId,
      scheduled: !!scheduling?.schedule,
      message: scheduling?.schedule ? "Carousel scheduled successfully" : "Carousel queued for processing"
    };
  } catch (error) {
    console.error("Instagram Carousel Post Error:", error);
    return { success: false, message: error.message || "Failed to create Instagram carousel post" };
  }
}

/**
 * Create video post
 */
export async function createInstagramVideoPost({ pageId, video, caption, scheduling }) {
  try {
    const user = await getAuthenticatedUser();

    // Check usage limits
    const usageCheck = await checkUsageLimitAction('post');
    if (!usageCheck.success) return { success: false, message: usageCheck.error };

    let videoUrl = needsTestUrl(video.url) ? getTestUrl('video') : getAbsoluteUrl(video.url);

    // --- Video Validation & Conversion ---
    if (!needsTestUrl(video.url)) {
      try {
        if (video.url.startsWith('/')) {
          const relativePath = video.url.substring(1);
          const absolutePath = path.join(process.cwd(), 'public', relativePath);
          const metadata = await checkVideoMetadata(absolutePath);
          const compliance = validatePlatformCompliance('instagram', metadata);

          if (!compliance.compliant) {
            const dir = path.dirname(absolutePath);
            const ext = path.extname(absolutePath);
            const basename = path.basename(absolutePath, ext);
            const outputPath = path.join(dir, `${basename}_ig.mp4`);
            await convertVideoForPlatform(absolutePath, outputPath);
            const newRelativePath = '/' + path.relative(path.join(process.cwd(), 'public'), outputPath);
            videoUrl = getAbsoluteUrl(newRelativePath);
          }
        }
      } catch (err) {
        console.warn("Instagram validation skipped:", err);
      }
    }

    console.log("Queueing Instagram Video Post");

    const firestoreId = await saveToFirestore({
      platform: "instagram",
      pageId,
      postType: "video",
      content: { caption, video: { url: videoUrl, name: video.name || "video.mp4" } },
      status: "scheduled",
      scheduledAt: scheduling?.schedule ? getDateTime(scheduling.date, scheduling.time) : serverTimestamp(),
      metrics: { reach: 0, engagement: 0, likes: 0, comments: 0, views: 0 },
    }, user.id);

    // Synchronize with Queue
    const scheduledTime = scheduling?.schedule ? getDateTime(scheduling.date, scheduling.time) : new Date();
    const delay = Math.max(0, new Date(scheduledTime).getTime() - Date.now());

    await syncPostJob("instagram", firestoreId, {
      postId: firestoreId,
      pageId,
      userId: user.id,
      userEmail: user.email
    }, { delay });

    return {
      success: true,
      firestoreId,
      scheduled: !!scheduling?.schedule,
      message: scheduling?.schedule ? "Video scheduled successfully" : "Video submission queued"
    };
  } catch (error) {
    console.error("Instagram Video Post Error:", error);
    return { success: false, message: error.message || "Failed to create Instagram video post" };
  }
}

/**
 * Create story post
 */
export async function createInstagramStory({ pageId, media, caption, scheduling }) {
  try {
    const user = await getAuthenticatedUser();

    // Check usage limits
    const usageCheck = await checkUsageLimitAction('post');
    if (!usageCheck.success) return { success: false, message: usageCheck.error };

    const mediaUrl = needsTestUrl(media.url) ? getTestUrl(media.type) : getAbsoluteUrl(media.url);
    console.log(`Queueing Instagram Story with ${media.type}`);

    const firestoreId = await saveToFirestore({
      platform: "instagram",
      pageId,
      postType: "story",
      content: { caption, media: { url: mediaUrl, name: media.name || "story_media", type: media.type } },
      status: "scheduled",
      scheduledAt: scheduling?.schedule ? getDateTime(scheduling.date, scheduling.time) : serverTimestamp(),
      metrics: { reach: 0, impressions: 0, replies: 0, exits: 0 },
    }, user.id);

    // Synchronize with Queue
    const scheduledTime = scheduling?.schedule ? getDateTime(scheduling.date, scheduling.time) : new Date();
    const delay = Math.max(0, new Date(scheduledTime).getTime() - Date.now());

    await syncPostJob("instagram", firestoreId, {
      postId: firestoreId,
      pageId,
      userId: user.id,
      userEmail: user.email
    }, { delay });

    return {
      success: true,
      firestoreId,
      scheduled: !!scheduling?.schedule,
      message: scheduling?.schedule ? "Story scheduled successfully" : "Story submission queued"
    };
  } catch (error) {
    console.error("Instagram Story Error:", error);
    return { success: false, message: error.message || "Failed to create Instagram story" };
  }
}

/**
 * Reels are video posts
 */
export async function createInstagramReel(params) {
  return createInstagramVideoPost(params);
}
