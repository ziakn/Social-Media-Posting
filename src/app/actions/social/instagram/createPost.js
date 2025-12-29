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
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const user = await verifyToken(token);

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
  const user = await getAuthenticatedUser();
  const { instagramId, accessToken } = await getInstagramAccount(pageId);

  // DEVELOPMENT: Use test URL if the provided URL is not public
  const imageUrl = needsTestUrl(image.url) ? getTestUrl('image') : getAbsoluteUrl(image.url);
  console.log("Creating Instagram Image Post with URL:", imageUrl);

  let containerId = null;
  let publishResult = null;

  if (!scheduling?.schedule) {
    containerId = await createMediaContainer(
      instagramId,
      { image_url: imageUrl, caption },
      accessToken
    );

    await new Promise(r => setTimeout(r, 2000));
    const status = await checkMediaStatus(instagramId, containerId, accessToken);
    if (status.status_code === "FINISHED") {
      publishResult = await publishMediaContainer(instagramId, containerId, accessToken);
    } else {
      throw new Error(`Media not ready for publishing. Status: ${status.status}`);
    }
  }

  const firestoreId = await saveToFirestore({
    platform: "instagram",
    pageId,
    postType: "image",
    content: { caption, image: { url: imageUrl, name: image.name, type: image.type, size: image.size } },
    status: scheduling?.schedule ? "scheduled" : "published",
    scheduledAt: scheduling?.schedule ? getDateTime(scheduling.date, scheduling.time) : null,
    instagramContainerId: containerId,
    instagramPostId: publishResult?.id || null,
    metrics: { reach: 0, engagement: 0, likes: 0, comments: 0 },
  }, user.id);

  return { success: true, containerId, instagramPostId: publishResult?.id || null, firestoreId, scheduled: !!scheduling?.schedule };
}

/**
 * Create carousel post (TEST MODE)
 */
export async function createInstagramCarouselPost({ pageId, media, caption, scheduling }) {
  const user = await getAuthenticatedUser();
  const { instagramId, accessToken } = await getInstagramAccount(pageId);

  // TEST MODE: In production, you would upload media[i].file to get a real URL
  // Here we use the provided URLs (which might be blob URLs in frontend, which won't work server-side)
  console.log("Creating Instagram Carousel Post with Mixed Media");

  let carouselContainerId = null;
  let publishResult = null;
  const processedMedia = [];

  for (let i = 0; i < media.length; i++) {
    const item = media[i];
    const mediaUrl = needsTestUrl(item.url) ? getTestUrl(item.type, i) : getAbsoluteUrl(item.url);
    processedMedia.push({ url: mediaUrl, type: item.type });
  }

  if (!scheduling?.schedule) {
    const childContainers = [];
    for (let i = 0; i < processedMedia.length; i++) {
      const item = processedMedia[i];
      const mediaData = item.type === 'video' ? { video_url: item.url } : { image_url: item.url };

      console.log(`Creating child container for carousel item ${i + 1} (${item.type}) with URL:`, item.url);
      const childContainerId = await createMediaContainer(instagramId, { ...mediaData, caption: "", is_carousel_item: true }, accessToken);

      // Polling child container status
      console.log(`Polling child container ${childContainerId} status...`);
      let status, attempts = 0;
      const maxAttempts = item.type === 'video' ? 15 : 6;
      do {
        await new Promise(r => setTimeout(r, 5000));
        status = await checkMediaStatus(instagramId, childContainerId, accessToken);
        console.log(`Child container ${childContainerId} status:`, status.status_code);
        if (status.status_code === "FINISHED") break;
        if (status.status_code === "ERROR") throw new Error(`Carousel child processing failed: ${JSON.stringify(status.error || status)}`);
        attempts++;
      } while (attempts < maxAttempts);

      if (status.status_code !== "FINISHED") {
        throw new Error(`Carousel child ${i + 1} was not ready in time. Last status: ${status.status_code}`);
      }
      childContainers.push(childContainerId);
    }

    console.log("Creating final carousel container with children:", childContainers);
    carouselContainerId = await createMediaContainer(instagramId, { caption, children: childContainers }, accessToken, true);

    // Wait for carousel container itself to be ready
    console.log("Polling carousel container status...");
    let status, attempts = 0;
    do {
      await new Promise(r => setTimeout(r, 5000));
      status = await checkMediaStatus(instagramId, carouselContainerId, accessToken);
      console.log("Carousel container status:", status.status_code);
      if (status.status_code === "FINISHED") break;
      if (status.status_code === "ERROR") throw new Error(`Carousel container processing failed: ${JSON.stringify(status.error || status)}`);
      attempts++;
    } while (attempts < 5);

    if (status.status_code === "FINISHED") {
      publishResult = await publishMediaContainer(instagramId, carouselContainerId, accessToken);
    } else {
      throw new Error(`Carousel not ready for publishing. Status: ${status.status_code}`);
    }
  }

  const firestoreId = await saveToFirestore({
    platform: "instagram",
    pageId,
    postType: "carousel",
    content: { caption, media: processedMedia },
    status: scheduling?.schedule ? "scheduled" : "published",
    scheduledAt: scheduling?.schedule ? getDateTime(scheduling.date, scheduling.time) : null,
    instagramContainerId: carouselContainerId,
    instagramPostId: publishResult?.id || null,
    metrics: { reach: 0, engagement: 0, likes: 0, comments: 0 },
  }, user.id);

  return { success: true, containerId: carouselContainerId, instagramPostId: publishResult?.id || null, firestoreId, scheduled: !!scheduling?.schedule };
}

/**
 * Create video post (TEST MODE)
 */
export async function createInstagramVideoPost({ pageId, video, caption, scheduling }) {
  const user = await getAuthenticatedUser();
  const { instagramId, accessToken } = await getInstagramAccount(pageId);

  // DEVELOPMENT: Use test URL if the provided URL is not public
  const videoUrl = needsTestUrl(video.url) ? getTestUrl('video') : getAbsoluteUrl(video.url);
  console.log("Creating Instagram Video Post with URL:", videoUrl);

  let containerId = null;
  let publishResult = null;

  if (!scheduling?.schedule) {
    containerId = await createMediaContainer(instagramId, { video_url: videoUrl, caption, media_type: "REELS" }, accessToken);

    await new Promise(r => setTimeout(r, 10000));
    let status, attempts = 0;
    do {
      status = await checkMediaStatus(instagramId, containerId, accessToken);
      console.log(`Video processing status (attempt ${attempts + 1}):`, status); // Debug log
      attempts++;
      if (status.status_code === "FINISHED") break;
      else if (status.status_code === "ERROR") throw new Error(`Video processing failed. Status: ${JSON.stringify(status)}`);
      await new Promise(r => setTimeout(r, 5000));
    } while (attempts < 12);
    if (status.status_code === "FINISHED") publishResult = await publishMediaContainer(instagramId, containerId, accessToken);
    else throw new Error(`Video not ready after 1 minute`);
  }

  const firestoreId = await saveToFirestore({
    platform: "instagram",
    pageId,
    postType: "video",
    content: { caption, video: { url: videoUrl, name: "test_video.mp4" } },
    status: scheduling?.schedule ? "scheduled" : "published",
    scheduledAt: scheduling?.schedule ? getDateTime(scheduling.date, scheduling.time) : null,
    instagramContainerId: containerId,
    instagramPostId: publishResult?.id || null,
    metrics: { reach: 0, engagement: 0, likes: 0, comments: 0, views: 0 },
  }, user.id);

  return { success: true, containerId, instagramPostId: publishResult?.id || null, firestoreId, scheduled: !!scheduling?.schedule };
}

/**
 * Create story post (TEST MODE)
 */
export async function createInstagramStory({ pageId, media, caption, scheduling }) {
  const user = await getAuthenticatedUser();
  const { instagramId, accessToken } = await getInstagramAccount(pageId);

  // DEVELOPMENT: Use test URL if the provided URL is not public
  const mediaUrl = needsTestUrl(media.url) ? getTestUrl(media.type) : getAbsoluteUrl(media.url);

  console.log(`Creating Instagram Story with ${media.type} URL:`, mediaUrl);

  let containerId = null;
  let publishResult = null;

  if (!scheduling?.schedule) {
    containerId = await createMediaContainer(
      instagramId,
      {
        image_url: media.type === 'video' ? undefined : mediaUrl,
        video_url: media.type === 'video' ? mediaUrl : undefined,
        media_type: "STORIES"
      },
      accessToken
    );

    // Wait for processing
    await new Promise(r => setTimeout(r, media.type === 'video' ? 10000 : 3000));

    let status, attempts = 0;
    const maxAttempts = media.type === 'video' ? 12 : 3;
    do {
      status = await checkMediaStatus(instagramId, containerId, accessToken);
      if (status.status_code === "FINISHED") break;
      if (status.status_code === "ERROR") throw new Error(`Story processing failed. Status: ${JSON.stringify(status)}`);
      attempts++;
      await new Promise(r => setTimeout(r, 5000));
    } while (attempts < maxAttempts);

    if (status.status_code !== "FINISHED") throw new Error(`Story not ready after timeout`);

    publishResult = await publishMediaContainer(instagramId, containerId, accessToken);
  }

  const firestoreId = await saveToFirestore({
    platform: "instagram",
    pageId,
    postType: "story",
    content: { caption, media: { url: mediaUrl, name: media.name || "story_media", type: media.type } },
    status: scheduling?.schedule ? "scheduled" : "published",
    scheduledAt: scheduling?.schedule ? getDateTime(scheduling.date, scheduling.time) : null,
    instagramContainerId: containerId,
    instagramPostId: publishResult?.id || null,
    metrics: { reach: 0, impressions: 0, replies: 0, exits: 0 },
  }, user.id);

  return { success: true, containerId, instagramPostId: publishResult?.id || null, firestoreId, scheduled: !!scheduling?.schedule };
}

/**
 * Reels are video posts
 */
export async function createInstagramReel(params) {
  return createInstagramVideoPost(params);
}
