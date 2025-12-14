"use server";

import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

export async function fetchInstagramAccounts() {
  try {
    const token = (await cookies()).get("token")?.value;
    const user = await verifyToken(token);

    if (!user) return { success: false, message: "Invalid or expired token", accounts: [] };

    const q = query(
      collection(db, "socialAccounts"),
      where("userId", "==", user.id),
      where("platform", "==", "instagram"),
      where("status", "==", "active")
    );

    const snapshot = await getDocs(q);
    const accounts = snapshot.docs.map(docSnap => {
      const data = docSnap.data();
      return {
        igUserId: data.accountId,
        displayName: data.pageName || data.username || "Instagram Account",
        username: data.username || "",
        accessToken: data.accessToken,
        tokenExpiresAt: data.tokenExpiresAt?.toMillis
          ? new Date(data.tokenExpiresAt.toMillis())
          : data.tokenExpiresAt || null,
      };
    });

    return { success: true, accounts };
  } catch (err) {
    console.error("Error fetching Instagram accounts:", err);
    return { success: false, message: err.message, accounts: [] };
  }
}
