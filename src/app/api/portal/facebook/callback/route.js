import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, getDocs, query, where, updateDoc } from "firebase/firestore";
import { verifyToken } from "@/lib/auth"; // your JWT or session logic


export async function GET(request) {


  const user = await verifyToken();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const url = new URL(request.url);
    const code = url.searchParams.get("code");

    if (!code) {
      return NextResponse.json({ error: "Missing code" }, { status: 400 });
    }

    // Exchange code for short-lived access token
    const shortLivedToken = await exchangeCodeForToken(code);

    // Exchange for long-lived access token (60 days)
    const longLivedToken = await exchangeForLongLivedToken(shortLivedToken);

    // Get user profile from Facebook using LONG-LIVED token
    const userRes = await fetch(
      `https://graph.facebook.com/me?fields=id,name,email&access_token=${longLivedToken}`
    );
    const fbUser = await userRes.json();

    // Get pages managed by the user using LONG-LIVED token
    const pagesRes = await fetch(
      `https://graph.facebook.com/me/accounts?access_token=${longLivedToken}`
    );
    const pagesData = await pagesRes.json();

    const portalUserId = user.id;

    if (!portalUserId) {
      return NextResponse.json({ error: "Missing portal user ID" }, { status: 400 });
    }

    // Before insertion: deactivate existing active records for this user and platform
    // Store in pending_connections collection instead of socialAccounts
    const pendingDoc = await addDoc(collection(db, "pending_connections"), {
      userId: portalUserId,
      platform: "facebook",
      platformUserId: fbUser.id,
      displayName: fbUser.name,
      accessToken: longLivedToken,
      refreshToken: "",
      tokenExpiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
      pages: pagesData.data?.map(p => ({
        pageId: p.id,
        pageName: p.name,
        pageAccessToken: p.access_token
      })) || [],
      status: "pending",
      createdAt: serverTimestamp()
    });

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    return NextResponse.redirect(
      `${baseUrl}/portal/social/connect?status=pending&platform=facebook&pendingId=${pendingDoc.id}`
    );

  } catch (error) {
    console.error("Facebook OAuth callback error:", error);
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    return NextResponse.redirect(
      `${baseUrl}/portal/social/connect?status=failed&platform=facebook&message=${encodeURIComponent(error.message)}`
    );
  }
}

// --- Helper Functions ---

async function exchangeCodeForToken(code) {
  const res = await fetch(
    `https://graph.facebook.com/v24.0/oauth/access_token` +
    `?client_id=${process.env.FACEBOOK_APP_ID}` +
    `&redirect_uri=${encodeURIComponent(process.env.FACEBOOK_REDIRECT_URI)}` +
    `&client_secret=${process.env.FACEBOOK_APP_SECRET}` +
    `&code=${code}`
  );
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return data.access_token;
}

async function exchangeForLongLivedToken(shortLivedToken) {
  const res = await fetch(
    `https://graph.facebook.com/v24.0/oauth/access_token?` +
    `grant_type=fb_exchange_token&` +
    `client_id=${process.env.FACEBOOK_APP_ID}&` +
    `client_secret=${process.env.FACEBOOK_APP_SECRET}&` +
    `fb_exchange_token=${shortLivedToken}`
  );
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return data.access_token;
}
