import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
export const dynamic = "force-dynamic";

export async function GET(req) {
  try {
    const token = req.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json({ valid: false, message: "No token provided" }, { status: 401 });
    }

    const user = await verifyToken(token);
    if (!user) {
      return NextResponse.json({ valid: false, message: "Invalid token" }, { status: 403 });
    }

    // Return the user from token, but ensure it's not cached
    return NextResponse.json({ valid: true, user });
  } catch (error) {
    console.error("Error verifying token:", error);
    return NextResponse.json({ valid: false, message: "Server error" }, { status: 500 });
  }
}
