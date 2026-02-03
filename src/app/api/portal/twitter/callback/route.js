import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, getDocs, query, where, updateDoc } from "firebase/firestore";
import { verifyToken } from "@/lib/auth";

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

        // Exchange code for access token
        const tokenResponse = await exchangeCodeForToken(code);
        const { access_token, refresh_token, expires_in } = tokenResponse;

        // Get user profile
        const twitterUser = await fetchUserProfile(access_token);

        if (!user) {
            return NextResponse.json({ valid: false, message: "Invalid token" }, { status: 403 });
        }

        const portalUserId = user.id;

        if (!portalUserId) {
            return NextResponse.json({ error: "Missing portal user ID" }, { status: 400 });
        }

        // Deactivate existing active records for this user and platform
        const socialAccountsRef = collection(db, "socialAccounts");
        const q = query(socialAccountsRef, where("userId", "==", portalUserId), where("platform", "==", "twitter"), where("status", "==", "active"));
        const existingAccountsSnap = await getDocs(q);
        for (const docSnap of existingAccountsSnap.docs) {
            await updateDoc(docSnap.ref, { status: "inactive", updatedAt: serverTimestamp() });
        }

        // Save to socialAccounts collection
        await addDoc(collection(db, "socialAccounts"), {
            userId: portalUserId,
            platform: "twitter",
            platformUserId: twitterUser.data.id,
            displayName: twitterUser.data.name,
            username: twitterUser.data.username,
            accessToken: access_token,
            refreshToken: refresh_token,
            tokenExpiresAt: new Date(Date.now() + expires_in * 1000),
            status: "active",
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });

        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
        return NextResponse.redirect(
            `${baseUrl}/portal/social/connect?status=success&platform=twitter&name=${encodeURIComponent(twitterUser.data.name)}`
        );

    } catch (error) {
        console.error("Twitter OAuth callback error:", error);
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
        return NextResponse.redirect(
            `${baseUrl}/portal/social/connect?status=failed&platform=twitter&message=${encodeURIComponent(error.message)}`
        );
    }
}

// --- Helper Functions ---

async function exchangeCodeForToken(code) {
    const basicAuth = Buffer.from(`${process.env.TWITTER_CLIENT_ID}:${process.env.TWITTER_CLIENT_SECRET}`).toString('base64');

    const res = await fetch("https://api.twitter.com/2/oauth2/token", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "Authorization": `Basic ${basicAuth}`
        },
        body: new URLSearchParams({
            code,
            grant_type: "authorization_code",
            client_id: process.env.TWITTER_CLIENT_ID,
            redirect_uri: process.env.TWITTER_REDIRECT_URI,
            code_verifier: "challenge" // Must match the code_challenge used in connect
        })
    });

    const data = await res.json();
    if (data.error) throw new Error(data.error_description || data.error);
    return data;
}

async function fetchUserProfile(accessToken) {
    const res = await fetch("https://api.twitter.com/2/users/me", {
        headers: {
            "Authorization": `Bearer ${accessToken}`
        }
    });

    const data = await res.json();
    if (data.errors) throw new Error(data.errors[0].message);
    return data;
}
