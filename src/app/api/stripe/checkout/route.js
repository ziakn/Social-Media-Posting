import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

export async function POST(req) {
  try {
    const { priceId } = await req.json();
    const token = (await cookies()).get('token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await verifyToken(token);
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
      return NextResponse.json({ 
        url: `${process.env.NEXT_PUBLIC_BASE_URL}/pricing?success=true&bypass=true` 
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
      mode: "subscription",
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/pricing?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/pricing?canceled=true`,
      metadata: {
        userId: user.id,
      },
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error("Checkout session error:", error);
    return NextResponse.json({ error: error.message || "An unexpected error occurred" }, { status: 500 });
  }
}
