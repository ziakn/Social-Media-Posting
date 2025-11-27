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
    const isConnected = !snapshot.empty;

    return { connected: isConnected };
  } catch (err) {
    console.error("Error checking Facebook connection:", err);
    return { connected: false, message: err.message };
  }
}
