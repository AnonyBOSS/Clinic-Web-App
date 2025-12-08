// lib/auth-request.ts
import type { NextRequest } from "next/server";
import { TokenPayload, verifyToken } from "./auth";

export type AuthUser = TokenPayload;

export function getAuthUserFromRequest(req: NextRequest): AuthUser | null {
  const token = req.cookies.get("auth_token")?.value;
  if (!token) return null;

  const payload = verifyToken(token);
  return payload ?? null;
}
