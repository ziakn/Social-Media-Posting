import { NextResponse } from "next/server";

export async function GET() {
  const redirect_uri = process.env.IG_REDIRECT_URI;
  const app_id = process.env.FB_APP_ID; // same app ID, but different redirect

  const scopes = [
    "instagram_basic",
    "instagram_manage_comments",
    "instagram_manage_insights",
    "pages_show_list", // required to link IG Business accounts
    "business_management"
  ];

  const authUrl = `https://www.facebook.com/v24.0/dialog/oauth?client_id=${app_id}&redirect_uri=${encodeURIComponent(
    redirect_uri
  )}&scope=${scopes.join(",")}`;

  return NextResponse.redirect(authUrl);
}
