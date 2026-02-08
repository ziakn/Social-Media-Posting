// app/actions/social/facebook/createPost.js
"use server";

import { db } from "@/lib/firebase";
import { doc, setDoc, serverTimestamp, collection } from "firebase/firestore";
import { fetchFacebookPages } from "./getPages";
import { verifyToken } from "@/lib/auth";
import { syncPostJob } from "@/lib/queue/queues";
import { incrementUsage } from "@/app/actions/usage/incrementUsage";

/**
 * Enhanced base function to create a Facebook post (Queued)
 */
export async function createFacebookPostBase({
  pageId,
  message,
  mediaUrls = [],
  scheduledTime,
  postType,
  additionalData = {},
}) {
  try {
    const payload = await verifyToken();

    if (!payload) {
      return { success: false, message: "Invalid or expired token" };
    }

    console.log(`[Facebook Action] User ${payload.email} (${payload.id}) initiated a post.`);

    // Check Usage Limit
    const { checkUsageLimitAction } = await import("@/app/actions/usage/usageActions");
    const usageCheck = await checkUsageLimitAction('post');
    if (!usageCheck.success) {
      return { success: false, message: usageCheck.error };
    }

    const userId = payload.id || payload.uid;

    const { pages } = await fetchFacebookPages();
    const page = pages.find((p) => String(p.pageId) === String(pageId));

    if (!page) {
      return { success: false, message: "Facebook page not found" };
    }

    // Generate a proper Firestore ID
    const postRef = doc(collection(db, "facebook_posts"));
    const postId = postRef.id;

    const delay = scheduledTime ? Math.max(0, new Date(scheduledTime).getTime() - Date.now()) : 0;

    // Save to Firestore
    await setDoc(postRef, {
      platform: "facebook",
      delete: 0,
      pageId,
      accountId: page.accountId, // Reference to socialAccount doc
      userId,
      message: message?.trim() || '',
      mediaUrls: mediaUrls.length ? mediaUrls : null,
      postType,
      status: "scheduled",
      scheduledAt: scheduledTime ? new Date(scheduledTime) : serverTimestamp(),
      additionalData: {
        ...additionalData,
        audience: additionalData.audience || "public",
      },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // Synchronize with Queue
    await syncPostJob("facebook", postId, {
      postId,
      pageId,
      accountId: page.accountId,
      userId,
      userEmail: payload.email
    }, { delay });

    // 4. Increment Usage Counter (Cost Optimization)
    await incrementUsage(userId);

    return {
      success: true,
      postId,
      message: scheduledTime
        ? "Post scheduled successfully"
        : "Post submission queued",
    };

  } catch (error) {
    console.error("Facebook post creation error:", error);
    return {
      success: false,
      error: error.message,
      message: `Failed to queue post: ${error.message}`,
    };
  }
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