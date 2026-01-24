"use server";

import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, updateDoc, doc } from "firebase/firestore";
import { verifyToken } from "@/lib/auth";

export async function disconnectInstagramAccount(accountId = null) {
  try {
    const user = await verifyToken();
    if (!user) {
      return { success: false, message: "Invalid or expired token" };
    }

    if (accountId) {
      const ref = doc(db, "socialAccounts", accountId);
      await updateDoc(ref, { status: "inactive", accessToken: "" });
      return { success: true, message: "Account disconnected successfully" };
    }

    const q = query(
      collection(db, "socialAccounts"),
      where("userId", "==", user.id),
      where("platform", "==", "instagram"),
      where("status", "==", "active")
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return { success: false, message: "Instagram account not connected" };
    }

    await Promise.all(
      snapshot.docs.map(async (docSnap) => {
        const ref = doc(db, "socialAccounts", docSnap.id);
        await updateDoc(ref, { status: "inactive", accessToken: "" });
      })
    );

    return { success: true, message: "Instagram disconnected successfully" };
  } catch (err) {
    console.error("Error disconnecting Instagram:", err);
    return { success: false, message: err.message };
  }
}
