import { NextResponse } from "next/server";
import crypto from "crypto";
import { cookies } from "next/headers";

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

    // 1. Generate secure state for CSRF protection
    const state = crypto.randomBytes(16).toString("hex");

    // 2. Generate PKCE code_verifier and code_challenge
    const code_verifier = crypto.randomBytes(32).toString("hex");
    const code_challenge = crypto.createHash("sha256")
        .update(code_verifier)
        .digest("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=/g, "");

    const scopes = [
        "user.info.basic",
        "user.info.profile",
        "video.publish",
        "video.upload",
        "video.list"
    ];

    // TikTok OAuth 2.0 URL with PKCE (Matching documentation trailing slash exactly)
    const authUrl =
        "https://www.tiktok.com/v2/auth/authorize/" +
        `?client_key=${client_key}` +
        `&scope=${scopes.join(",")}` +
        `&response_type=code` +
        `&redirect_uri=${encodeURIComponent(redirect_uri)}` +
        `&state=${state}` +
        `&code_challenge=${code_challenge}` +
        `&code_challenge_method=S256`;

    const response = NextResponse.redirect(authUrl);

    // 3. Store state and verifier in secure, httpOnly cookies
    response.cookies.set("tiktok_oauth_state", state, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        maxAge: 60 * 10, // 10 minutes
        path: "/",
    });

    response.cookies.set("tiktok_code_verifier", code_verifier, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        maxAge: 60 * 10, // 10 minutes
        path: "/",
    });

    return response;
}
