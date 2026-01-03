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
    case "checkout.session.completed":
    case "customer.subscription.updated": {
      const subscription = await stripe.subscriptions.retrieve(session.subscription || session.id);
      const userId = session.metadata?.userId;

      if (userId) {
        // Query user doc by 'id' field because we used addDoc in register
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("id", "==", userId));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const userDoc = querySnapshot.docs[0];
          await updateDoc(doc(db, "users", userDoc.id), {
            subscriptionStatus: subscription.status,
            stripeSubscriptionId: subscription.id,
            stripeCustomerId: subscription.customer,
            plan: subscription.items.data[0].price.id, // Or map price ID to name
            updated_at: new Date(),
          });
        }
      }
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
