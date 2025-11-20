"use server";

import { db, storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

/**
 * Base function to create a Facebook post
 * Handles text, image, video, link, and poll posts
 */
async function createFacebookPostBase({
  pageId,
  accessToken,
  message,
  files = [],
  scheduledTime,
  postType,
  additionalData = {},
}) {
  try {
    // Upload media files to Firebase Storage
    const mediaUrls = [];
    for (const file of files) {
      if (file && file.file) {
        const storageRef = ref(storage, `facebook/${Date.now()}-${file.name}`);
        await uploadBytes(storageRef, file.file);
        const mediaUrl = await getDownloadURL(storageRef);
        mediaUrls.push({ url: mediaUrl, type: file.type, name: file.name });
      }
    }

    // Determine scheduled publish time (if any)
    const publishTime = scheduledTime
      ? Math.floor(new Date(scheduledTime).getTime() / 1000)
      : undefined;

    let fbResponse;

    // Base request body
    const bodyJSON = {
      message,
      access_token: accessToken,
      published: scheduledTime ? false : true,
      scheduled_publish_time: publishTime,
    };

    // Handle different post types
    if (postType === "images" && mediaUrls.length > 1) {
      bodyJSON.message += `\n\n📸 ${mediaUrls.length} images attached`;
      fbResponse = await fetch(
        `https://graph.facebook.com/${pageId}/feed`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(bodyJSON),
        }
      );
    } else if (postType === "video" && mediaUrls.length) {
      const formData = new FormData();
      formData.append("description", message);
      formData.append("file_url", mediaUrls[0].url);
      formData.append("access_token", accessToken);
      if (scheduledTime) {
        formData.append("published", "false");
        formData.append("scheduled_publish_time", publishTime);
      }
      fbResponse = await fetch(`https://graph.facebook.com/${pageId}/videos`, {
        method: "POST",
        body: formData,
      });
    } else if (postType === "poll") {
      const pollOptions = additionalData.options?.filter((opt) => opt.trim() !== "") || [];
      bodyJSON.message = `${message}\n\n📊 ${additionalData.question}\n\n${pollOptions
        .map((o) => `• ${o}`)
        .join("\n")}\n\n🗳️ Poll ends in ${additionalData.duration} days`;
      fbResponse = await fetch(
        `https://graph.facebook.com/${pageId}/feed`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(bodyJSON),
        }
      );
    } else if (postType === "link") {
      bodyJSON.link = additionalData.link;
      fbResponse = await fetch(
        `https://graph.facebook.com/${pageId}/feed`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(bodyJSON),
        }
      );
    } else {
      fbResponse = await fetch(
        `https://graph.facebook.com/${pageId}/feed`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(bodyJSON),
        }
      );
    }

    const fbData = await fbResponse.json();
    if (fbData.error) throw new Error(fbData.error.message);

    // Save post in Firestore
    const postId = fbData.id || `facebook_${Date.now()}`;
    const postData = {
      platform: "facebook",
      pageId,
      message,
      mediaUrls: mediaUrls.length ? mediaUrls : null,
      postType,
      status: scheduledTime ? "scheduled" : "posted",
      scheduledAt: scheduledTime || null,
      facebookPostId: fbData.id || null,
      additionalData,
      audience: additionalData.audience || "public",
      boost: additionalData.boost || null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await setDoc(doc(db, "facebook_posts", postId), postData);

    return {
      success: true,
      fbData,
      postId,
      message: scheduledTime
        ? "Post scheduled successfully"
        : "Post published successfully",
    };
  } catch (error) {
    console.error("Facebook Post Error:", error);
    return {
      success: false,
      error: error.message,
      message: `Failed to create post: ${error.message}`,
    };
  }
}

// Export async server actions for each post type
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
