import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth/session";
import { forbiddenOrigin, isSameOrigin } from "@/lib/security/request";

export async function POST(req: NextRequest) {
  if (!isSameOrigin(req)) return forbiddenOrigin();
  const res = NextResponse.redirect(new URL("/login?signedOut=1", req.url), { status: 303 });
  res.cookies.delete(SESSION_COOKIE);
  return res;
}
