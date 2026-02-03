import { NextResponse } from "next/server";

export async function GET() {
    const redirect_uri = process.env.YOUTUBE_REDIRECT_URI;
    const client_id = process.env.YOUTUBE_CLIENT_ID;

    if (!client_id || !redirect_uri) {
        console.error("YouTube OAuth Error: Missing environment variables", {
            hasClientId: !!client_id,
            hasRedirectUri: !!redirect_uri
        });
        return NextResponse.json({ 
            error: "OAuth configuration missing. Please check YOUTUBE_CLIENT_ID and YOUTUBE_REDIRECT_URI in your .env file." 
        }, { status: 500 });
    }

    // Google/YouTube OAuth 2.0 Scopes
    const scopes = [
        "https://www.googleapis.com/auth/youtube.upload",
        "https://www.googleapis.com/auth/youtube.readonly",
        "https://www.googleapis.com/auth/userinfo.profile",
        "https://www.googleapis.com/auth/userinfo.email",
        "openid"
    ];

    // Google OAuth 2.0 Authorization URL
    const params = new URLSearchParams({
        client_id: client_id,
        redirect_uri: redirect_uri,
        response_type: 'code',
        scope: scopes.join(" "),
        access_type: 'offline',
        prompt: 'consent',
        state: 'state'
    });

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;

    console.log("Redirecting to YouTube OAuth:", authUrl);

    return NextResponse.redirect(authUrl);
}
