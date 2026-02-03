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

        // Get user profile/channel info
        // const youtubeData = await fetchYoutubeProfile(access_token);

        if (!user) {
            return NextResponse.json({ valid: false, message: "Invalid token" }, { status: 403 });
        }

        const portalUserId = user.id;

        // Get all user channels
        const youtubeChannels = await fetchYoutubeChannels(access_token);

        // Store in pending_connections
        const pendingDoc = await addDoc(collection(db, "pending_connections"), {
            userId: portalUserId,
            platform: "youtube",
            displayName: "YouTube User", // Or use first channel name?
            accessToken: access_token,
            refreshToken: refresh_token,
            tokenExpiresAt: new Date(Date.now() + expires_in * 1000),
            pages: youtubeChannels.map(ch => ({
                pageId: ch.id,
                pageName: ch.snippet.title,
                username: ch.snippet.customUrl || ch.snippet.title,
                profilePicture: ch.snippet.thumbnails.default.url,
                platformUserId: ch.id
            })),
            status: "pending",
            createdAt: serverTimestamp()
        });

        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
        return NextResponse.redirect(
            `${baseUrl}/portal/social/connect?status=pending&platform=youtube&pendingId=${pendingDoc.id}`
        );

    } catch (error) {
        console.error("YouTube OAuth callback error:", error);
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
        return NextResponse.redirect(
            `${baseUrl}/portal/social/connect?status=failed&platform=youtube&message=${encodeURIComponent(error.message)}`
        );
    }
}

async function exchangeCodeForToken(code) {
    const res = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
            code,
            client_id: process.env.YOUTUBE_CLIENT_ID,
            client_secret: process.env.YOUTUBE_CLIENT_SECRET,
            redirect_uri: process.env.YOUTUBE_REDIRECT_URI,
            grant_type: "authorization_code",
        })
    });

    const data = await res.json();
    if (data.error) throw new Error(data.error_description || data.error);
    return data;
}

async function fetchYoutubeChannels(accessToken) {
    // Fetch channel list (mine)
    const res = await fetch("https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true", {
        headers: {
            "Authorization": `Bearer ${accessToken}`
        }
    });

    const data = await res.json();
    if (data.error) throw new Error(data.error.message);
    if (!data.items || data.items.length === 0) throw new Error("No YouTube channel found for this account.");

    return data.items;
}
