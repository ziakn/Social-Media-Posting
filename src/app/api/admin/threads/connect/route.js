import { NextResponse } from "next/server";

export async function GET() {
    const redirect_uri = process.env.THREADS_REDIRECT_URI;
    const app_id = process.env.THREADS_APP_ID;

    const scopes = [
        "threads_basic", // Required: Basic profile info
        "threads_content_publish", // Required: Post to Threads
    ];

    const authUrl = `https://threads.net/oauth/authorize?client_id=${app_id}&redirect_uri=${encodeURIComponent(
        redirect_uri
    )}&scope=${scopes.join(",")}&response_type=code`;

    return NextResponse.redirect(authUrl);
}
