import { NextResponse } from "next/server";

export async function GET() {
    const redirect_uri = process.env.LINKEDIN_REDIRECT_URI;
    const client_id = process.env.LINKEDIN_CLIENT_ID;

    if (!client_id || !redirect_uri) {
        console.error("LinkedIn OAuth Error: Missing environment variables", {
            hasClientId: !!client_id,
            hasRedirectUri: !!redirect_uri
        });
        return NextResponse.json({ 
            error: "OAuth configuration missing. Please check LINKEDIN_CLIENT_ID and LINKEDIN_REDIRECT_URI in your .env file." 
        }, { status: 500 });
    }

    // LinkedIn OAuth 2.0 Scopes
    const scopes = [
        "openid",
        "profile",
        "email",
        "w_member_social"
    ];

    // LinkedIn OAuth 2.0 Authorization URL
    const params = new URLSearchParams({
        response_type: 'code',
        client_id: client_id,
        redirect_uri: redirect_uri,
        scope: scopes.join(" "),
        state: 'random_state_string', // In production, this should be a secure random state
    });

    const authUrl = `https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`;

    console.log("Redirecting to LinkedIn OAuth:", authUrl);

    return NextResponse.redirect(authUrl);
}
