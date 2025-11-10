import { NextResponse } from "next/server";

export async function GET() {
  const redirect_uri = process.env.FB_REDIRECT_URI;
  const app_id = process.env.FB_APP_ID;

  const authUrl = `https://www.facebook.com/v24.0/dialog/oauth?client_id=${app_id}&redirect_uri=${encodeURIComponent(redirect_uri)}&scope=email,public_profile,instagram_basic,pages_show_list`;

  return NextResponse.redirect(authUrl);
}
