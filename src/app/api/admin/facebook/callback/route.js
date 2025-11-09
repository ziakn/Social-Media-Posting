import { NextResponse } from "next/server";

export async function GET(request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  if (!code) {
    return NextResponse.json({ error: "Missing code" }, { status: 400 });
  }

  const tokenResponse = await fetch(
    `https://graph.facebook.com/v19.0/oauth/access_token?client_id=${
      process.env.FB_APP_ID
    }&redirect_uri=${encodeURIComponent(
      process.env.FB_REDIRECT_URI
    )}&client_secret=${
      process.env.FB_APP_SECRET
    }&code=${code}`
  );

  const data = await tokenResponse.json();
  if (data.error) {
    return NextResponse.json({ error: data.error.message }, { status: 400 });
  }

  const userRes = await fetch(
    `https://graph.facebook.com/me?fields=id,name,email&access_token=${data.access_token}`
  );
  const user = await userRes.json();

  // Optional: Save access token and user info to your DB here

  return NextResponse.redirect(
    `/admin/social/connect?status=success&platform=facebook&name=${encodeURIComponent(
      user.name
    )}`
  );
}
