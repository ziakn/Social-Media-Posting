import { NextResponse } from "next/server";

export async function GET() {
  const redirect_uri = process.env.IG_REDIRECT_URI;
  const app_id = process.env.IG_APP_ID;

  const scopes = [
    "instagram_basic", // Required: Basic profile info
    "pages_show_list", // Required: List Facebook Pages
    "instagram_content_publish", // Required: Post to Instagram
    "instagram_manage_insights", // Optional: Analytics
    "pages_read_engagement", // Recommended: Page insights
    "business_management", // Recommended: Business tools
  ];

  const authUrl = `https://www.facebook.com/v24.0/dialog/oauth?client_id=${app_id}&redirect_uri=${encodeURIComponent(
    redirect_uri
  )}&scope=${scopes.join(",")}`;

  return NextResponse.redirect(authUrl);
}
