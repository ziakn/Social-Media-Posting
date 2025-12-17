"use server";

import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, query, where, getDocs, updateDoc } from "firebase/firestore";
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

    // --- 1. Deactivate existing Instagram accounts for this user ---
    const q = query(
      collection(db, "socialAccounts"),
      where("userId", "==", portalUser.id),
      where("platform", "==", "instagram"),
      where("status", "==", "active")
    );
    const existingSnapshot = await getDocs(q);

    // Run in parallel
    await Promise.all(
      existingSnapshot.docs.map((doc) =>
        updateDoc(doc.ref, {
          status: "inactive",
          updatedAt: serverTimestamp(),
        })
      )
    );

    // --- 2. Exchange code for access token ---
    const shortLivedToken = await exchangeCodeForToken(code);
    const userAccessToken = await exchangeForLongLivedToken(shortLivedToken);

    // --- 3. Fetch Pages and Instagram Accounts ---
    const pages = await getPages(userAccessToken);

    if (!Array.isArray(pages) || pages.length === 0) {
      return NextResponse.json({ error: "No Facebook Pages found" }, { status: 400 });
    }

    let connectedCount = 0;

    for (const page of pages) {
      try {
        if (!page.access_token) continue;

        const igData = await getInstagramBusinessAccount(page.id, page.access_token);
        if (!igData.instagram_business_account?.id) continue;

        const igId = igData.instagram_business_account.id;

        // --- 4. Insert NEW document (Active) ---
        // We do not check for existing; we just insert a fresh record.
        // Previous active records are already deactivated.
        await addDoc(collection(db, "socialAccounts"), {
          userId: portalUser.id,
          platform: "instagram",
          accountId: igId,
          username: igData.username || null,
          pageId: page.id,
          pageName: page.name,
          accessToken: page.access_token,
          tokenExpiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
          status: "active",
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });

        connectedCount++;
      } catch (errPage) {
        console.error(`Failed to connect page ${page.name}:`, errPage.message);
        continue;
      }
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    if (connectedCount > 0) {
      return NextResponse.redirect(
        `${baseUrl}/admin/social/connect?platform=instagram&status=success&connected=${connectedCount}`
      );
    } else {
      return NextResponse.redirect(
        `${baseUrl}/admin/social/connect?platform=instagram&status=failed&message=No%20Instagram%20accounts%20found`
      );
    }

  } catch (err) {
    console.error("Instagram OAuth callback error:", err);
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    return NextResponse.redirect(
      `${baseUrl}/admin/social/connect?platform=instagram&status=failed&message=${encodeURIComponent(
        err.message
      )}`
    );
  }
}

// --- Helper Functions ---

async function exchangeCodeForToken(code) {
  const res = await fetch(
    `https://graph.facebook.com/v24.0/oauth/access_token` +
    `?client_id=${process.env.FB_APP_ID}` +
    `&redirect_uri=${encodeURIComponent(process.env.IG_REDIRECT_URI)}` +
    `&client_secret=${process.env.FB_APP_SECRET}` +
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
    `client_id=${process.env.FB_APP_ID}&` +
    `client_secret=${process.env.FB_APP_SECRET}&` +
    `fb_exchange_token=${shortLivedToken}`
  );
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return data.access_token;
}

async function getPages(userAccessToken) {
  const res = await fetch(
    `https://graph.facebook.com/v24.0/me/accounts?access_token=${userAccessToken}`
  );
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return data.data || [];
}

async function getInstagramBusinessAccount(pageId, pageAccessToken) {
  const res = await fetch(
    `https://graph.facebook.com/v24.0/${pageId}?fields=instagram_business_account,username&access_token=${pageAccessToken}`
  );
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return data;
}
