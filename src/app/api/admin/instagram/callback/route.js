import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { verifyToken } from "@/lib/auth";

export async function GET(request) {
  const sessionToken = request.cookies.get("token")?.value;
  const portalUser = await verifyToken(sessionToken);

  if (!portalUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const url = new URL(request.url);
    const code = url.searchParams.get("code");

    if (!code) {
      return NextResponse.json({ error: "Missing OAuth code" }, { status: 400 });
    }

    // 1. Exchange code → USER token (temporary)
    const tokenRes = await fetch(
      `https://graph.facebook.com/v24.0/oauth/access_token` +
      `?client_id=${process.env.FB_APP_ID}` +
      `&redirect_uri=${encodeURIComponent(process.env.IG_REDIRECT_URI)}` +
      `&client_secret=${process.env.FB_APP_SECRET}` +
      `&code=${code}`
    );

    const tokenData = await tokenRes.json();
    if (tokenData.error) {
      return NextResponse.json({ error: tokenData.error.message }, { status: 400 });
    }

    const userAccessToken = tokenData.access_token;

    // 2. Get pages user manages
    const pagesRes = await fetch(
      `https://graph.facebook.com/v24.0/me/accounts?access_token=${userAccessToken}`
    );
    const pagesData = await pagesRes.json();

    if (!Array.isArray(pagesData.data)) {
      return NextResponse.json({ error: "No pages found" }, { status: 400 });
    }

    let connectedCount = 0;

    // 3. For EACH page → check Instagram
    for (const page of pagesData.data) {
      if (!page.access_token) continue;

      const igRes = await fetch(
        `https://graph.facebook.com/v24.0/${page.id}` +
        `?fields=instagram_business_account,username` +
        `&access_token=${page.access_token}`
      );

      const igData = await igRes.json();

      if (!igData.instagram_business_account?.id) continue;

      // 4. Save ONE document per IG account
      await addDoc(collection(db, "socialAccounts"), {
        userId: portalUser.id,
        platform: "instagram",
        accountId: igData.instagram_business_account.id,
        username: igData.username || null,
        pageId: page.id,
        pageName: page.name,
        accessToken: page.access_token, // ✅ CORRECT TOKEN
        status: "active",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      connectedCount++;
    }

    // 5. Redirect back
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    return NextResponse.redirect(
      `${baseUrl}/admin/social/connect?platform=instagram&connected=${connectedCount}`
    );

  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
