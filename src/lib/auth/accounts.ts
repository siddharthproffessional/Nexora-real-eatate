import "server-only";
import { createHash, timingSafeEqual } from "node:crypto";
import bcrypt from "bcryptjs";
import { createClient } from "@supabase/supabase-js";
import type { StaffUser } from "@/lib/domain/types";
import { env, supabaseConfigured } from "@/lib/env";
import { getSupabaseStaffProfile } from "@/lib/data/supabase-store";

/**
 * Credential verification.
 * - Supabase backend: Supabase Auth (email + password), role read from the `profiles` table.
 * - Demo backend: two demo staff accounts. Passwords come from DEMO_ADMIN_PASSWORD / DEMO_AGENT_PASSWORD
 *   (plain text or a bcrypt hash). In development only, documented defaults are used when unset; in
 *   production the demo accounts are disabled unless their passwords are configured.
 */

export const DEMO_ACCOUNTS = [
  {
    id: "usr_demo_admin",
    email: "admin@nexora.example",
    name: "Demo Administrator",
    role: "admin",
    agentId: null,
    envVar: "DEMO_ADMIN_PASSWORD",
    devDefault: "NexoraAdmin!2026",
  },
  {
    id: "usr_demo_agent",
    email: "agent@nexora.example",
    name: "Rohan Mehta",
    role: "agent",
    agentId: "agent_rohan",
    envVar: "DEMO_AGENT_PASSWORD",
    devDefault: "NexoraAgent!2026",
  },
] as const;

function demoPassword(account: (typeof DEMO_ACCOUNTS)[number]) {
  const configured = process.env[account.envVar];
  if (configured && configured.trim()) return configured.trim();
  return env.isProduction ? null : account.devDefault;
}

function safeEqual(a: string, b: string) {
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}

export function demoAccountsEnabled() {
  return DEMO_ACCOUNTS.some((a) => demoPassword(a) !== null);
}

export async function verifyCredentials(email: string, password: string): Promise<StaffUser | null> {
  if (supabaseConfigured()) {
    const client = createClient(env.supabase.url!, env.supabase.anonKey!, { auth: { persistSession: false, autoRefreshToken: false } });
    const { data, error } = await client.auth.signInWithPassword({ email, password });
    if (error || !data.user) return null;
    await client.auth.signOut().catch(() => undefined);
    return getSupabaseStaffProfile(data.user.id);
  }

  const account = DEMO_ACCOUNTS.find((a) => a.email === email.toLowerCase());
  // Always run a comparison so response time does not reveal whether the email exists.
  const expected = account ? demoPassword(account) : null;
  let ok = false;
  if (expected?.startsWith("$2")) ok = await bcrypt.compare(password, expected);
  else ok = safeEqual(password, expected ?? "invalid-placeholder") && expected !== null;
  if (!account || !ok) return null;
  return { id: account.id, email: account.email, name: account.name, role: account.role, agentId: account.agentId };
}
