import type { Article } from "@/lib/domain/types";
import { insightPhotos, type Photo } from "@/config/media";

/**
 * Sample editorial content for the Market Insights section.
 * General information only — not legal, tax or financial advice. Market articles deliberately contain no
 * statistics; publish figures only with a cited source (e.g. Dubai Land Department open data).
 */
export const articles: (Article & { photo: Photo })[] = [
  {
    slug: "reading-the-dubai-market-this-quarter",
    title: "Reading the Dubai market this quarter: what to watch",
    category: "Market update",
    excerpt: "Transaction data, the supply pipeline and borrowing costs — the signals worth following before you buy, sell or renew a lease.",
    publishedAt: "2026-10-02",
    author: "Nexora editorial team",
    photo: insightPhotos.market,
    sourcesNote:
      "This is a sample editorial without figures. Before publication, add data with citations to primary sources such as Dubai Land Department transaction records.",
    body: [
      {
        type: "p",
        text: "Headlines about Dubai property tend to swing between extremes. A calmer approach is to follow a handful of signals that move slowly and come from primary sources, and to read them against your own plans rather than the market as a whole.",
      },
      { type: "h2", text: "Registered transactions" },
      {
        type: "p",
        text: "The Dubai Land Department records every registered sale. Watching the split between ready and off-plan sales, and between communities, says more than a single city-wide average. A community where ready-home sales are rising while off-plan launches slow is behaving very differently from one dominated by new launches.",
      },
      { type: "h2", text: "The supply pipeline" },
      {
        type: "p",
        text: "Off-plan projects due for handover in the next two to three years will add to the stock of homes for sale and rent. If you are buying to let, look at how many comparable units are scheduled to complete in the same community around the time yours does.",
      },
      { type: "h2", text: "Borrowing costs" },
      {
        type: "p",
        text: "The UAE dirham is pegged to the US dollar, so local mortgage rates broadly follow US interest-rate decisions. Mortgage buyers should stress-test repayments at a higher rate than today's offer.",
      },
      { type: "h2", text: "Rents and renewals" },
      {
        type: "p",
        text: "Rent increases on renewal are governed by the RERA rental index. Tenants and landlords should check the index calculator before a renewal conversation rather than relying on asking rents for new listings.",
      },
      {
        type: "p",
        text: "If you would like these signals applied to a specific community or budget, an advisor can walk you through the current picture with sourced data.",
      },
    ],
  },
  {
    slug: "dubai-marina-community-guide",
    title: "Living in Dubai Marina: a community guide",
    category: "Community guide",
    excerpt: "What daily life looks like around the marina, who it suits, and what to check when choosing a building.",
    publishedAt: "2026-09-24",
    author: "Nexora editorial team",
    photo: insightPhotos.community,
    sourcesNote:
      "Qualitative guide based on general knowledge of the area. Confirm building-specific details such as service charges and parking allocation for each property.",
    body: [
      {
        type: "p",
        text: "Dubai Marina is built around a man-made marina lined with towers, yacht berths and the Marina Walk promenade. The beach at JBR sits on its seaward side, and the Dubai Metro and Dubai Tram both serve the area.",
      },
      { type: "h2", text: "Who it suits" },
      {
        type: "p",
        text: "The Marina suits people who want a walkable, lively neighbourhood with restaurants, cafés and the beach close by. It is less suited to anyone who wants a private garden or a quiet street.",
      },
      { type: "h2", text: "Choosing a building" },
      {
        type: "ul",
        items: [
          "Check the annual service charge and what it covers",
          "Ask how many parking spaces come with the unit",
          "Compare views: full marina, partial sea, or city-facing",
          "Visit at different times of day to judge noise and traffic",
          "For investment, review the building's rental history with your advisor",
        ],
      },
      { type: "h2", text: "Getting around" },
      {
        type: "p",
        text: "Sheikh Zayed Road runs along the inland edge of the community. Traffic at peak hours can be heavy, so residents who commute to Downtown or DIFC often use the metro.",
      },
    ],
  },
  {
    slug: "buying-your-first-home-in-dubai",
    title: "Buying your first home in Dubai, step by step",
    category: "Buyer guide",
    excerpt: "From budgeting for fees to the transfer appointment — the stages of a typical resale purchase, explained plainly.",
    publishedAt: "2026-09-15",
    author: "Nexora editorial team",
    photo: insightPhotos.firstTime,
    sourcesNote:
      "The 4% Dubai Land Department transfer fee reflects public reporting as of late 2025. Fees and procedures change — confirm current requirements with the Dubai Land Department and your conveyancer.",
    body: [
      { type: "p", text: "Buying a ready home in Dubai follows a well-defined sequence. Knowing it in advance helps you budget accurately and avoid delays." },
      { type: "h2", text: "1. Budget for the full cost" },
      {
        type: "p",
        text: "Beyond the price, allow for the Dubai Land Department transfer fee (4% of the purchase price), registration and trustee office fees, agency commission as agreed in writing, and mortgage arrangement and valuation fees if you are borrowing.",
      },
      { type: "h2", text: "2. Arrange finance early" },
      {
        type: "p",
        text: "If you need a mortgage, obtain pre-approval before making offers. Lenders set different loan-to-value limits for residents and non-residents and for first and subsequent properties.",
      },
      { type: "h2", text: "3. Agree terms and sign the MOU" },
      {
        type: "p",
        text: "Once a price is agreed, buyer and seller sign a memorandum of understanding — the standard RERA contract known as Form F — and the buyer usually provides a security deposit cheque.",
      },
      { type: "h2", text: "4. Developer no-objection certificate" },
      {
        type: "p",
        text: "The seller applies to the developer for a no-objection certificate confirming that service charges are settled and the unit can be transferred.",
      },
      { type: "h2", text: "5. Transfer at a trustee office" },
      {
        type: "p",
        text: "Both parties, or their representatives, attend a Real Estate Registration Trustee office. Payments are exchanged, fees paid, and the title deed is issued in the buyer's name.",
      },
      { type: "p", text: "An advisor and a qualified conveyancer can manage each stage and tell you which documents to prepare." },
    ],
  },
  {
    slug: "questions-to-ask-before-investing",
    title: "Investing in Dubai property: questions to ask before you commit",
    category: "Investment education",
    excerpt: "Gross versus net yield, service charges, vacancy and off-plan safeguards — how to test an investment case properly.",
    publishedAt: "2026-09-05",
    author: "Nexora editorial team",
    photo: insightPhotos.investing,
    sourcesNote:
      "Educational content only, not financial advice. No returns are implied or guaranteed. Seek independent financial and tax advice for your circumstances.",
    body: [
      {
        type: "p",
        text: "An attractive headline yield is where an investment case starts, not where it ends. These questions help separate a sound purchase from an optimistic one.",
      },
      { type: "h2", text: "Is the yield gross or net?" },
      {
        type: "p",
        text: "Gross yield divides annual rent by the purchase price. Net yield subtracts service charges, maintenance, letting fees and periods without a tenant. The gap between the two can be significant, especially in buildings with high service charges.",
      },
      { type: "h2", text: "Where does the rent figure come from?" },
      {
        type: "p",
        text: "Ask for registered rents for comparable units in the same building, not asking prices for new listings. If no evidence is available, treat the figure as an estimate.",
      },
      { type: "h2", text: "For off-plan: is the project protected?" },
      {
        type: "ul",
        items: [
          "Confirm the project is registered with the Dubai Land Department",
          "Check that payments go into the project's escrow account",
          "Review the developer's delivery record on previous projects",
          "Read the payment plan alongside the construction milestones it is tied to",
        ],
      },
      { type: "h2", text: "What is your exit?" },
      { type: "p", text: "Think about who will buy the property from you and when. Liquidity varies by community, unit size and price point." },
    ],
  },
  {
    slug: "renting-vs-buying-in-dubai",
    title: "Renting or buying in Dubai: how to decide",
    category: "Renting vs buying",
    excerpt: "A practical framework for weighing flexibility against ownership, with the costs that are easy to overlook on both sides.",
    publishedAt: "2026-08-27",
    author: "Nexora editorial team",
    photo: insightPhotos.rentVsBuy,
    sourcesNote:
      "General guidance only. Rental rules referenced (Ejari registration and the RERA rental index) should be checked against current Dubai Land Department guidance.",
    body: [
      {
        type: "p",
        text: "Whether to rent or buy depends less on the market and more on how long you plan to stay, how certain your income is, and how much flexibility you need.",
      },
      { type: "h2", text: "When renting makes sense" },
      {
        type: "ul",
        items: [
          "You expect to move within two or three years",
          "You want to try a community before committing",
          "Your job or residency situation may change",
          "You would rather keep capital available",
        ],
      },
      { type: "h2", text: "When buying makes sense" },
      {
        type: "ul",
        items: [
          "You plan to stay for the longer term",
          "You can cover the deposit and purchase fees without stretching",
          "You want control over the home and its finishes",
          "You have compared mortgage repayments with rent for an equivalent home",
        ],
      },
      { type: "h2", text: "Costs that are easy to miss" },
      {
        type: "p",
        text: "Tenants should budget for a security deposit, agency fee, Ejari registration and utility connection. Owners pay annual service charges, maintenance and, if borrowing, mortgage-related fees.",
      },
      { type: "p", text: "Tenancy contracts in Dubai are registered through Ejari, and rent increases on renewal follow the RERA rental index." },
    ],
  },
  {
    slug: "who-can-own-property-in-dubai",
    title: "Who can own property in Dubai? Freehold areas and residency",
    category: "Ownership & regulation",
    excerpt: "How freehold ownership works for international buyers, and how property ownership relates to UAE residency visas.",
    publishedAt: "2026-08-18",
    author: "Nexora editorial team",
    photo: insightPhotos.ownership,
    sourcesNote:
      "The AED 2 million Golden Visa property threshold reflects public reporting as of late 2025. Eligibility rules are set by UAE authorities and change — confirm with the Dubai Land Department and ICP/GDRFA before relying on them. Not legal advice.",
    body: [
      {
        type: "p",
        text: "Non-UAE nationals can buy property outright in Dubai's designated freehold areas, which include many of the city's best-known communities.",
      },
      { type: "h2", text: "Freehold and leasehold" },
      {
        type: "p",
        text: "Freehold ownership gives the buyer full ownership of the unit, and of the land for villas, registered with the Dubai Land Department. In some areas, long leasehold interests are offered instead. Your advisor should confirm the tenure of any property before you make an offer.",
      },
      { type: "h2", text: "Property and residency" },
      {
        type: "p",
        text: "Property ownership can support a UAE residency visa. The long-term Golden Visa route for property investors has generally required property worth at least AED 2 million, with conditions on mortgaged and off-plan property. Smaller investments may support other visa categories.",
      },
      { type: "h2", text: "Buying through a company" },
      {
        type: "p",
        text: "Some buyers purchase through a company structure for estate-planning or business reasons. The rules depend on where the company is registered and the area where the property sits, so take legal advice first.",
      },
      { type: "p", text: "This article is general information, not legal advice. Speak to a qualified UAE lawyer about your specific situation." },
    ],
  },
];

export function getArticle(slug: string) {
  return articles.find((a) => a.slug === slug) ?? null;
}

export function readingMinutes(article: Article) {
  const words = article.body
    .map((b) => (b.type === "ul" ? b.items.join(" ") : b.text))
    .join(" ")
    .split(/\s+/).length;
  return Math.max(2, Math.round(words / 220));
}
