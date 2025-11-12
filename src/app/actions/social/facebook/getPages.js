"use server";

import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

export async function fetchFacebookPages() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    const user = await verifyToken(token);

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
            accessToken: p.pageAccessToken,
          });
        });
      }
    });

    return { success: true, pages };
  } catch (err) {
    console.error("Error fetching Facebook pages:", err);
    return { success: false, message: err.message, pages: [] };
  }
}
