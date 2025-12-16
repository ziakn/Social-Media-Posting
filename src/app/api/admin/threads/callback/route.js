"use server";

import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, query, where, getDocs } from "firebase/firestore";
import { verifyToken } from "@/lib/auth";

/**
 * Callback endpoint for Threads OAuth
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
            `https://graph.threads.net/oauth/access_token`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: new URLSearchParams({
                    client_id: process.env.THREADS_APP_ID,
                    client_secret: process.env.THREADS_APP_SECRET,
                    grant_type: "authorization_code",
                    redirect_uri: process.env.THREADS_REDIRECT_URI,
                    code: code,
                }),
            }
        );

        const tokenData = await tokenRes.json();
        if (tokenData.error) {
            return NextResponse.json({ error: tokenData.error.message }, { status: 400 });
        }

        const shortLivedUserToken = tokenData.access_token;
        const userId = tokenData.user_id; // Threads User ID is usually returned here

        // 2. Exchange for long-lived token (60 days)
        const longLivedRes = await fetch(
            `https://graph.threads.net/access_token?` +
            `grant_type=th_exchange_token&` +
            `client_secret=${process.env.THREADS_APP_SECRET}&` +
            `access_token=${shortLivedUserToken}`
        );

        const longLivedData = await longLivedRes.json();
        if (longLivedData.error) {
            // Fallback to short-lived if exchange fails, or handle error
            console.warn("Failed to exchange for long-lived token:", longLivedData.error);
        }

        const accessToken = longLivedData.access_token || shortLivedUserToken;

        // 3. Fetch User Profile Info
        const profileRes = await fetch(
            `https://graph.threads.net/me?fields=id,username,name,threads_profile_picture_url&access_token=${accessToken}`
        );
        const profileData = await profileRes.json();

        if (profileData.error) {
            return NextResponse.json({ error: profileData.error.message }, { status: 400 });
        }

        // 4. Check if account already exists
        const existingQuery = query(
            collection(db, "socialAccounts"),
            where("userId", "==", portalUser.id),
            where("accountId", "==", profileData.id),
            where("platform", "==", "threads")
        );
        const existingSnapshot = await getDocs(existingQuery);

        if (!existingSnapshot.empty) {
            // Reactivate if exists
            const docRef = existingSnapshot.docs[0].ref;
            await docRef.update({
                status: "active",
                accessToken: accessToken,
                username: profileData.username,
                pageName: profileData.name || profileData.username, // Using pageName for consistency with other platforms
                profilePicture: profileData.threads_profile_picture_url,
                tokenExpiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // Approx 60 days
                updatedAt: serverTimestamp(),
            });
        } else {
            // 5. Save to Firestore
            await addDoc(collection(db, "socialAccounts"), {
                userId: portalUser.id,
                platform: "threads",
                accountId: profileData.id,
                username: profileData.username,
                pageName: profileData.name || profileData.username,
                profilePicture: profileData.threads_profile_picture_url,
                accessToken: accessToken,
                tokenExpiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // Approx 60 days
                status: "active",
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });
        }

        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
        return NextResponse.redirect(
            `${baseUrl}/admin/social/connect?platform=threads&status=success&name=${encodeURIComponent(profileData.username)}`
        );
    } catch (err) {
        console.error("Threads OAuth callback error:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
