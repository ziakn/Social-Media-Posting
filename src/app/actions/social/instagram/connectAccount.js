"use server";

import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";

export async function checkInstagramConnection() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    const user = await verifyToken(token);
    if (!user) {
      return { connected: false, message: "Invalid token" };
    }

    // Query Firestore for Instagram account
    const q = query(
      collection(db, "socialAccounts"),
      where("userId", "==", user.id),
      where("platform", "==", "instagram"),
      where("status", "==", "active")
    );

    const snapshot = await getDocs(q);

    let displayName = "";
    let tokenExpiresAt = null;

    if (!snapshot.empty) {
      const data = snapshot.docs[0].data();
      displayName = data.displayName || "";
      tokenExpiresAt = data.tokenExpiresAt?.toDate?.() || null;
    }

    const isConnected = !snapshot.empty;
    return { connected: isConnected, displayName, tokenExpiresAt };
  } catch (err) {
    console.error("Error checking Instagram connection:", err);
    return { connected: false, message: err.message };
  }
}
