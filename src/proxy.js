import { NextResponse } from "next/server";

export function proxy(req) {
  const tokenCookie = req.cookies.get("token")?.value;
  const { pathname } = req.nextUrl;

  // ✅ Don't redirect if user is already on the login page
  if (pathname === "/auth/login") {
    return NextResponse.next();
  }

  // ✅ Redirect unauthenticated users to login
  if (!tokenCookie) {
    const url = req.nextUrl.clone();
    url.pathname = "/auth/login";
    return NextResponse.redirect(url);
  }

  // ✅ Validate token structure (optional)
  try {
    JSON.parse(tokenCookie);
  } catch {
    const url = req.nextUrl.clone();
    url.pathname = "/auth/login";
    return NextResponse.redirect(url);
  }

  // ✅ Allow access
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
