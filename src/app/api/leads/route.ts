import { NextResponse, type NextRequest } from "next/server";
import { getStore } from "@/lib/data";
import { fieldErrors, leadSubmissionSchema } from "@/lib/validation/lead";
import { clientIp, forbiddenOrigin, isSameOrigin, rateLimit, tooManyRequests } from "@/lib/security/request";
import { dispatchLeadNotifications } from "@/lib/notifications";
import { isDemoMode } from "@/config/site";
import type { NewLead } from "@/lib/data/types";

export const runtime = "nodejs";

const MAX_BODY_BYTES = 16 * 1024;

/**
 * Public lead capture endpoint used by every inquiry form.
 * Same-origin only, rate limited per IP, honeypot-protected, validated with the shared zod schema, and
 * stored before any notification is attempted. The response reports delivery results truthfully.
 */
export async function POST(req: NextRequest) {
  if (!isSameOrigin(req)) return forbiddenOrigin();

  const ip = clientIp(req);
  const limit = rateLimit(`lead:${ip}`, 5, 10 * 60_000);
  if (!limit.allowed) return tooManyRequests(limit.retryAfter);

  const length = Number(req.headers.get("content-length") ?? 0);
  if (length > MAX_BODY_BYTES) return NextResponse.json({ ok: false, error: "Request is too large" }, { status: 413 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
  }

  const parsed = leadSubmissionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Please check the highlighted fields.", fieldErrors: fieldErrors(parsed.error) }, { status: 422 });
  }
  const d = parsed.data;
  if (d.website) return NextResponse.json({ ok: false, error: "Submission rejected" }, { status: 400 });

  const store = getStore();
  const property = d.propertyId ? await store.properties.getById(d.propertyId) : null;
  if (d.propertyId && (!property || !property.published)) {
    return NextResponse.json({ ok: false, error: "That property is no longer available.", fieldErrors: { propertyId: "Property not found" } }, { status: 422 });
  }

  const preferredCommunity = d.preferredCommunity && d.preferredCommunity !== "other" ? d.preferredCommunity : (property?.communitySlug ?? null);
  const now = new Date().toISOString();
  const input: NewLead = {
    name: d.name,
    email: d.email,
    phone: `${d.phoneCountry}${d.phoneNumber}`,
    intent: d.intent,
    budgetBand: d.budgetBand ?? null,
    preferredCommunity,
    contactMethod: d.contactMethod,
    message: d.message ?? null,
    source: d.source,
    propertyId: property?.id ?? null,
    viewing: d.source === "viewing_request" && d.viewingDate && d.viewingTimeSlot ? { date: d.viewingDate, timeSlot: d.viewingTimeSlot } : null,
    sellDetails:
      d.source === "sell_lease_form"
        ? {
            propertyType: d.sellPropertyType ?? null,
            community: d.sellCommunity ?? null,
            bedrooms: d.sellBedrooms ?? null,
            areaSqft: d.sellAreaSqft ?? null,
            expectedPrice: d.sellExpectedPrice ?? null,
            timeline: d.sellTimeline ?? null,
          }
        : null,
    // Route property inquiries to the listing agent automatically.
    agentId: property?.agentId ?? null,
    utm: d.utmSource ? { source: d.utmSource, medium: d.utmMedium ?? null, campaign: d.utmCampaign ?? null } : null,
    consent: { privacy: true, marketing: Boolean(d.consentMarketing), at: now },
  };

  let leadId: string;
  try {
    const lead = await store.leads.create(input);
    leadId = lead.id;
    if (lead.agentId) {
      await store.leads.appendActivity(lead.id, { type: "assigned", actorName: null, description: "Assigned automatically to the listing agent" });
    }
    const deliveries = await dispatchLeadNotifications(lead, property);
    for (const d of deliveries) {
      await store.leads.appendActivity(lead.id, { type: "notification", actorName: null, description: d.detail });
    }
    return NextResponse.json(
      { ok: true, leadId, demo: isDemoMode, deliveries: isDemoMode ? deliveries : null },
      { status: 201, headers: { "Cache-Control": "no-store" } },
    );
  } catch (err) {
    console.error("[api/leads] Failed to store lead", err);
    return NextResponse.json({ ok: false, error: "We couldn't save your request. Please try again or call us." }, { status: 500 });
  }
}
