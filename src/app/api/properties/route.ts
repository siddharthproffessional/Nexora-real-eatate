import { NextResponse, type NextRequest } from "next/server";
import { getStore } from "@/lib/data";
import { clientIp, rateLimit, tooManyRequests } from "@/lib/security/request";

/**
 * Public read API for listing cards, used by the "Saved properties" page.
 * GET /api/properties?ids=a,b,c — returns published listings only, with public fields.
 */
export async function GET(req: NextRequest) {
  const limit = rateLimit(`props:${clientIp(req)}`, 60, 60_000);
  if (!limit.allowed) return tooManyRequests(limit.retryAfter);

  const ids = (req.nextUrl.searchParams.get("ids") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter((s) => /^[\w-]{1,80}$/.test(s))
    .slice(0, 50);
  if (!ids.length) return NextResponse.json({ ok: true, properties: [] });

  const properties = await getStore().properties.getByIds(ids);
  // Strip internal fields before returning.
  const safe = properties.map(({ agentId: _agentId, verification, ...p }) => ({
    ...p,
    verification: verification ? { permitNumber: verification.permitNumber } : null,
  }));
  return NextResponse.json({ ok: true, properties: safe }, { headers: { "Cache-Control": "private, max-age=30" } });
}
