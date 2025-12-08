// lib/auth.ts
import jwt, { SignOptions } from "jsonwebtoken";

export type UserRole = "PATIENT" | "DOCTOR";

export interface TokenPayload {
  id: string;
  email: string;
  role: UserRole;
}

const secret = process.env.JWT_SECRET;

if (!secret) {
  throw new Error("JWT_SECRET is not set in environment variables.");
}

const JWT_SECRET = secret;
const DEFAULT_EXPIRES_IN = "30d";

export function generateToken(
  payload: TokenPayload,
  options: SignOptions = {}
): string {
  const merged: SignOptions = { expiresIn: DEFAULT_EXPIRES_IN, ...options };
  return jwt.sign(payload, JWT_SECRET, merged);
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}
