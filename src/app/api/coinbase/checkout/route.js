import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

export async function POST(req) {
  try {
    const { coinAmount, price } = await req.json();
    const token = (await cookies()).get('token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await verifyToken(token);
    if (!user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    if (!process.env.COINBASE_COMMERCE_API_KEY) {
      return NextResponse.json({ error: "Coinbase API Key is missing. Please set COINBASE_COMMERCE_API_KEY in your .env file." }, { status: 500 });
    }

    const response = await fetch("https://api.commerce.coinbase.com/charges", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CC-Api-Key": process.env.COINBASE_COMMERCE_API_KEY,
        "X-CC-Version": "2018-03-22",
      },
      body: JSON.stringify({
        name: `${coinAmount} Coins Pack`,
        description: `Purchase of ${coinAmount} coins for Social Media Posting.`,
        pricing_type: "fixed_price",
        local_price: {
          amount: price,
          currency: "USD",
        },
        metadata: {
          userId: user.id || user.uid,
          coinAmount: coinAmount,
        },
        redirect_url: `${process.env.NEXT_PUBLIC_BASE_URL}/pricing?success=true`,
        cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/pricing?canceled=true`,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || "Failed to create Coinbase charge");
    }

    return NextResponse.json({ url: data.data.hosted_url });
  } catch (error) {
    console.error("Coinbase session error:", error);
    return NextResponse.json({ error: error.message || "An unexpected error occurred" }, { status: 500 });
  }
}
