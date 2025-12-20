import { NextResponse } from "next/server";

export async function GET() {
    const redirect_uri = process.env.TH_REDIRECT_URI;
    const app_id = process.env.TH_APP_ID;

    // Debugging: Check if env vars are loaded
    if (!app_id || !redirect_uri) {
        console.error("Missing Threads Config:", { app_id, redirect_uri });
        return NextResponse.json({
            error: "Configuration Missing",
            details: "TH_APP_ID or TH_REDIRECT_URI is not defined in environment variables.",
            debug: {
                hasAppId: !!app_id,
                hasRedirectUri: !!redirect_uri
            }
        }, { status: 500 });
    }

    const scopes = [
        "threads_basic", // Required: Basic profile info
        "threads_content_publish", // Required: Post to Threads
        "threads_delete", // Optional: Delete Threads
        "threads_manage_insights",
        "threads_manage_mentions"
    ];

    const authUrl = `https://threads.net/oauth/authorize?client_id=${app_id}&redirect_uri=${encodeURIComponent(
        redirect_uri
    )}&scope=${scopes.join(",")}&response_type=code`;



    return NextResponse.redirect(authUrl);
}
