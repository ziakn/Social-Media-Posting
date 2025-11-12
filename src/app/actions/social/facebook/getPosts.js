"use server";

import { db } from "@/lib/firebase";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";

export async function getFacebookPosts() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    const user = await verifyToken(token);
    if (!user) {
      return { success: false, message: "Invalid token" };
    }

    const q = query(
      collection(db, "facebookPosts"),
      where("userId", "==", user.id),
      orderBy("createdAt", "desc")
    );

    const snapshot = await getDocs(q);
    const posts = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return { success: true, posts };
  } catch (err) {
    console.error("Error fetching Facebook posts:", err);
    return { success: false, message: err.message };
  }
}
