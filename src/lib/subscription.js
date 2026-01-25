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
    return PLANS.FREE;
  } catch (err) {
    console.error("getUserPlan error:", err);
    return PLANS.FREE;
  }
}
