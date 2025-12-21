"use server";

import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { verifyToken } from "@/lib/auth"; // your existing verifyToken logic
import { cookies } from "next/headers";

export async function checkFacebookConnection() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    const user = await verifyToken(token);
    if (!user) {
      return { connected: false, message: "Invalid token" };
    }

    // Query Firestore for Facebook account
    const q = query(
      collection(db, "socialAccounts"),
      where("userId", "==", user.id),
      where("platform", "==", "facebook"),
      where("status", "==", "active")
    );

    const snapshot = await getDocs(q);

    // Extract data if connected
    let accountData = null;
    if (!snapshot.empty) {
      const data = snapshot.docs[0].data();
      accountData = {
        connected: true,
        displayName: data.displayName || "Facebook Account",
        tokenExpiresAt: data.tokenExpiresAt?.toDate?.() || null,
        count: snapshot.size,
        accounts: snapshot.docs.map(d => ({
          displayName: d.data().displayName,
          tokenExpiresAt: d.data().tokenExpiresAt?.toDate?.() || null
        }))
      };
    }

    return accountData || { connected: false };
  } catch (err) {
    console.error("Error checking Facebook connection:", err);
    return { connected: false, message: err.message };
  }
}
