"use server";

import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { verifyToken } from "@/lib/auth"; // your existing verifyToken logic

export async function checkFacebookConnection() {
  try {
    const user = await verifyToken();
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

      let totalPages = 0;
      snapshot.docs.forEach(doc => {
        const d = doc.data();
        totalPages += (Array.isArray(d.pages) && d.pages.length > 0) ? d.pages.length : 1;
      });

      accountData = {
        connected: true,
        displayName: data.displayName || "Facebook Account",
        tokenExpiresAt: data.tokenExpiresAt?.toDate?.().toISOString() || null,
        count: totalPages,
        accounts: snapshot.docs.map(d => {
          const accData = d.data();
          return {
            id: d.id,
            displayName: accData.displayName,
            tokenExpiresAt: accData.tokenExpiresAt?.toDate?.().toISOString() || null
          };
        })
      };
    }

    return accountData || { connected: false };
  } catch (err) {
    console.error("Error checking Facebook connection:", err);
    return { connected: false, message: err.message };
  }
}
