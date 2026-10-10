import type { ContactMethod, Furnishing, LeadIntent, LeadSource, LeadStatus, ListingCategory, ListingStatus, NoteChannel, PropertyType } from "./types";

export const categoryLabels: Record<ListingCategory, string> = {
  sale: "For sale",
  rent: "For rent",
  "off-plan": "Off-plan",
};

export const propertyTypeLabels: Record<PropertyType, string> = {
  apartment: "Apartment",
  penthouse: "Penthouse",
  villa: "Villa",
  townhouse: "Townhouse",
  office: "Office",
  retail: "Retail",
};

export const listingStatusLabels: Record<ListingStatus, string> = {
  available: "Available",
  under_offer: "Under offer",
  sold: "Sold",
  rented: "Rented",
  off_market: "Off market",
};

export const furnishingLabels: Record<Furnishing, string> = {
  furnished: "Furnished",
  unfurnished: "Unfurnished",
  partly_furnished: "Partly furnished",
};

export const leadIntentLabels: Record<LeadIntent, string> = {
  buy: "Buying",
  rent: "Renting",
  sell: "Selling",
  lease: "Leasing out",
  invest: "Investing",
};

export const leadStatusLabels: Record<LeadStatus, string> = {
  new: "New",
  contacted: "Contacted",
  qualified: "Qualified",
  viewing_scheduled: "Viewing scheduled",
  negotiation: "Negotiation",
  closed_won: "Closed – won",
  closed_lost: "Closed – lost",
};

export const leadStatusTone: Record<LeadStatus, "info" | "neutral" | "warning" | "success" | "danger" | "navy" | "gold"> = {
  new: "info",
  contacted: "neutral",
  qualified: "gold",
  viewing_scheduled: "warning",
  negotiation: "navy",
  closed_won: "success",
  closed_lost: "danger",
};

export const leadSourceLabels: Record<LeadSource, string> = {
  website_consultation: "Website consultation",
  property_inquiry: "Property inquiry",
  viewing_request: "Viewing request",
  sell_lease_form: "Sell or lease form",
  contact_form: "Contact form",
  whatsapp: "WhatsApp",
  phone: "Phone call",
  referral: "Referral",
  property_portal: "Property portal",
  social_media: "Social media",
  walk_in: "Walk-in",
};

export const contactMethodLabels: Record<ContactMethod, string> = {
  phone: "Phone call",
  whatsapp: "WhatsApp",
  email: "Email",
};

export const noteChannelLabels: Record<NoteChannel, string> = {
  note: "Internal note",
  call: "Call",
  whatsapp: "WhatsApp",
  email: "Email",
  meeting: "Meeting",
};

/** Budget bands — sale bands are total price, rent bands are annual rent (AED). */
export const budgetBands = {
  sale: [
    { value: "under-1m", label: "Under AED 1M" },
    { value: "1m-2m", label: "AED 1M – 2M" },
    { value: "2m-5m", label: "AED 2M – 5M" },
    { value: "5m-10m", label: "AED 5M – 10M" },
    { value: "10m-plus", label: "AED 10M and above" },
  ],
  rent: [
    { value: "rent-under-100k", label: "Under AED 100K a year" },
    { value: "rent-100k-200k", label: "AED 100K – 200K a year" },
    { value: "rent-200k-400k", label: "AED 200K – 400K a year" },
    { value: "rent-400k-plus", label: "AED 400K a year and above" },
  ],
} as const;

export const allBudgetBands = [...budgetBands.sale, ...budgetBands.rent];

export function budgetBandLabel(value: string | null) {
  if (!value) return "Not specified";
  return allBudgetBands.find((b) => b.value === value)?.label ?? value;
}

export const viewingTimeSlots = [
  { value: "morning", label: "Morning (9:00 – 12:00)" },
  { value: "afternoon", label: "Afternoon (12:00 – 16:00)" },
  { value: "evening", label: "Evening (16:00 – 19:00)" },
] as const;
