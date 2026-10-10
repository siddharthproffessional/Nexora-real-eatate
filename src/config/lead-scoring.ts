import type { LeadIntent, LeadSource } from "@/lib/domain/types";

/**
 * Lead scoring rules — transparent and configurable.
 * Every point awarded is shown to staff with its reason. Adjust weights here; no model or hidden logic.
 * Scores are a prioritisation aid for follow-up order, not a judgement about the person.
 */
export const leadScoringConfig = {
  intent: { invest: 20, buy: 18, sell: 16, lease: 10, rent: 8 } satisfies Record<LeadIntent, number>,
  budget: {
    "10m-plus": 20,
    "5m-10m": 16,
    "2m-5m": 12,
    "1m-2m": 8,
    "under-1m": 5,
    "rent-400k-plus": 12,
    "rent-200k-400k": 9,
    "rent-100k-200k": 6,
    "rent-under-100k": 3,
  } as Record<string, number>,
  source: {
    viewing_request: 20,
    referral: 15,
    property_inquiry: 14,
    sell_lease_form: 14,
    walk_in: 12,
    website_consultation: 10,
    whatsapp: 10,
    phone: 10,
    property_portal: 8,
    contact_form: 6,
    social_media: 5,
  } satisfies Record<LeadSource, number>,
  linkedProperty: 8,
  preferredCommunity: 4,
  messageProvided: 4,
  recency: [
    { withinDays: 2, points: 10 },
    { withinDays: 7, points: 6 },
    { withinDays: 30, points: 2 },
  ],
  engagementPerNote: 3,
  engagementMax: 9,
  bands: { hot: 65, warm: 45 },
};
