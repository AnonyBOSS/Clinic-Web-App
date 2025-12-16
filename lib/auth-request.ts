// lib/auth-request.ts
import type { NextRequest } from "next/server";
import { TokenPayload, verifyToken } from "./auth";

export type AuthUser = TokenPayload;

export function getAuthUserFromRequest(req: NextRequest): AuthUser | null {
  // First try cookie (website)
  let token = req.cookies.get("auth_token")?.value;
  
  // Fallback to Authorization header (mobile app)
  if (!token) {
    const authHeader = req.headers.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    }
  }
  
  if (!token) return null;

  const payload = verifyToken(token);
  return payload ?? null;
}