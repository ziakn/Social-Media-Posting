import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, getDocs, query, where, updateDoc } from "firebase/firestore";
import { verifyToken } from "@/lib/auth"; // your JWT or session logic


export async function GET(request) {


  const token = request.cookies.get("token")?.value;
    const user = await verifyToken(token);


  try {
    const url = new URL(request.url);
    const code = url.searchParams.get("code");

    if (!code) {
      return NextResponse.json({ error: "Missing code" }, { status: 400 });
    }

    // Exchange code for access token
    const tokenResponse = await fetch(
      `https://graph.facebook.com/v24.0/oauth/access_token?client_id=${process.env.FB_APP_ID}&redirect_uri=${encodeURIComponent(
        process.env.FB_REDIRECT_URI
      )}&client_secret=${process.env.FB_APP_SECRET}&code=${code}`
    );

    const tokenData = await tokenResponse.json();
    if (tokenData.error) {
      return NextResponse.json({ error: tokenData.error.message }, { status: 400 });
    }

    const accessToken = tokenData.access_token;

    // Get user profile from Facebook
    const userRes = await fetch(
      `https://graph.facebook.com/me?fields=id,name,email&access_token=${accessToken}`
    );
    const fbUser = await userRes.json();

    // Get pages managed by the user (optional)
    const pagesRes = await fetch(
      `https://graph.facebook.com/me/accounts?access_token=${accessToken}`
    );
    const pagesData = await pagesRes.json();

  
    if (!user) {
      return NextResponse.json({ valid: false, message: "Invalid token" }, { status: 403 });
    }


    const portalUserId = user.id; // must be sent from frontend

    if (!portalUserId) {
      return NextResponse.json({ error: "Missing portal user ID" }, { status: 400 });
    }

    // Before insertion: deactivate existing active records for this user and platform
    const socialAccountsRef = collection(db, "socialAccounts");
    const q = query(socialAccountsRef, where("userId", "==", portalUserId), where("platform", "==", "facebook"), where("status", "==", "active"));
    const existingAccountsSnap = await getDocs(q);
    for (const docSnap of existingAccountsSnap.docs) {
      await updateDoc(docSnap.ref, { status: "inactive", updatedAt: serverTimestamp() });
    }

    // Save to socialAccounts collection
    await addDoc(collection(db, "socialAccounts"), {
      userId: portalUserId,
      platform: "facebook",
      platformUserId: fbUser.id,
      displayName: fbUser.name,
      accessToken: accessToken,
      refreshToken: "", // optional, FB doesn't provide refresh token
      tokenExpiresAt: new Date(new Date().getTime() + tokenData.expires_in * 1000), // if FB provides expires_in
      pages: pagesData.data?.map(p => ({
        pageId: p.id,
        pageName: p.name,
        pageAccessToken: p.access_token
      })) || [],
      status: "active",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
return NextResponse.redirect(
  `${baseUrl}/admin/social/connect?status=success&platform=facebook&name=${encodeURIComponent(fbUser.name)}`
);



  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
