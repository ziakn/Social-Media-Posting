import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

export async function proxy(req) {
  const token = req.cookies.get("token")?.value;
  const { pathname } = req.nextUrl;

  // Public routes - no authentication needed
  const publicRoutes = [
    "/auth/login",
    "/auth/register", 
    "/api/auth/login",
    "/api/auth/register"
  ];

  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // Protected routes - require authentication
  const protectedRoutes = ["/admin", "/dashboard"];
  const requiresAuth = protectedRoutes.some(route => pathname.startsWith(route));

  if (!requiresAuth) {
    return NextResponse.next();
  }

  // No token for protected route
  if (!token) {
    return redirectToLogin(req, pathname);
  }

  // Validate JWT token
  try {
    const payload = await verifyToken(token);
    
    if (!payload) {
      return redirectToLogin(req, pathname);
    }

    // Optional: Role-based access control
    if (pathname.startsWith("/admin") && payload.role !== "admin") {
      // return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    // Add user info to headers for API routes
    if (pathname.startsWith("/api/")) {
      const requestHeaders = new Headers(req.headers);
      requestHeaders.set('x-user-id', payload.id);
      requestHeaders.set('x-user-role', payload.role);
      requestHeaders.set('x-user-email', payload.email);

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    }

    return NextResponse.next();

  } catch (error) {
    console.error("Token validation error:", error);
    return redirectToLogin(req, pathname);
  }
}

function redirectToLogin(req, pathname) {
  const url = req.nextUrl.clone();
  url.pathname = "/auth/login";
  
  // Save intended destination for redirect after login
  if (pathname !== "/" && !pathname.startsWith("/auth")) {
    url.searchParams.set("redirect", pathname);
  }
  
  const response = NextResponse.redirect(url);
  response.cookies.delete("token");
  return response;
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/dashboard/:path*",
    "/api/admin/:path*",
    "/api/dashboard/:path*"
  ],
};