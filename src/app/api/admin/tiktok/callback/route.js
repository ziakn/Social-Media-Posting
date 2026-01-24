import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, getDocs, query, where, updateDoc } from "firebase/firestore";
import { verifyToken } from "@/lib/auth";

export async function GET(request) {
    try {
        const url = new URL(request.url);
        const code = url.searchParams.get("code");
        const state = url.searchParams.get("state");

        // 1. Verify user session explicitly from request cookies for robustness
        const sessionToken = request.cookies.get("token")?.value;
        const user = await verifyToken(sessionToken);

        if (!user) {
            console.error("TikTok Callback: Unauthorized - No user session found. Token cookie:", !!sessionToken);
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // 2. Verify state to prevent CSRF (Must match name in connect/route.js)
        const storedState = request.cookies.get("tiktok_oauth_state")?.value;

        // Debugging state issues
        console.log("TikTok State Check:", {
            received: state,
            stored: storedState,
            match: state === storedState
        });

        if (!state || state !== storedState) {
            console.error("TikTok OAuth State Mismatch:", { received: state, stored: storedState });
            const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
            return NextResponse.redirect(`${baseUrl}/admin/social/connect?status=failed&platform=tiktok&message=Security check failed: State mismatch.`);
        }

        // 3. Retrieve code_verifier for PKCE
        const code_verifier = request.cookies.get("tiktok_code_verifier")?.value;
        if (!code_verifier) {
            console.error("TikTok OAuth Missing Code Verifier");
            const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
            return NextResponse.redirect(`${baseUrl}/admin/social/connect?status=failed&platform=tiktok&message=Security check failed: Missing code verifier.`);
        }

        if (!code) {
            return NextResponse.json({ error: "Missing code" }, { status: 400 });
        }

        // 4. Exchange code for access token using code_verifier
        const tokenResponse = await exchangeCodeForToken(code, code_verifier);
        const { access_token, refresh_token, open_id, expires_in } = tokenResponse;

        // 5. Fetch User Profile Info
        const profileInfo = await fetchUserProfile(access_token);

        // 6. Deactivate existing active TikTok accounts for this portal user
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

        // 7. Save new account to Firestore
        await addDoc(collection(db, "socialAccounts"), {
            userId: user.id,
            platform: "tiktok",
            platformUserId: open_id,
            accountId: open_id,
            username: profileInfo.display_name || "TikTok User",
            displayName: profileInfo.display_name,
            profilePicture: profileInfo.avatar_url,
            accessToken: access_token,
            refreshToken: refresh_token,
            tokenExpiresAt: new Date(Date.now() + expires_in * 1000),
            status: "active",
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });

        // 8. Clear temporary cookies and redirect
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
        const response = NextResponse.redirect(
            `${baseUrl}/admin/social/connect?status=success&platform=tiktok&name=${encodeURIComponent(profileInfo.display_name)}`
        );

        response.cookies.delete("tiktok_oauth_state");
        response.cookies.delete("tiktok_code_verifier");

        return response;

    } catch (error) {
        console.error("TikTok OAuth callback error:", error);
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
        return NextResponse.redirect(
            `${baseUrl}/admin/social/connect?status=failed&platform=tiktok&message=${encodeURIComponent(error.message)}`
        );
    }
}

async function exchangeCodeForToken(code, code_verifier) {
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
            code_verifier: code_verifier,
        }),
    });

    const data = await res.json();
    if (data.error) {
        console.error("TikTok Token Exchange Failed:", data);
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
        console.error("TikTok Profile Fetch Failed:", data);
        throw new Error(data.error.message || "Failed to fetch profile");
    }
    return data.data.user;
}
