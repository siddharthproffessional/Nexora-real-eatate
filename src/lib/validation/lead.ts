import { z } from "zod";
import { CONTACT_METHODS, LEAD_INTENTS, PROPERTY_TYPES } from "@/lib/domain/types";
import { allBudgetBands, viewingTimeSlots } from "@/lib/domain/labels";
import { dialCodeValues } from "@/lib/domain/countries";

/**
 * Public lead submission schema — used by the browser for instant feedback and re-run on the server,
 * which is the source of truth.
 */

const trimmed = (schema: z.ZodString) => z.preprocess((v) => (typeof v === "string" ? v.trim() : v), schema);
const optionalText = (max: number) =>
  z.preprocess((v) => (typeof v === "string" && v.trim() === "" ? undefined : typeof v === "string" ? v.trim() : v), z.string().max(max).optional());

export const PUBLIC_LEAD_SOURCES = ["website_consultation", "property_inquiry", "viewing_request", "sell_lease_form", "contact_form"] as const;

const budgetValues = allBudgetBands.map((b) => b.value) as [string, ...string[]];
const timeSlotValues = viewingTimeSlots.map((s) => s.value) as [string, ...string[]];

export const leadSubmissionSchema = z
  .object({
    name: trimmed(z.string().min(2, "Enter your full name").max(120, "Name is too long")),
    email: z.preprocess((v) => (typeof v === "string" ? v.trim().toLowerCase() : v), z.email("Enter a valid email address").max(200)),
    phoneCountry: z.enum(dialCodeValues, "Choose a country code"),
    phoneNumber: z.preprocess(
      (v) => (typeof v === "string" ? v.replace(/[\s()-]/g, "").replace(/^0+/, "") : v),
      z.string().regex(/^\d{6,14}$/, "Enter a valid phone number, digits only"),
    ),
    intent: z.enum(LEAD_INTENTS, "Tell us what you would like to do"),
    budgetBand: z.preprocess((v) => (v === "" ? undefined : v), z.enum(budgetValues).optional()),
    preferredCommunity: optionalText(80),
    contactMethod: z.enum(CONTACT_METHODS, "Choose how we should contact you"),
    message: optionalText(2000),
    source: z.enum(PUBLIC_LEAD_SOURCES),
    propertyId: optionalText(64),
    viewingDate: optionalText(10),
    viewingTimeSlot: z.preprocess((v) => (v === "" ? undefined : v), z.enum(timeSlotValues).optional()),
    sellPropertyType: z.preprocess((v) => (v === "" ? undefined : v), z.enum(PROPERTY_TYPES).optional()),
    sellCommunity: optionalText(80),
    sellBedrooms: z.preprocess((v) => (v === "" || v == null ? undefined : Number(v)), z.number().int().min(0).max(20).optional()),
    sellAreaSqft: z.preprocess((v) => (v === "" || v == null ? undefined : Number(v)), z.number().int().min(100).max(200_000).optional()),
    sellExpectedPrice: z.preprocess(
      (v) => (v === "" || v == null ? undefined : Number(String(v).replace(/,/g, ""))),
      z.number().int().min(0).max(2_000_000_000).optional(),
    ),
    sellTimeline: optionalText(60),
    consentPrivacy: z.literal(true, "Please confirm you agree to the privacy policy"),
    consentMarketing: z.boolean().optional().default(false),
    utmSource: optionalText(100),
    utmMedium: optionalText(100),
    utmCampaign: optionalText(150),
    /** Honeypot — real visitors never see or fill this field. */
    website: z.string().max(0, "Invalid submission").optional(),
  })
  .superRefine((data, ctx) => {
    if (data.source === "viewing_request") {
      if (!data.propertyId) ctx.addIssue({ code: "custom", path: ["propertyId"], message: "A property is required for a viewing request" });
      if (!data.viewingDate || !/^\d{4}-\d{2}-\d{2}$/.test(data.viewingDate)) {
        ctx.addIssue({ code: "custom", path: ["viewingDate"], message: "Choose a preferred date" });
      } else if (!isViewingDateAllowed(data.viewingDate)) {
        ctx.addIssue({ code: "custom", path: ["viewingDate"], message: "Choose a date between tomorrow and 90 days from now" });
      }
      if (!data.viewingTimeSlot) ctx.addIssue({ code: "custom", path: ["viewingTimeSlot"], message: "Choose a preferred time" });
    }
    if (data.source === "sell_lease_form") {
      if (data.intent !== "sell" && data.intent !== "lease") {
        ctx.addIssue({ code: "custom", path: ["intent"], message: "Choose sell or lease" });
      }
      if (!data.sellPropertyType) ctx.addIssue({ code: "custom", path: ["sellPropertyType"], message: "Choose the property type" });
      if (!data.sellCommunity) ctx.addIssue({ code: "custom", path: ["sellCommunity"], message: "Tell us where the property is" });
    }
    const totalDigits = data.phoneCountry.length - 1 + (data.phoneNumber?.length ?? 0);
    if (totalDigits > 15) ctx.addIssue({ code: "custom", path: ["phoneNumber"], message: "Phone number is too long" });
  });

export type LeadSubmissionInput = z.input<typeof leadSubmissionSchema>;
export type LeadSubmission = z.output<typeof leadSubmissionSchema>;

/** Today's date in Dubai as YYYY-MM-DD. */
export function dubaiToday(now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Dubai", year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
}

export function addDays(isoDate: string, days: number) {
  const d = new Date(`${isoDate}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function isViewingDateAllowed(date: string, now = new Date()) {
  const today = dubaiToday(now);
  return date >= addDays(today, 1) && date <= addDays(today, 90);
}

/** Flatten zod issues into { field: message } for form display. First message per field wins. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.length ? String(issue.path[0]) : "_form";
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
