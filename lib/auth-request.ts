import type { NextRequest } from 'next/server';
import { verifyToken, extractToken } from './auth';

export type AuthUser = {
  id: string;
  email: string;
  role: 'patient' | 'doctor';
};

export function getAuthUserFromRequest(req: NextRequest): AuthUser | null {
  // 1) Try cookie first
  let token = req.cookies.get('auth_token')?.value ?? null;

  // 2) If no cookie, fall back to Authorization header
  if (!token) {
    const authHeader = req.headers.get('authorization');
    token = extractToken(authHeader);
  }

  if (!token) return null;

  const payload = verifyToken(token);
  if (!payload) return null;

  return payload;
}
