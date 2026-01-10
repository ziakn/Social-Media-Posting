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

    // --- 1. Exchange code for tokens ---
    const shortLivedToken = await exchangeCodeForToken(code);
    const userAccessToken = await exchangeForLongLivedToken(shortLivedToken);

    // --- 2. Fetch Instagram User Data ---
    const igUser = await getInstagramUser(userAccessToken);

    if (!igUser.user_id) {
      return NextResponse.json({ error: "Failed to fetch Instagram user data" }, { status: 400 });
    }

    // --- 3. Check if this specific account is already connected ---
    const q = query(
      collection(db, "socialAccounts"),
      where("userId", "==", portalUser.id),
      where("platform", "==", "instagram"),
      where("accountId", "==", igUser.user_id)
    );
    const existingSnapshot = await getDocs(q);

    if (!existingSnapshot.empty) {
      // Update existing account
      const docRef = existingSnapshot.docs[0].ref;
      await updateDoc(docRef, {
        accessToken: userAccessToken,
        username: igUser.username || null,
        tokenExpiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
        status: "active",
        updatedAt: serverTimestamp(),
      });
    } else {
      // Insert NEW account
      await addDoc(collection(db, "socialAccounts"), {
        userId: portalUser.id,
        platform: "instagram",
        accountId: igUser.user_id,
        username: igUser.username || null,
        accessToken: userAccessToken,
        tokenExpiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
        status: "active",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    return NextResponse.redirect(
      `${baseUrl}/admin/social/connect?platform=instagram&status=success&connected=1&name=${encodeURIComponent(igUser.username)}`
    );

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
  const formData = new FormData();
  formData.append("client_id", process.env.INSTAGRAM_APP_ID);
  formData.append("client_secret", process.env.INSTAGRAM_APP_SECRET);
  formData.append("grant_type", "authorization_code");
  formData.append("redirect_uri", process.env.INSTAGRAM_REDIRECT_URI);
  formData.append("code", code);

  const res = await fetch("https://api.instagram.com/oauth/access_token", {
    method: "POST",
    body: formData,
  });
  const data = await res.json();
  if (data.error_message) throw new Error(data.error_message);
  if (data.error) throw new Error(data.error.message || data.error);
  return data.access_token;
}

async function exchangeForLongLivedToken(shortLivedToken) {
  const res = await fetch(
    `https://graph.instagram.com/access_token?grant_type=INSTAGRAM_exchange_token&client_secret=${process.env.INSTAGRAM_APP_SECRET}&access_token=${shortLivedToken}`
  );
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return data.access_token;
}

async function getInstagramUser(accessToken) {
  const res = await fetch(
    `https://graph.instagram.com/v24.0/me?fields=user_id,username&access_token=${accessToken}`
  );
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return data;
}
