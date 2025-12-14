"use server";

import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

// Fetch posts for a given Instagram Business account
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
