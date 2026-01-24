"use server";

import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { verifyToken } from "@/lib/auth";

export async function checkInstagramConnection() {
  try {
    const user = await verifyToken();
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

    const accounts = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      accounts.push({
        id: doc.id,
        displayName: data.username || data.displayName || "Instagram Account",
        username: data.username,
        tokenExpiresAt: data.tokenExpiresAt?.toDate?.().toISOString() || null,
        status: data.status
      });
    });

    const isConnected = accounts.length > 0;

    return {
      connected: isConnected,
      count: accounts.length,
      accounts: accounts,
      // Fallback for UI components expecting single values
      displayName: accounts[0]?.displayName || "",
      tokenExpiresAt: accounts[0]?.tokenExpiresAt || null
    };
  } catch (err) {
    console.error("Error checking Instagram connection:", err);
    return { connected: false, message: err.message };
  }
}
