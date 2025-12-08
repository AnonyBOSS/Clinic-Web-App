// app/api/auth/logout/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(_req: NextRequest) {
  // Clear the auth_token cookie
  const res = NextResponse.json(
    { success: true, message: "Logged out." },
    { status: 200 }
  );

  res.cookies.set("auth_token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0 // expire immediately
  });

  return res;
}
