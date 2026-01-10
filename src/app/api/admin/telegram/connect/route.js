import { NextResponse } from "next/server";

export async function GET() {
    // For Telegram, we don't have a redirect-based OAuth flow.
    // We redirect the user to the Telegram dashboard where they can enter their Bot Token and Chat ID.
    const dashboardUrl = new URL("/admin/social/telegram", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000");
    
    return NextResponse.redirect(dashboardUrl.toString());
}
