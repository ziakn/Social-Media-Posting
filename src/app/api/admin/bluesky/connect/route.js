import { NextResponse } from "next/server";

export async function GET() {
    // Redirect to the internal BlueSky connection page (which acts as the "Provider" login page)
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    return NextResponse.redirect(`${baseUrl}/admin/social/bluesky/callback`);
}
