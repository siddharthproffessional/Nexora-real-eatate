import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import type { StaffUser } from "@/lib/domain/types";
import { SESSION_COOKIE, verifySession } from "./session";
import { can, type Permission } from "./permissions";

export async function getCurrentUser(): Promise<StaffUser | null> {
  const jar = await cookies();
  return verifySession(jar.get(SESSION_COOKIE)?.value);
}

/** For server components under /crm and /admin. Redirects to login if there is no valid session. */
export async function requireStaff(nextPath?: string): Promise<StaffUser> {
  const user = await getCurrentUser();
  if (!user) redirect(`/login${nextPath ? `?next=${encodeURIComponent(nextPath)}` : ""}`);
  return user;
}

type ApiAuth = { ok: true; user: StaffUser } | { ok: false; response: NextResponse };

/** For internal API routes: 401 without a session, 403 without the permission. */
export async function requireApiStaff(permission?: Permission): Promise<ApiAuth> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, response: NextResponse.json({ ok: false, error: "Sign in required" }, { status: 401 }) };
  if (permission && !can(user, permission)) {
    return { ok: false, response: NextResponse.json({ ok: false, error: "You do not have permission to do this" }, { status: 403 }) };
  }
  return { ok: true, user };
}
