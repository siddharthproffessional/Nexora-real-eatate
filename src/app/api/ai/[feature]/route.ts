import { NextResponse, type NextRequest } from "next/server";
import { aiFeatures, getAIProvider, type AIFeature } from "@/lib/ai";
import { requireApiStaff } from "@/lib/auth/guard";
import { forbiddenOrigin, isSameOrigin } from "@/lib/security/request";

type Ctx = { params: Promise<{ feature: string }> };

/**
 * AI integration endpoint. Each feature has a route so the UI and future adapters share one contract.
 * Until an AI provider adapter is implemented this returns 501 — it never fabricates a result.
 */
export async function POST(req: NextRequest, { params }: Ctx) {
  if (!isSameOrigin(req)) return forbiddenOrigin();
  const { feature } = await params;
  if (!(feature in aiFeatures)) return NextResponse.json({ ok: false, error: "Unknown AI feature" }, { status: 404 });
  const meta = aiFeatures[feature as AIFeature];

  if (meta.audience === "staff") {
    const auth = await requireApiStaff("crm:view");
    if (!auth.ok) return auth.response;
  }

  const provider = getAIProvider();
  if (!provider) {
    return NextResponse.json({ ok: false, configured: false, feature, error: `${meta.name} is not available: no AI provider is connected.` }, { status: 501 });
  }
  // Provider adapters are wired here when implemented (see src/lib/ai/index.ts).
  return NextResponse.json({ ok: false, configured: true, feature, error: "Adapter not implemented for this feature." }, { status: 501 });
}
