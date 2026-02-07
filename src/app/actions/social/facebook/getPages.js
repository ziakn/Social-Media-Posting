"use server";

import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { verifyToken } from "@/lib/auth";

export async function fetchFacebookPages() {
  try {
    const user = await verifyToken();

    if (!user) {
      return { success: false, message: "Invalid or expired token", pages: [] };
    }

    const q = query(
      collection(db, "socialAccounts"),
      where("userId", "==", user.id),
      where("platform", "==", "facebook"),
      where("status", "==", "active")
    );

    const snapshot = await getDocs(q);
    const pages = [];

    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      if (data.pages?.length) {
        data.pages.forEach((p) => {
          pages.push({
            pageId: p.pageId,
            pageName: p.pageName,
            accessToken: p.pageAccessToken || p.pageAccessTokean || p.accessToken,
            userId: data.userId,
            accountId: docSnap.id, // Essential for optimized worker lookup
          });
        });
      }
    });

    // Deduplicate pages by pageId
    const uniquePages = Array.from(
      new Map(pages.map(page => [page.pageId, page])).values()
    );

    return { success: true, pages: uniquePages };
  } catch (err) {
    console.error("Error fetching Facebook pages:", err);
    return { success: false, message: err.message, pages: [] };
  }
}
