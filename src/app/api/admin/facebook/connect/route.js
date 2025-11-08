import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";

// Endpoint to save user’s Facebook access token after OAuth
export async function POST(req) {
  try {
    const { userId, accessToken, fbUserId, name } = await req.json();

    if (!userId || !accessToken || !fbUserId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const accountsRef = db.collection("social_accounts");
    
    // Check if already exists
    const snapshot = await accountsRef
      .where("userId", "==", userId)
      .where("provider", "==", "facebook")
      .where("providerUserId", "==", fbUserId)
      .get();

    if (!snapshot.empty) {
      return NextResponse.json({ message: "Facebook account already connected" });
    }

    // Save new account
    await accountsRef.add({
      userId,
      provider: "facebook",
      providerUserId: fbUserId,
      name,
      accessToken,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({ message: "Facebook account connected successfully" });
  } catch (error) {
    console.error("Error connecting Facebook account:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
