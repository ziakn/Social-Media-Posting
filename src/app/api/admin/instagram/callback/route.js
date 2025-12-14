"use server";

import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, query, where, getDocs } from "firebase/firestore";
import { verifyToken } from "@/lib/auth";

/**
 * Callback endpoint for Instagram OAuth
 */
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

    // 1. Exchange code → short-lived user access token
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

    const shortLivedUserToken = tokenData.access_token;

    // 2. Exchange for long-lived token (~60 days)
    const longLivedRes = await fetch(
      `https://graph.facebook.com/v24.0/oauth/access_token?` +
      `grant_type=fb_exchange_token&` +
      `client_id=${process.env.FB_APP_ID}&` +
      `client_secret=${process.env.FB_APP_SECRET}&` +
      `fb_exchange_token=${shortLivedUserToken}`
    );

    const longLivedData = await longLivedRes.json();
    if (longLivedData.error) {
      return NextResponse.json({ error: longLivedData.error.message }, { status: 400 });
    }

    const userAccessToken = longLivedData.access_token;

    // 3. Fetch Facebook Pages the user manages
    const pagesRes = await fetch(
      `https://graph.facebook.com/v24.0/me/accounts?access_token=${userAccessToken}`
    );
    const pagesData = await pagesRes.json();

    if (!Array.isArray(pagesData.data) || pagesData.data.length === 0) {
      return NextResponse.json({ error: "No Facebook Pages found" }, { status: 400 });
    }

    let connectedCount = 0;

    for (const page of pagesData.data) {
      try {
        if (!page.access_token) continue;

        // 4. Fetch Instagram Business/Creator account linked to the Page
        const igRes = await fetch(
          `https://graph.facebook.com/v24.0/${page.id}?fields=instagram_business_account,username&access_token=${page.access_token}`
        );
        const igData = await igRes.json();

        if (!igData.instagram_business_account?.id) continue;

        const igId = igData.instagram_business_account.id;

        // 5. Check if account already exists
        const existingQuery = query(
          collection(db, "socialAccounts"),
          where("userId", "==", portalUser.id),
          where("accountId", "==", igId)
        );
        const existingSnapshot = await getDocs(existingQuery);

        if (!existingSnapshot.empty) {
          // If the account exists but inactive, reactivate it
          const docRef = existingSnapshot.docs[0].ref;
          await docRef.update({
            status: "active",
            accessToken: page.access_token,
            tokenExpiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
            updatedAt: serverTimestamp(),
          });
          connectedCount++;
          continue; // Skip creating a new doc
        }


        // 6. Save to Firestore
        await addDoc(collection(db, "socialAccounts"), {
          userId: portalUser.id,
          platform: "instagram",
          accountId: igId,
          username: igData.username || null,
          pageId: page.id,
          pageName: page.name,
          accessToken: page.access_token,
          tokenExpiresAt: new Date(Date.now() + (60 * 24 * 60 * 60 * 1000)), // 60 days
          status: "active",
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });

        connectedCount++;
      } catch (errPage) {
        console.error(`Failed to connect page ${page.name}:`, errPage.message);
        continue; // Continue with other pages
      }
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    return NextResponse.redirect(
      `${baseUrl}/admin/social/connect?platform=instagram&connected=${connectedCount}`
    );
  } catch (err) {
    console.error("Instagram OAuth callback error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
