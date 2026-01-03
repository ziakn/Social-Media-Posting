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

  const usersRef = collection(db, "users");
  const q = query(usersRef, where("id", "==", userId));
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) return PLANS.FREE;

  const userData = querySnapshot.docs[0].data();
  
  if (userData.subscriptionStatus !== 'active' && userData.subscriptionStatus !== 'trialing') {
    return PLANS.FREE;
  }

  // Map Price ID to Plan Name
  if (userData.plan === process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO) return PLANS.PRO;
  if (userData.plan === process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_STARTER) return PLANS.STARTER;
  
  return PLANS.FREE;
}

export async function canUserPost(userId) {
  const plan = await getUserPlan(userId);
  const limit = PLAN_LIMITS[plan].posts;
  
  if (limit === Infinity) return true;

  // Ideally, query the number of posts made this month
  // For now, let's assume we increment a postCount in the user doc
  // This part would need actual post tracking implementation
  return true; // Placeholder
}
