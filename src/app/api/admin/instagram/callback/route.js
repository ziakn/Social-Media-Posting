import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { verifyToken } from "@/lib/auth";

export async function GET(request) {
  const token = request.cookies.get("token")?.value;
  const user = await verifyToken(token);

  try {
    const url = new URL(request.url);
    const code = url.searchParams.get("code");

    if (!code) {
      return NextResponse.json({ error: "Missing code" }, { status: 400 });
    }

    // 1. Exchange code for short-lived token
    const tokenResponse = await fetch(
      `https://graph.facebook.com/v24.0/oauth/access_token?client_id=${
        process.env.FB_APP_ID
      }&redirect_uri=${encodeURIComponent(
        process.env.IG_REDIRECT_URI
      )}&client_secret=${process.env.FB_APP_SECRET}&code=${code}`
    );

    const tokenData = await tokenResponse.json();
    if (tokenData.error) {
      return NextResponse.json(
        { error: tokenData.error.message },
        { status: 400 }
      );
    }

    const accessToken = tokenData.access_token;

    // 2. Fetch FB user info
    const userRes = await fetch(
      `https://graph.facebook.com/me?fields=id,name,email&access_token=${accessToken}`
    );
    const fbUser = await userRes.json();

    // 3. Get pages the user manages
    const pagesRes = await fetch(
      `https://graph.facebook.com/me/accounts?access_token=${accessToken}`
    );
    const pagesData = await pagesRes.json();

    if (!user) {
      return NextResponse.json(
        { valid: false, message: "Invalid token" },
        { status: 403 }
      );
    }

    const portalUserId = user.id;
    if (!portalUserId) {
      return NextResponse.json(
        { error: "Missing portal user ID" },
        { status: 400 }
      );
    }

    // 4. Find IG business accounts linked to pages
    const instagramAccounts = [];
    for (const page of pagesData.data || []) {
      const igRes = await fetch(
        `https://graph.facebook.com/v24.0/${page.id}?fields=instagram_business_account&access_token=${page.access_token}`
      );
      const igData = await igRes.json();

      if (igData.instagram_business_account?.id) {
        instagramAccounts.push({
          igUserId: igData.instagram_business_account.id,
          pageId: page.id,
          pageName: page.name,
        });
      }
    }
    const expiresIn = tokenData.expires_in || 60 * 24 * 60 * 60; // fallback 60 days
    const tokenExpiresAt = new Date(Date.now() + expiresIn * 1000);
    // 5. Save to Firestore
    await addDoc(collection(db, "socialAccounts"), {
      userId: portalUserId,
      platform: "instagram",
      platformUserId: fbUser.id,
      displayName: fbUser.name,
      accessToken: accessToken,
      refreshToken: "",
      tokenExpiresAt,
      accounts: instagramAccounts,
      status: "active",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // 6. Redirect back to dashboard
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    return NextResponse.redirect(
      `${baseUrl}/admin/social/connect?status=success&platform=instagram&name=${encodeURIComponent(
        fbUser.name
      )}`
    );
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
