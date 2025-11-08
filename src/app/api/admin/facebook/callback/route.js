import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";

// This route handles OAuth callback from Facebook
export async function GET(req) {
  try {
    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state"); // can be your userId or CSRF token

    if (!code) {
      return NextResponse.json({ error: "No code provided" }, { status: 400 });
    }

    // Exchange code for access token
    const clientId = process.env.FB_APP_ID;
    const clientSecret = process.env.FB_APP_SECRET;
    const redirectUri = process.env.FB_REDIRECT_URI; // this route URL

    const tokenRes = await fetch(
      `https://graph.facebook.com/v17.0/oauth/access_token?client_id=${clientId}&redirect_uri=${redirectUri}&client_secret=${clientSecret}&code=${code}`
    );
    const tokenData = await tokenRes.json();

    if (tokenData.error) {
      return NextResponse.json({ error: tokenData.error.message }, { status: 400 });
    }

    const accessToken = tokenData.access_token;

    // Get user info
    const userRes = await fetch(
      `https://graph.facebook.com/me?fields=id,name,email&access_token=${accessToken}`
    );
    const fbUser = await userRes.json();

    if (fbUser.error) {
      return NextResponse.json({ error: fbUser.error.message }, { status: 400 });
    }

    // Optionally, store in Firebase here, or let frontend call `connect` API
    return NextResponse.json({
      accessToken,
      fbUserId: fbUser.id,
      name: fbUser.name,
      email: fbUser.email || null,
      state, // send back state to identify SocialHub user
    });
  } catch (error) {
    console.error("Facebook callback error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
