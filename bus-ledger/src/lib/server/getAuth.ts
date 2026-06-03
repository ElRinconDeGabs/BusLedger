import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export const AUTH_COOKIE = "auth_token";

export type TokenPayload = {
  userId: number;
  organizationId: number;
  role: "ADMIN" | "USER";
};

export function getUserContext(req: NextRequest): TokenPayload | null {
  try {
    const token = req.cookies.get(AUTH_COOKIE)?.value;
    if (!token || !process.env.JWT_SECRET) return null;
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as TokenPayload;
    if (!decoded.userId) return null;
    return decoded;
  } catch {
    return null;
  }
}

// Backward-compat alias for routes that only need userId
export function getUserIdFromToken(req: NextRequest): number | null {
  return getUserContext(req)?.userId ?? null;
}

// In-memory rate limiter (resets on server restart; swap for Redis in multi-instance deploys)
const attempts = new Map<string, { count: number; resetAt: number }>();
const MAX_ATTEMPTS = 10;
const WINDOW_MS = 60_000;

export function checkRateLimit(req: NextRequest): NextResponse | null {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";

  const now = Date.now();
  const entry = attempts.get(ip);

  if (!entry || now > entry.resetAt) {
    attempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return null;
  }

  if (entry.count >= MAX_ATTEMPTS) {
    return NextResponse.json(
      { error: "Demasiados intentos. Espera un momento." },
      { status: 429 }
    );
  }

  entry.count++;
  return null;
}
