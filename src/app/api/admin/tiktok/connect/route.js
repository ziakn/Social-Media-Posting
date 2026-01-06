import { NextResponse } from "next/server";

export async function GET() {
    const client_key = process.env.TIKTOK_CLIENT_KEY;
    const redirect_uri = process.env.TIKTOK_REDIRECT_URI;

    if (!client_key || !redirect_uri) {
        console.error("Missing TikTok Config:", { client_key, redirect_uri });
        return NextResponse.json({
            error: "Configuration Missing",
            details: "TIKTOK_CLIENT_KEY or TIKTOK_REDIRECT_URI is not defined in environment variables.",
        }, { status: 500 });
    }

    const scopes = [
        "user.info.basic",
        "video.publish",
        "video.upload",
        "video.list"
    ];

    // TikTok OAuth 2.0 URL
    const authUrl = `https://www.tiktok.com/v2/auth/authorize/?` +
        `client_key=${client_key}` +
        `&scope=${scopes.join(",")}` +
        `&response_type=code` +
        `&redirect_uri=${encodeURIComponent(redirect_uri)}` +
        `&state=${Math.random().toString(36).substring(7)}`;

    return NextResponse.redirect(authUrl);
}
