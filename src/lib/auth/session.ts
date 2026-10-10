import { SignJWT, jwtVerify } from "jose";
import type { StaffRole, StaffUser } from "@/lib/domain/types";

/**
 * Signed, httpOnly session cookie (HS256 JWT). Used for both the demo accounts and Supabase-backed accounts,
 * so the proxy and server code have one way to identify staff.
 */

export const SESSION_COOKIE = "nx_session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 8; // one working day

const DEV_FALLBACK_SECRET = "development-only-secret-do-not-use-in-production-0123456789";
let warned = false;

function secretKey() {
  const secret = process.env.AUTH_SECRET;
  if (secret && secret.length >= 32) return new TextEncoder().encode(secret);
  if (process.env.NODE_ENV === "production") {
    throw new Error("AUTH_SECRET must be set to at least 32 characters in production.");
  }
  if (!warned) {
    console.warn("[auth] AUTH_SECRET is not set — using an insecure development secret.");
    warned = true;
  }
  return new TextEncoder().encode(DEV_FALLBACK_SECRET);
}

export interface SessionPayload {
  sub: string;
  email: string;
  name: string;
  role: StaffRole;
  agentId: string | null;
}

export async function signSession(user: StaffUser) {
  return new SignJWT({ email: user.email, name: user.name, role: user.role, agentId: user.agentId })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setIssuer("nexora-realty")
    .setAudience("nexora-staff")
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .sign(secretKey());
}

export async function verifySession(token: string | undefined | null): Promise<StaffUser | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey(), { issuer: "nexora-realty", audience: "nexora-staff", algorithms: ["HS256"] });
    const role = payload.role;
    if (role !== "admin" && role !== "agent") return null;
    if (typeof payload.sub !== "string" || typeof payload.email !== "string" || typeof payload.name !== "string") return null;
    return {
      id: payload.sub,
      email: payload.email,
      name: payload.name,
      role,
      agentId: typeof payload.agentId === "string" ? payload.agentId : null,
    };
  } catch {
    return null;
  }
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  };
}
