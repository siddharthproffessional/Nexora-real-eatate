import "server-only";
import { NextResponse, type NextRequest } from "next/server";

/**
 * In-memory sliding-window rate limiter.
 * Per server instance — adequate for a single Node server or demo. For multi-instance production hosting,
 * back this with Redis/Upstash (same interface).
 */
const buckets = (globalThis as unknown as { __nexoraRate?: Map<string, number[]> }).__nexoraRate ?? new Map<string, number[]>();
(globalThis as unknown as { __nexoraRate?: Map<string, number[]> }).__nexoraRate = buckets;

export function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const hits = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);
  if (hits.length >= limit) {
    buckets.set(key, hits);
    const retryAfter = Math.ceil((windowMs - (now - hits[0]!)) / 1000);
    return { allowed: false as const, retryAfter };
  }
  hits.push(now);
  buckets.set(key, hits);
  if (buckets.size > 10_000) {
    for (const [k, v] of buckets) if (!v.some((t) => now - t < windowMs)) buckets.delete(k);
  }
  return { allowed: true as const, retryAfter: 0 };
}

export function clientIp(req: NextRequest) {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
}

/**
 * CSRF defence for cookie-authenticated and public mutations: the request must come from this site.
 * Browsers always send Origin on cross-site POSTs; Sec-Fetch-Site covers same-origin requests without it.
 */
export function isSameOrigin(req: NextRequest) {
  const origin = req.headers.get("origin");
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  if (origin) {
    try {
      return new URL(origin).host === host;
    } catch {
      return false;
    }
  }
  const site = req.headers.get("sec-fetch-site");
  return site === "same-origin" || site === "none";
}

export function forbiddenOrigin() {
  return NextResponse.json({ ok: false, error: "Request blocked: cross-site request" }, { status: 403 });
}

export function tooManyRequests(retryAfter: number) {
  return NextResponse.json(
    { ok: false, error: "Too many attempts. Please wait a moment and try again." },
    { status: 429, headers: { "Retry-After": String(retryAfter) } },
  );
}
