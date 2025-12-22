import { NextResponse } from "next/server";

export async function GET() {
    const redirect_uri = process.env.TWITTER_REDIRECT_URI;
    const client_id = process.env.TWITTER_CLIENT_ID;

    const scopes = [
        "tweet.read",
        "tweet.write",
        "users.read",
        "offline.access",
    ];

    // Twitter OAuth 2.0 Authorization URL
    const authUrl = `https://twitter.com/i/oauth2/authorize?response_type=code&client_id=${client_id}&redirect_uri=${encodeURIComponent(
        redirect_uri
    )}&scope=${encodeURIComponent(scopes.join(" "))}&state=state&code_challenge=challenge&code_challenge_method=plain`;

    return NextResponse.redirect(authUrl);
}
