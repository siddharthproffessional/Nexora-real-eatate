/** Dialling codes offered in phone fields. UAE and India first, then by likely buyer origin. */
export const dialCodes = [
  { code: "+971", short: "AE", label: "United Arab Emirates" },
  { code: "+91", short: "IN", label: "India" },
  { code: "+44", short: "GB", label: "United Kingdom" },
  { code: "+1", short: "US/CA", label: "United States / Canada" },
  { code: "+966", short: "SA", label: "Saudi Arabia" },
  { code: "+974", short: "QA", label: "Qatar" },
  { code: "+965", short: "KW", label: "Kuwait" },
  { code: "+968", short: "OM", label: "Oman" },
  { code: "+973", short: "BH", label: "Bahrain" },
  { code: "+92", short: "PK", label: "Pakistan" },
  { code: "+880", short: "BD", label: "Bangladesh" },
  { code: "+94", short: "LK", label: "Sri Lanka" },
  { code: "+977", short: "NP", label: "Nepal" },
  { code: "+20", short: "EG", label: "Egypt" },
  { code: "+961", short: "LB", label: "Lebanon" },
  { code: "+962", short: "JO", label: "Jordan" },
  { code: "+90", short: "TR", label: "Türkiye" },
  { code: "+7", short: "RU/KZ", label: "Russia / Kazakhstan" },
  { code: "+49", short: "DE", label: "Germany" },
  { code: "+33", short: "FR", label: "France" },
  { code: "+39", short: "IT", label: "Italy" },
  { code: "+34", short: "ES", label: "Spain" },
  { code: "+31", short: "NL", label: "Netherlands" },
  { code: "+41", short: "CH", label: "Switzerland" },
  { code: "+86", short: "CN", label: "China" },
  { code: "+852", short: "HK", label: "Hong Kong" },
  { code: "+65", short: "SG", label: "Singapore" },
  { code: "+61", short: "AU", label: "Australia" },
  { code: "+27", short: "ZA", label: "South Africa" },
  { code: "+234", short: "NG", label: "Nigeria" },
  { code: "+254", short: "KE", label: "Kenya" },
] as const;

export const dialCodeValues = dialCodes.map((d) => d.code) as [string, ...string[]];

/** Pretty-print an E.164 number by splitting off a known dialling code. */
export function formatPhone(e164: string) {
  const match = [...dialCodes].sort((a, b) => b.code.length - a.code.length).find((d) => e164.startsWith(d.code));
  if (!match) return e164;
  const rest = e164.slice(match.code.length);
  return `${match.code} ${rest.replace(/(\d{2,3})(?=(\d{3,4})+$)/g, "$1 ")}`.trim();
}
