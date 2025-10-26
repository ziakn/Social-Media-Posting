import { NextResponse } from "next/server";

export function middleware(req) {
  const tokenCookie = req.cookies.get("token")?.value;

  if (!tokenCookie) {
    const url = req.nextUrl.clone();
  url.pathname = "/admin/auth/login";
  return NextResponse.redirect(url);
  }

  // Parse cookie JSON
  try {
    const user = JSON.parse(tokenCookie);

    // Only allow admin role
    // if (user.role !== "admin") {
    //   const url = req.nextUrl.clone();
    //   url.pathname = "/"; // redirect non-admins to homepage
    //   return NextResponse.redirect(url);
    // }
  } catch {
    const url = req.nextUrl.clone();
    url.pathname = "/admin/auth/login";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
