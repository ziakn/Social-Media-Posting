import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, getDocs, query, where, updateDoc } from "firebase/firestore";
import { verifyToken } from "@/lib/auth";

export async function GET(request) {
    const token = request.cookies.get("token")?.value;
    const user = await verifyToken(token);

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const url = new URL(request.url);
        const code = url.searchParams.get("code");
        const state = url.searchParams.get("state");

        if (!code) {
            return NextResponse.json({ error: "Missing code" }, { status: 400 });
        }

        // 1. Exchange code for access token
        const tokenResponse = await exchangeCodeForToken(code);
        const { access_token, refresh_token, open_id, expires_in, refresh_expires_in } = tokenResponse;

        // 2. Fetch User Profile Info
        const profileInfo = await fetchUserProfile(access_token);

        // 3. Deactivate existing active TikTok accounts for this portal user
        const socialAccountsRef = collection(db, "socialAccounts");
        const q = query(
            socialAccountsRef,
            where("userId", "==", user.id),
            where("platform", "==", "tiktok"),
            where("status", "==", "active")
        );
        const existingAccountsSnap = await getDocs(q);
        for (const docSnap of existingAccountsSnap.docs) {
            await updateDoc(docSnap.ref, { status: "inactive", updatedAt: serverTimestamp() });
        }

        // 4. Save new account to Firestore
        await addDoc(collection(db, "socialAccounts"), {
            userId: user.id,
            platform: "tiktok",
            platformUserId: open_id,
            accountId: open_id, // For TikTok, open_id is the unique identifier
            username: profileInfo.display_name || profileInfo.display_name || "TikTok User",
            displayName: profileInfo.display_name,
            profilePicture: profileInfo.avatar_url,
            accessToken: access_token,
            refreshToken: refresh_token,
            tokenExpiresAt: new Date(Date.now() + expires_in * 1000),
            status: "active",
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });

        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
        return NextResponse.redirect(
            `${baseUrl}/admin/social/connect?status=success&platform=tiktok&name=${encodeURIComponent(profileInfo.display_name)}`
        );

    } catch (error) {
        console.error("TikTok OAuth callback error:", error);
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
        return NextResponse.redirect(
            `${baseUrl}/admin/social/connect?status=failed&platform=tiktok&message=${encodeURIComponent(error.message)}`
        );
    }
}

async function exchangeCodeForToken(code) {
    const res = await fetch("https://open.tiktokapis.com/v2/oauth/token/", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
            client_key: process.env.TIKTOK_CLIENT_KEY,
            client_secret: process.env.TIKTOK_CLIENT_SECRET,
            code: code,
            grant_type: "authorization_code",
            redirect_uri: process.env.TIKTOK_REDIRECT_URI,
        }),
    });

    const data = await res.json();
    if (data.error) {
        throw new Error(data.error_description || data.error);
    }
    return data;
}

async function fetchUserProfile(accessToken) {
    const res = await fetch("https://open.tiktokapis.com/v2/user/info/?fields=open_id,union_id,avatar_url,display_name", {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });

    const data = await res.json();
    if (data.error) {
        throw new Error(data.error.message || "Failed to fetch profile");
    }
    return data.data.user;
}
