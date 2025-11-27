// app/actions/social/facebook/createPost.js
"use server";

import { db } from "@/lib/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { fetchFacebookPages } from "./getPages";

/**
 * Enhanced base function to create a Facebook post
 */
async function createFacebookPostBase({
  pageId,
  message,
  mediaUrls = [], // Now expects pre-uploaded URLs
  scheduledTime,
  postType,
  additionalData = {},
}) {
  try {
    const { pages } = await fetchFacebookPages();
    
    const page = pages.find((p) => String(p.pageId) === String(pageId));
    if (!page) {
      return { success: false, message: "Facebook page not found" };
    }

    const accessToken = page.accessToken;
    if (!accessToken) {
      return { success: false, message: "Missing Facebook Page Access Token" };
    }

    // Scheduled time calculation
    const publishTime = scheduledTime
      ? Math.floor(new Date(scheduledTime).getTime() / 1000)
      : undefined;

    let fbResponse;
    let fbData;

    // Base Facebook API body
    const baseBody = {
      message: message?.trim() || '',
      access_token: accessToken,
      published: !scheduledTime,
      scheduled_publish_time: publishTime,
    };

    // Post type specific logic
    switch (postType) {
      case "images":
        if (mediaUrls.length > 0) {
          fbData = await handleImagePost(pageId, message, mediaUrls, accessToken, baseBody);
        } else {
          // Fallback to text post if no images
          fbData = await handleTextPost(pageId, baseBody);
        }
        break;

      case "video":
        if (mediaUrls.length > 0) {
          fbData = await handleVideoPost(pageId, message, mediaUrls[0], accessToken, baseBody);
        } else {
          return { success: false, message: "No video provided" };
        }
        break;

      case "poll":
        fbData = await handlePollPost(pageId, message, additionalData, baseBody);
        break;

      case "link":
        fbData = await handleLinkPost(pageId, message, additionalData, baseBody);
        break;

      default:
        fbData = await handleTextPost(pageId, baseBody);
        break;
    }

    if (fbData.error) {
      throw new Error(fbData.error.message);
    }

    // Save to Firestore
    const postId = fbData.id || `facebook_${Date.now()}`;
    await savePostToFirestore({
      postId,
      pageId,
      message,
      mediaUrls,
      postType,
      scheduledTime,
      additionalData,
      facebookPostId: fbData.id,
      status: scheduledTime ? "scheduled" : "posted",
    });

    return {
      success: true,
      fbData,
      postId,
      message: scheduledTime
        ? "Post scheduled successfully"
        : "Post published successfully",
    };

  } catch (error) {
    console.error("Facebook post creation error:", error);
    return {
      success: false,
      error: error.message,
      message: `Failed to create post: ${error.message}`,
    };
  }
}

// Handler functions for different post types
async function handleImagePost(pageId, message, mediaUrls, accessToken, baseBody) {
  const attachedMedia = [];

  // Upload each image to Facebook
  for (const media of mediaUrls) {
    const uploadRes = await fetch(
      `https://graph.facebook.com/${pageId}/photos`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: media.url,
          published: false,
          access_token: accessToken,
        }),
      }
    );

    const uploadData = await uploadRes.json();
    if (uploadData.error) throw new Error(uploadData.error.message);
    attachedMedia.push({ media_fbid: uploadData.id });
  }

  // Create post with attached media
  const fbResponse = await fetch(`https://graph.facebook.com/${pageId}/feed`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...baseBody,
      attached_media: attachedMedia,
    }),
  });

  return await fbResponse.json();
}

async function handleVideoPost(pageId, message, video, accessToken, baseBody) {
  const formData = new FormData();
  formData.append("description", message || '');
  formData.append("file_url", video.url);
  formData.append("access_token", accessToken);
  formData.append("published", baseBody.published.toString());
  
  if (baseBody.scheduled_publish_time) {
    formData.append("scheduled_publish_time", baseBody.scheduled_publish_time.toString());
  }

  const fbResponse = await fetch(
    `https://graph.facebook.com/${pageId}/videos`,
    { method: "POST", body: formData }
  );

  return await fbResponse.json();
}

async function handlePollPost(pageId, message, additionalData, baseBody) {
  const pollOptions = additionalData.options?.filter((o) => o.trim() !== "") || [];
  
  const pollMessage = `${message || ''}
  
${additionalData.question || 'Poll'}

${pollOptions.map((o) => `• ${o}`).join("\n")}

🗳️ Poll ends in ${additionalData.duration || 7} days`;

  const fbResponse = await fetch(
    `https://graph.facebook.com/${pageId}/feed`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...baseBody,
        message: pollMessage,
      }),
    }
  );

  return await fbResponse.json();
}

async function handleLinkPost(pageId, message, additionalData, baseBody) {
  const fbResponse = await fetch(
    `https://graph.facebook.com/${pageId}/feed`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...baseBody,
        link: additionalData.link,
      }),
    }
  );

  return await fbResponse.json();
}

async function handleTextPost(pageId, baseBody) {
  const fbResponse = await fetch(
    `https://graph.facebook.com/${pageId}/feed`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(baseBody),
    }
  );

  return await fbResponse.json();
}

async function savePostToFirestore({
  postId,
  pageId,
  message,
  mediaUrls,
  postType,
  scheduledTime,
  additionalData,
  facebookPostId,
  status,
}) {
  await setDoc(doc(db, "facebook_posts", postId), {
    platform: "facebook",
    pageId,
    message: message?.trim() || '',
    mediaUrls: mediaUrls.length ? mediaUrls : null,
    postType,
    status,
    scheduledAt: scheduledTime || null,
    facebookPostId,
    additionalData: {
      ...additionalData,
      audience: additionalData.audience || "public",
      boost: additionalData.boost || null,
    },
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

// Export typed handlers
export const createFacebookTextPost = async (props) =>
  await createFacebookPostBase({ ...props, postType: "text" });

export const createFacebookImagePost = async (props) =>
  await createFacebookPostBase({ ...props, postType: "images" });

export const createFacebookVideoPost = async (props) =>
  await createFacebookPostBase({ ...props, postType: "video" });

export const createFacebookLinkPost = async (props) =>
  await createFacebookPostBase({ ...props, postType: "link" });

export const createFacebookPollPost = async (props) =>
  await createFacebookPostBase({ ...props, postType: "poll" });