import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

export async function GET(req) {
  const token = req.cookies.get("token")?.value;

  if (!token) {
    return NextResponse.json({ valid: false }, { status: 401 });
  }

  try {
    const payload = await verifyToken(token);
    
    if (!payload) {
      return NextResponse.json({ valid: false }, { status: 401 });
    }

    return NextResponse.json({
      valid: true,
      user: payload
    });

  } catch (error) {
    return NextResponse.json({ valid: false }, { status: 401 });
  }
}