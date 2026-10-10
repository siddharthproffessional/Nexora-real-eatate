/**
 * Core domain model. Shared by the public site, CRM, admin, API routes and both data backends.
 * Mirrors the Supabase schema in supabase/migrations/0001_init.sql.
 */

export const LISTING_CATEGORIES = ["sale", "rent", "off-plan"] as const;
export type ListingCategory = (typeof LISTING_CATEGORIES)[number];

export const PROPERTY_SEGMENTS = ["residential", "commercial"] as const;
export type PropertySegment = (typeof PROPERTY_SEGMENTS)[number];

export const PROPERTY_TYPES = ["apartment", "penthouse", "villa", "townhouse", "office", "retail"] as const;
export type PropertyType = (typeof PROPERTY_TYPES)[number];

export const LISTING_STATUSES = ["available", "under_offer", "sold", "rented", "off_market"] as const;
export type ListingStatus = (typeof LISTING_STATUSES)[number];

export const FURNISHING_OPTIONS = ["furnished", "unfurnished", "partly_furnished"] as const;
export type Furnishing = (typeof FURNISHING_OPTIONS)[number];

export interface PropertyImage {
  src: string;
  alt: string;
  credit?: string | null;
  /** Visualisations (CGI renders) must be labelled as such on the site. */
  kind?: "photo" | "visualisation";
}

/** Only set when staff have checked the listing's advertising permit (e.g. DLD Trakheesi). */
export interface ListingVerification {
  permitNumber: string;
  verifiedAt: string;
  verifiedBy: string;
}

export interface OffPlanDetails {
  projectName: string;
  /** Null when the developer has not been supplied or confirmed. */
  developer: string | null;
  /** Handover is only displayed publicly when verified is true. */
  handover: { label: string; verified: boolean } | null;
  /** As supplied by the developer. Null when not supplied. */
  paymentPlan: string | null;
}

/** Only populate from a reliable, citable data source. */
export interface RentalYield {
  grossPercent: number;
  source: string;
  asOf: string;
}

export interface Property {
  id: string;
  ref: string;
  slug: string;
  title: string;
  category: ListingCategory;
  segment: PropertySegment;
  type: PropertyType;
  communitySlug: string;
  building: string | null;
  /** AED. For rentals this is the annual rent. For off-plan it is the starting price. */
  price: number;
  bedrooms: number;
  bathrooms: number;
  areaSqft: number;
  plotSqft: number | null;
  furnishing: Furnishing | null;
  summary: string;
  description: string[];
  amenities: string[];
  images: PropertyImage[];
  floorPlan: PropertyImage | null;
  location: { lat: number; lng: number; precision: "community" | "exact" };
  agentId: string | null;
  featured: boolean;
  published: boolean;
  status: ListingStatus;
  verification: ListingVerification | null;
  offPlan: OffPlanDetails | null;
  rentalYield: RentalYield | null;
  isDemo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Agent {
  id: string;
  name: string;
  title: string;
  email: string;
  phone: string;
  languages: string[];
  focus: string;
  active: boolean;
  isDemo: boolean;
}

export const LEAD_INTENTS = ["buy", "rent", "sell", "lease", "invest"] as const;
export type LeadIntent = (typeof LEAD_INTENTS)[number];

export const LEAD_STATUSES = ["new", "contacted", "qualified", "viewing_scheduled", "negotiation", "closed_won", "closed_lost"] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

export const LEAD_SOURCES = [
  "website_consultation",
  "property_inquiry",
  "viewing_request",
  "sell_lease_form",
  "contact_form",
  "whatsapp",
  "phone",
  "referral",
  "property_portal",
  "social_media",
  "walk_in",
] as const;
export type LeadSource = (typeof LEAD_SOURCES)[number];

export const CONTACT_METHODS = ["phone", "whatsapp", "email"] as const;
export type ContactMethod = (typeof CONTACT_METHODS)[number];

export const NOTE_CHANNELS = ["note", "call", "whatsapp", "email", "meeting"] as const;
export type NoteChannel = (typeof NOTE_CHANNELS)[number];

export interface LeadNote {
  id: string;
  authorId: string;
  authorName: string;
  channel: NoteChannel;
  body: string;
  createdAt: string;
}

export type LeadActivityType = "created" | "status_changed" | "assigned" | "note_added" | "follow_up_set" | "notification" | "updated";

export interface LeadActivity {
  id: string;
  type: LeadActivityType;
  actorName: string | null;
  description: string;
  at: string;
}

export interface SellLeaseDetails {
  propertyType: PropertyType | null;
  community: string | null;
  bedrooms: number | null;
  areaSqft: number | null;
  expectedPrice: number | null;
  timeline: string | null;
}

export interface Lead {
  id: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  email: string;
  /** E.164, e.g. +971501234567 */
  phone: string;
  intent: LeadIntent;
  budgetBand: string | null;
  preferredCommunity: string | null;
  contactMethod: ContactMethod;
  message: string | null;
  source: LeadSource;
  propertyId: string | null;
  viewing: { date: string; timeSlot: string } | null;
  sellDetails: SellLeaseDetails | null;
  status: LeadStatus;
  agentId: string | null;
  followUpAt: string | null;
  utm: { source: string | null; medium: string | null; campaign: string | null } | null;
  consent: { privacy: boolean; marketing: boolean; at: string };
  isDemo: boolean;
  notes: LeadNote[];
  activity: LeadActivity[];
}

export type StaffRole = "admin" | "agent";

export interface StaffUser {
  id: string;
  email: string;
  name: string;
  role: StaffRole;
  /** Links an agent login to the Agent record used for lead/listing assignment. */
  agentId: string | null;
}

export interface Community {
  slug: string;
  name: string;
  /** One-sentence introduction for cards. */
  intro: string;
  /** Longer editorial overview, paragraph per entry. */
  overview: string[];
  highlights: string[];
  propertyStyles: string[];
  location: { lat: number; lng: number };
  /** Designated freehold area for non-UAE nationals. Verify against current DLD guidance before publishing. */
  freehold: boolean;
}

export interface Article {
  slug: string;
  title: string;
  category: "Market update" | "Community guide" | "Buyer guide" | "Investment education" | "Renting vs buying" | "Ownership & regulation";
  excerpt: string;
  publishedAt: string;
  author: string;
  body: ({ type: "p"; text: string } | { type: "h2"; text: string } | { type: "ul"; items: string[] })[];
  /** Short note on the article's sources / verification status. */
  sourcesNote: string;
}
