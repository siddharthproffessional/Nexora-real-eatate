import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/auth/session";

/**
 * Network-boundary guard for internal areas (Next.js 16 "proxy", formerly middleware).
 * Every /crm, /admin and /api/internal request needs a valid signed session. Role checks happen again in
 * each page and API route, so this layer is defence in depth rather than the only control.
 */
export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const user = await verifySession(request.cookies.get(SESSION_COOKIE)?.value);

  if (!user) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ ok: false, error: "Sign in required" }, { status: 401 });
    }
    const login = new URL("/login", request.url);
    login.searchParams.set("next", `${pathname}${search}`);
    const res = NextResponse.redirect(login);
    if (request.cookies.has(SESSION_COOKIE)) res.cookies.delete(SESSION_COOKIE);
    return res;
  }

  const res = NextResponse.next();
  res.headers.set("Cache-Control", "private, no-store");
  res.headers.set("X-Robots-Tag", "noindex, nofollow");
  return res;
}

export const config = {
  matcher: ["/crm/:path*", "/admin/:path*", "/api/internal/:path*"],
};
