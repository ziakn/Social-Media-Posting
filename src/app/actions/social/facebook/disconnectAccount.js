// src/app/(actions)/social/facebook/disconnectAccount.js
"use server";

import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, deleteDoc, doc } from "firebase/firestore";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";

export async function disconnectFacebookAccount() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("token")?.value;

    const user = await verifyToken(token);
    if (!user) {
      return { success: false, message: "Invalid or expired token" };
    }

    // Query Firestore for Facebook account
    const q = query(
      collection(db, "socialAccounts"),
      where("userId", "==", user.id),
      where("platform", "==", "facebook")
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return { success: false, message: "Facebook account not connected" };
    }

    // Delete each connected Facebook record
    await Promise.all(snapshot.docs.map((docSnap) => deleteDoc(doc(db, "socialAccounts", docSnap.id))));

    return { success: true, message: "Facebook disconnected successfully" };
  } catch (err) {
    console.error("Error disconnecting Facebook:", err);
    return { success: false, message: err.message };
  }
}
