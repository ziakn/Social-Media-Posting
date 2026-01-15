import { NextResponse } from "next/server";

export async function GET() {
    const redirect_uri = process.env.PINTEREST_REDIRECT_URI;
    const app_id = process.env.PINTEREST_APP_ID;

    // Debugging: Check if env vars are loaded
    if (!app_id || !redirect_uri) {
        console.error("Missing Pinterest Config:", { app_id, redirect_uri });
        return NextResponse.json({
            error: "Configuration Missing",
            details: "PINTEREST_APP_ID or PINTEREST_REDIRECT_URI is not defined in environment variables.",
            debug: {
                hasAppId: !!app_id,
                hasRedirectUri: !!redirect_uri
            }
        }, { status: 500 });
    }

    const scopes = [
        "boards:read",
        "pins:read",
        "pins:write",
        "user_accounts:read"
    ];

    const authUrl = `https://www.pinterest.com/oauth/?client_id=${app_id}&redirect_uri=${encodeURIComponent(
        redirect_uri
    )}&scope=${scopes.join(",")}&response_type=code`;

    return NextResponse.redirect(authUrl);
}
