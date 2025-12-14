"use server";

import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

export async function fetchInstagramAccounts() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    const user = await verifyToken(token);

    if (!user) {
      return { success: false, message: "Invalid or expired token", accounts: [] };
    }

    // Query all active Instagram accounts for the user
    const q = query(
      collection(db, "socialAccounts"),
      where("userId", "==", user.id),
      where("platform", "==", "instagram"),
      where("status", "==", "active")
    );

    const snapshot = await getDocs(q);
    const accounts = [];

    snapshot.forEach((docSnap) => {
      const data = docSnap.data();

      // New structure: One document per account (accountId is the IG Business ID)
      if (data.accountId) {
        accounts.push({
          igUserId: data.accountId,
          displayName: data.pageName || data.username || "Instagram Account",
          username: data.username || "",
          accessToken: data.accessToken,
          tokenExpiresAt: data.tokenExpiresAt?.toMillis
            ? new Date(data.tokenExpiresAt.toMillis())
            : data.tokenExpiresAt || null,
        });
      }
      // Legacy structure: Nested accounts/pages array
      else {
        const linkedAccounts = data.accounts || data.pages || [];
        if (linkedAccounts.length > 0) {
          linkedAccounts.forEach((p) => {
            accounts.push({
              igUserId: p.igUserId || p.pageId,
              displayName: p.pageName || data.displayName || "Instagram Account",
              username: p.username || "",
              accessToken: p.pageAccessToken || data.accessToken,
              tokenExpiresAt: data.tokenExpiresAt?.toMillis
                ? new Date(data.tokenExpiresAt.toMillis())
                : data.tokenExpiresAt || null,
            });
          });
        }
      }
    });

    return { success: true, accounts };
  } catch (err) {
    console.error("Error fetching Instagram accounts:", err);
    return { success: false, message: err.message, accounts: [] };
  }
}
