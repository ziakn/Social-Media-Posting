"use server";

import { db, storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

export async function createFacebookPost({ pageId, accessToken, message, file, scheduledTime }) {
  try {
    // Upload media if exists
    let mediaUrl = null;
    if (file) {
      const storageRef = ref(storage, `facebook/${Date.now()}-${file.name}`);
      await uploadBytes(storageRef, file);
      mediaUrl = await getDownloadURL(storageRef);
    }

    // Send to Facebook Graph API
    let fbResponse;
    if (mediaUrl && file.type.startsWith("image")) {
      const formData = new FormData();
      formData.append("message", message);
      formData.append("url", mediaUrl);
      formData.append("access_token", accessToken);
      if (scheduledTime) {
        formData.append("published", "false");
        formData.append("scheduled_publish_time", Math.floor(new Date(scheduledTime).getTime() / 1000));
      }

      fbResponse = await fetch(`https://graph.facebook.com/${pageId}/photos`, {
        method: "POST",
        body: formData,
      });
    } else {
      fbResponse = await fetch(`https://graph.facebook.com/${pageId}/feed`, {
        method: "POST",
        body: new URLSearchParams({
          message,
          access_token: accessToken,
        }),
      });
    }

    const fbData = await fbResponse.json();

    // Save to Firestore
    await setDoc(doc(db, "social_posts", fbData.id || Date.now().toString()), {
      platform: "facebook",
      pageId,
      message,
      mediaUrl,
      status: scheduledTime ? "scheduled" : "posted",
      scheduledAt: scheduledTime || null,
      facebookPostId: fbData.id || null,
      createdAt: serverTimestamp(),
    });

    return { success: true, fbData };
  } catch (error) {
    console.error("Facebook Post Error:", error);
    return { success: false, error: error.message };
  }
}
