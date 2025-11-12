import { NextResponse } from "next/server";

export async function GET() {
  const redirect_uri = process.env.FB_REDIRECT_URI;
  const app_id = process.env.FB_APP_ID;

  const scopes = [
    "email",
    "public_profile",
    "instagram_basic",
    "pages_show_list",
    "pages_manage_posts",
    "pages_read_engagement",
    "pages_manage_engagement",
    "pages_manage_metadata",
    "pages_read_user_content",
    "pages_manage_ads",
    "ads_management",
    "business_management",
    "instagram_manage_comments",
    "instagram_manage_insights",
  ];

  const authUrl = `https://www.facebook.com/v24.0/dialog/oauth?client_id=${app_id}&redirect_uri=${encodeURIComponent(
    redirect_uri
  )}&scope=${scopes.join(",")}`;

  return NextResponse.redirect(authUrl);
}
