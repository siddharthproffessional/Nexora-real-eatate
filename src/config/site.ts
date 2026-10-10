/**
 * Brand and company configuration.
 *
 * Everything that identifies the company lives here so the temporary "NEXORA Realty" identity can be
 * replaced in one place: name, contact details, social links and regulatory information.
 * Colours and fonts live in src/app/globals.css (@theme tokens); the logo lives in
 * src/components/brand/logo.tsx.
 */

export const siteConfig = {
  name: "NEXORA Realty",
  shortName: "Nexora",
  /** Registered legal name. Leave null until the entity is incorporated in the UAE. */
  legalName: null as string | null,
  description:
    "Dubai property advisory for homebuyers, tenants, landlords and international investors. Explore homes, off-plan projects and commercial space across Dubai.",
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, ""),
  locale: "en_AE",
  currency: "AED",

  contact: {
    // Placeholder details — replace before launch.
    phoneDisplay: "+971 4 000 0000",
    phoneHref: "tel:+97140000000",
    email: "advisory@nexora-realty.example",
    addressLines: ["Office address to be confirmed", "Dubai, United Arab Emirates"],
    hours: "Monday to Saturday, 9:00 to 19:00 GST",
  },

  /** Social profiles. Set href to null to hide a network. */
  social: [
    { label: "Instagram", href: "https://www.instagram.com/", placeholder: true },
    { label: "LinkedIn", href: "https://www.linkedin.com/", placeholder: true },
    { label: "YouTube", href: "https://www.youtube.com/", placeholder: true },
  ] as { label: string; href: string | null; placeholder: boolean }[],

  /**
   * Regulatory disclosures. Do not fill these in until the licences are issued.
   * The footer only displays values that are present.
   */
  regulatory: {
    reraOrn: null as string | null, // RERA Office Registration Number
    dedTradeLicence: null as string | null, // DET / DED trade licence number
    registeredOffice: null as string | null,
  },

  /** Company story inputs used on the About page. Keep factual — no invented history. */
  company: {
    origin: "India",
    expansionMarket: "Dubai",
  },
} as const;

export const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE !== "false";

export const mainNav = [
  { label: "Buy", href: "/buy" },
  { label: "Rent", href: "/rent" },
  { label: "Off-plan", href: "/off-plan" },
  { label: "Commercial", href: "/commercial" },
  { label: "Sell or lease", href: "/sell-or-lease" },
  { label: "Communities", href: "/communities" },
  { label: "About us", href: "/about" },
  { label: "Contact", href: "/contact" },
] as const;

export const footerNav = {
  explore: [
    { label: "Properties for sale", href: "/buy" },
    { label: "Properties for rent", href: "/rent" },
    { label: "Off-plan projects", href: "/off-plan" },
    { label: "Commercial", href: "/commercial" },
    { label: "Communities", href: "/communities" },
  ],
  company: [
    { label: "About us", href: "/about" },
    { label: "Sell or lease with us", href: "/sell-or-lease" },
    { label: "Market insights", href: "/insights" },
    { label: "Contact", href: "/contact" },
    { label: "Saved properties", href: "/saved" },
  ],
  legal: [
    { label: "Privacy policy", href: "/privacy" },
    { label: "Terms of use", href: "/terms" },
  ],
};
