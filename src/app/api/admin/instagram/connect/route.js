import { NextResponse } from "next/server";

export async function GET() {
  const redirect_uri = process.env.IG_REDIRECT_URI;
  const app_id = process.env.IG_APP_ID;

  const scopes = [
    "instagram_business_basic",
    "instagram_business_manage_messages",
    "instagram_business_content_publish",
    "instagram_business_manage_insights",
    "instagram_business_manage_comments",
  ];

  const authUrl = `https://api.instagram.com/oauth/authorize?client_id=${app_id}&redirect_uri=${encodeURIComponent(
    redirect_uri
  )}&scope=${scopes.join(",")}&response_type=code`;

  return NextResponse.redirect(authUrl);
}
