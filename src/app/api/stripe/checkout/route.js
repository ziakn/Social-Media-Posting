import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

export async function POST(req) {
  try {
    const { priceId, coinAmount } = await req.json();

    const user = await verifyToken();
    if (!user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const isBypassEnabled = process.env.BYPASS_STRIPE_FOR_TESTING === 'true';

    if (!isBypassEnabled && (priceId === 'price_...' || !priceId)) {
      return NextResponse.json({
        error: "Stripe Price ID is missing or invalid. Please set the real Price IDs in your .env file or enable BYPASS_STRIPE_FOR_TESTING for development."
      }, { status: 400 });
    }

    if (isBypassEnabled) {
      // Credit coins immediately for testing
      try {
        const { doc, updateDoc, increment, getDoc } = await import("firebase/firestore");
        const { db } = await import("@/lib/firebase");

        // Find user document - we need to find it by the field 'id' or document ID
        // To be safe, try direct document ID first
        const userRef = doc(db, "users", user.id);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          await updateDoc(userRef, {
            coinBalance: increment(coinAmount),
            updated_at: new Date()
          });
        } else {
          // If direct ID fails, try query by 'id' field
          const { collection, query, where, getDocs } = await import("firebase/firestore");
          const q = query(collection(db, "users"), where("id", "==", user.id));
          const snap = await getDocs(q);
          if (!snap.empty) {
            await updateDoc(doc(db, "users", snap.docs[0].id), {
              coinBalance: increment(coinAmount),
              updated_at: new Date()
            });
          }
        }
      } catch (err) {
        console.error("Bypass credit error:", err);
      }

      return NextResponse.json({
        url: `${process.env.NEXT_PUBLIC_BASE_URL}/admin/dashboard?success=true&bypass=true`
      });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/admin/dashboard?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/pricing?canceled=true`,
      metadata: {
        userId: user.id || user.uid,
        coinAmount: coinAmount.toString(),
      },
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error("Checkout session error:", error);
    return NextResponse.json({ error: error.message || "An unexpected error occurred" }, { status: 500 });
  }
}
