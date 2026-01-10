import { db } from "./firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

export const PLANS = {
  FREE: 'free',
  STARTER: 'starter',
  PRO: 'pro'
};

const PLAN_LIMITS = {
  [PLANS.FREE]: { posts: 5 },
  [PLANS.STARTER]: { posts: 50 },
  [PLANS.PRO]: { posts: Infinity }
};

export async function getUserPlan(userId) {
  if (!userId) return PLANS.FREE;

  try {
    const { doc, getDoc, collection, query, where, getDocs } = await import("firebase/firestore");
    
    // 1. Try direct doc ID
    const directDocRef = doc(db, "users", userId);
    const directDocSnap = await getDoc(directDocRef);
    
    let userData = null;
    if (directDocSnap.exists()) {
      userData = directDocSnap.data();
    } else {
      // 2. Try field query
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("id", "==", userId));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        userData = querySnapshot.docs[0].data();
      }
    }

    if (!userData) return PLANS.FREE;
    return userData.coinBalance > 0 ? 'ACTIVE_COINS' : PLANS.FREE;
  } catch (err) {
    console.error("getUserPlan error:", err);
    return PLANS.FREE;
  }
}

export async function spendCoin(userId) {
  if (!userId) return { success: false, message: "User ID required" };

  try {
    const { doc, getDoc, updateDoc, increment, collection, query, where, getDocs } = await import("firebase/firestore");
    
    let userDocId = null;
    let currentBalance = 0;

    // 1. Try direct doc ID
    const directDocRef = doc(db, "users", userId);
    const directDocSnap = await getDoc(directDocRef);

    if (directDocSnap.exists()) {
      userDocId = userId;
      currentBalance = directDocSnap.data().coinBalance || 0;
    } else {
      // 2. Try field query
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("id", "==", userId));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        userDocId = querySnapshot.docs[0].id;
        currentBalance = querySnapshot.docs[0].data().coinBalance || 0;
      }
    }

    if (!userDocId) return { success: false, message: "User not found" };

    if (currentBalance <= 0) {
      return { success: false, message: "Insufficient coins. Please buy more coins to post." };
    }

    await updateDoc(doc(db, "users", userDocId), {
      coinBalance: increment(-1),
      updatedAt: new Date(),
    });
    
    return { success: true };
  } catch (error) {
    console.error("Error spending coin:", error);
    return { success: false, message: "Failed to deduct coin" };
  }
}
