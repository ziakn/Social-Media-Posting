import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, updateDoc, doc } from "firebase/firestore";

export async function POST(req) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    console.error("Webhook signature verification failed:", error.message);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const session = event.data.object;

  switch (event.type) {
    case "checkout.session.completed": {
      const userId = session.metadata?.userId;
      const coinAmount = parseInt(session.metadata?.coinAmount || "0");

      if (userId && coinAmount > 0) {
        try {
          const { increment, doc, getDoc, updateDoc, collection, query, where, getDocs } = await import("firebase/firestore");
          
          // 1. Try finding by direct document ID (most common)
          const userRef = doc(db, "users", userId);
          const userSnap = await getDoc(userRef);

          if (userSnap.exists()) {
            await updateDoc(userRef, {
              coinBalance: increment(coinAmount),
              updated_at: new Date(),
            });
            console.log(`Successfully credited ${coinAmount} coins to user ${userId} via direct ID`);
          } else {
            // 2. If not found, try finding by field 'id' (for legacy/inconsistent users)
            const q = query(collection(db, "users"), where("id", "==", userId));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
              const userDoc = querySnapshot.docs[0];
              await updateDoc(doc(db, "users", userDoc.id), {
                coinBalance: increment(coinAmount),
                updated_at: new Date(),
              });
              console.log(`Successfully credited ${coinAmount} coins to user ${userId} via field query`);
            } else {
              console.error(`User ${userId} not found in Firestore during webhook recharge`);
            }
          }
        } catch (err) {
          console.error(`Error processing webhook recharge for user ${userId}:`, err);
        }
      }
      break;
    }
    case "customer.subscription.updated": {
      // Keep for legacy or if still needed, but primarily we use coins now
      const subscription = await stripe.subscriptions.retrieve(session.subscription || session.id);
      const userId = session.metadata?.userId;
      // ... same logic as before if needed
      break;
    }
    case "customer.subscription.deleted": {
      const subscription = session;
      const customers = await stripe.customers.retrieve(subscription.customer);
      const userId = customers.metadata?.userId;

      if (userId) {
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("id", "==", userId));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const userDoc = querySnapshot.docs[0];
          await updateDoc(doc(db, "users", userDoc.id), {
            subscriptionStatus: "canceled",
            updated_at: new Date(),
          });
        }
      }
      break;
    }
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
