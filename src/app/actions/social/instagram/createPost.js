// app/actions/social/instagram/createPost.js
"use server";

import fs from "fs";
import { db, storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { fetchInstagramAccounts } from "./getPages";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

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
  const response = await fetch(`https://graph.facebook.com/v24.0${endpoint}`, {
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
async function createMediaContainer(instagramId, mediaData, accessToken, isCarousel = false) {
  const formData = new FormData();

  if (mediaData.image_url) formData.append("image_url", mediaData.image_url);
  if (mediaData.video_url) {
    formData.append("video_url", mediaData.video_url);
  }

  if (mediaData.caption) formData.append("caption", mediaData.caption);

  // Use provided media_type (e.g., STORIES, REELS, CAROUSEL)
  if (mediaData.media_type) {
    formData.append("media_type", mediaData.media_type);
  }
  // Default to REELS for videos if not specified (since VIDEO is deprecated)
  else if (mediaData.video_url) {
    formData.append("media_type", "REELS");
  }

  if (isCarousel && mediaData.children) {
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
async function publishMediaContainer(instagramId, containerId, accessToken) {
  const formData = new FormData();
  formData.append("creation_id", containerId);
  return await makeInstagramRequest(`/${instagramId}/media_publish`, formData, accessToken);
}

/**
 * Check media status
 */
async function checkMediaStatus(instagramId, containerId, accessToken) {
  const response = await fetch(
    `https://graph.facebook.com/v24.0/${containerId}?fields=status_code,status&access_token=${accessToken}`
  );
  return await response.json();
}

/**
 * Get Instagram account info
 */
async function getInstagramAccount(pageId) {
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
function getDateTime(date, time) {
  if (!date || !time) return null;
  let dateStr;

  // Handle Date object or ISO string (which Date object becomes when serialized)
  if (typeof date === 'object' && date instanceof Date) {
    dateStr = date.toISOString().split('T')[0];
  } else if (typeof date === 'string') {
    // Handle both "YYYY-MM-DD" and "YYYY-MM-DDTHH:mm:ss..."
    dateStr = date.split('T')[0];
  } else {
    return null;
  }

  return new Date(`${dateStr}T${time}:00`);
}

/**
 * Create single image post
 */
export async function createInstagramImagePost({ pageId, image, caption, scheduling }) {
  const user = await getAuthenticatedUser();
  const { instagramId, accessToken } = await getInstagramAccount(pageId);

  // TEST MODE: Use hardcoded public URL instead of uploading
  const imageUrl = "https://images.unsplash.com/photo-1554080353-a576cf803bda?auto=format&fit=crop&w=1000&q=80";
  console.log("Creating Instagram Image Post with TEST URL:", imageUrl);

  const scheduledTime = scheduling?.schedule
    ? Math.floor(new Date(`${scheduling.date}T${scheduling.time}`).getTime() / 1000)
    : null;

  const containerId = await createMediaContainer(
    instagramId,
    { image_url: imageUrl, caption, scheduled_publish_time: scheduledTime },
    accessToken
  );

  let publishResult = null;
  if (!scheduling?.schedule) {
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
export async function createInstagramCarouselPost({ pageId, images, caption, scheduling }) {
  const user = await getAuthenticatedUser();
  const { instagramId, accessToken } = await getInstagramAccount(pageId);

  // TEST MODE: Hardcoded images
  const testImages = [
    "https://images.unsplash.com/photo-1554080353-a576cf803bda?auto=format&fit=crop&w=1000&q=80",
    "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80"
  ];
  console.log("Creating Instagram Carousel Post with TEST URLs");

  const childContainers = [];
  for (const imageUrl of testImages) {
    const childContainerId = await createMediaContainer(instagramId, { image_url: imageUrl, caption: "" }, accessToken);
    childContainers.push(childContainerId);
    await new Promise(r => setTimeout(r, 1000));
  }

  const scheduledTime = scheduling?.schedule
    ? Math.floor(new Date(`${scheduling.date}T${scheduling.time}`).getTime() / 1000)
    : null;

  const carouselContainerId = await createMediaContainer(instagramId, { caption, children: childContainers, scheduled_publish_time: scheduledTime }, accessToken, true);

  let publishResult = null;
  if (!scheduling?.schedule) {
    await new Promise(r => setTimeout(r, 3000));
    const status = await checkMediaStatus(instagramId, carouselContainerId, accessToken);
    if (status.status_code === "FINISHED") publishResult = await publishMediaContainer(instagramId, carouselContainerId, accessToken);
    else throw new Error(`Carousel not ready. Status: ${status.status}`);
  }

  const firestoreId = await saveToFirestore({
    platform: "instagram",
    pageId,
    postType: "carousel",
    content: { caption, images: testImages.map(url => ({ url })) },
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

  // TEST MODE: Standard sample video (known to work with Instagram processing)
  const videoUrl = "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4";
  console.log("Creating Instagram Video Post with TEST URL:", videoUrl);

  const scheduledTime = scheduling?.schedule
    ? Math.floor(new Date(`${scheduling.date}T${scheduling.time}`).getTime() / 1000)
    : null;

  const containerId = await createMediaContainer(instagramId, { video_url: videoUrl, caption, scheduled_publish_time: scheduledTime, media_type: "REELS" }, accessToken);

  let publishResult = null;
  if (!scheduling?.schedule) {
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
export async function createInstagramStory({ pageId, media, caption }) {
  const user = await getAuthenticatedUser();
  const { instagramId, accessToken } = await getInstagramAccount(pageId);

  // TEST MODE
  const mediaUrl = "https://images.unsplash.com/photo-1554080353-a576cf803bda?auto=format&fit=crop&w=1000&q=80";
  console.log("Creating Instagram Story with TEST URL:", mediaUrl);

  const containerId = await createMediaContainer(instagramId, { image_url: mediaUrl, caption, media_type: "STORIES" }, accessToken);

  await new Promise(r => setTimeout(r, 3000));
  const status = await checkMediaStatus(instagramId, containerId, accessToken);
  if (status.status_code !== "FINISHED") throw new Error(`Story not ready`);

  const publishResult = await publishMediaContainer(instagramId, containerId, accessToken);

  const firestoreId = await saveToFirestore({
    platform: "instagram",
    pageId,
    postType: "story",
    content: { caption, media: { url: mediaUrl, name: "test_story.jpg" } },
    status: "published",
    instagramContainerId: containerId,
    instagramPostId: publishResult.id,
    metrics: { reach: 0, impressions: 0, replies: 0, exits: 0 },
  }, user.id);

  return { success: true, containerId, instagramPostId: publishResult.id, firestoreId };
}

/**
 * Reels are video posts
 */
export async function createInstagramReel(params) {
  return createInstagramVideoPost(params);
}
