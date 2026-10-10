import { NextResponse, type NextRequest } from "next/server";
import { loginSchema } from "@/lib/validation/crm";
import { verifyCredentials } from "@/lib/auth/accounts";
import { SESSION_COOKIE, sessionCookieOptions, signSession } from "@/lib/auth/session";
import { clientIp, forbiddenOrigin, isSameOrigin, rateLimit, tooManyRequests } from "@/lib/security/request";

export const runtime = "nodejs";

/** Only allow redirects to internal staff paths after sign-in (prevents open redirects). */
function safeNext(next: string | undefined) {
  if (!next || !next.startsWith("/") || next.startsWith("//")) return "/crm";
  return /^\/(crm|admin)(\/|$|\?)/.test(next) ? next : "/crm";
}

export async function POST(req: NextRequest) {
  if (!isSameOrigin(req)) return forbiddenOrigin();

  const ip = clientIp(req);
  const ipLimit = rateLimit(`login-ip:${ip}`, 20, 15 * 60_000);
  if (!ipLimit.allowed) return tooManyRequests(ipLimit.retryAfter);

  const body = await req.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Enter your email and password." }, { status: 422 });
  }

  const accountLimit = rateLimit(`login-acct:${parsed.data.email}`, 6, 15 * 60_000);
  if (!accountLimit.allowed) return tooManyRequests(accountLimit.retryAfter);

  const user = await verifyCredentials(parsed.data.email, parsed.data.password);
  if (!user) {
    return NextResponse.json({ ok: false, error: "That email and password combination is not recognised." }, { status: 401 });
  }

  const token = await signSession(user);
  const res = NextResponse.json({ ok: true, redirect: safeNext(parsed.data.next) });
  res.cookies.set(SESSION_COOKIE, token, sessionCookieOptions());
  return res;
}
