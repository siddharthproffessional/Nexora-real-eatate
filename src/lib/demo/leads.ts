import type { Lead, LeadIntent, LeadNote, LeadSource, LeadStatus, NoteChannel } from "@/lib/domain/types";
import { leadStatusLabels } from "@/lib/domain/labels";
import { demoAgents } from "./people";
import { demoProperties } from "./properties";

/**
 * ILLUSTRATIVE DEMO LEADS.
 * Generated deterministically relative to the moment the demo store is created, so the CRM always shows a
 * realistic recent pipeline. Names are fictional, email addresses use the reserved example.com domain and
 * phone numbers use the UK Ofcom range reserved for drama (+44 7700 900xxx).
 */

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const FIRST = [
  "Arjun",
  "Priya",
  "Omar",
  "Sophie",
  "Liam",
  "Ananya",
  "Khalid",
  "Natalia",
  "Wei",
  "Hannah",
  "Vikram",
  "Fatima",
  "Marco",
  "Isabel",
  "Dmitri",
  "Aaliyah",
  "Raj",
  "Chloe",
  "Yusuf",
  "Meera",
  "Thomas",
  "Leila",
  "Karan",
  "Emma",
  "Sergei",
  "Noor",
  "Aditya",
  "Grace",
  "Hassan",
  "Kavya",
];
const LAST = [
  "Sharma",
  "Iyer",
  "Haddad",
  "Laurent",
  "O'Connor",
  "Kapoor",
  "Al Mansoori",
  "Volkova",
  "Zhang",
  "Becker",
  "Reddy",
  "Qureshi",
  "Rossi",
  "Fernandes",
  "Ivanov",
  "Rahman",
  "Malhotra",
  "Dubois",
  "Karimi",
  "Nair",
  "Fischer",
  "Saleh",
  "Gupta",
  "Walsh",
  "Morozov",
  "Hashemi",
  "Joshi",
  "Bennett",
  "Darwish",
  "Menon",
];

function weighted<T extends string>(rand: () => number, entries: [T, number][]): T {
  const total = entries.reduce((s, [, w]) => s + w, 0);
  let r = rand() * total;
  for (const [v, w] of entries) {
    r -= w;
    if (r <= 0) return v;
  }
  return entries[entries.length - 1]![0];
}

const SOURCE_WEIGHTS: [LeadSource, number][] = [
  ["property_inquiry", 22],
  ["property_portal", 18],
  ["website_consultation", 15],
  ["whatsapp", 12],
  ["referral", 9],
  ["social_media", 8],
  ["viewing_request", 8],
  ["phone", 5],
  ["sell_lease_form", 3],
];

const NOTE_TEMPLATES: Partial<Record<LeadStatus, { channel: NoteChannel; body: string }[]>> = {
  contacted: [
    { channel: "call", body: "Introductory call held. Prefers WhatsApp for updates and evening calls." },
    { channel: "whatsapp", body: "No answer on first call — sent a WhatsApp introduction with the shortlist link." },
  ],
  qualified: [
    { channel: "call", body: "Budget and timeline confirmed. Mortgage pre-approval in progress with their bank." },
    { channel: "meeting", body: "Cash buyer. Wants a ready property within three months; open to two communities." },
  ],
  viewing_scheduled: [{ channel: "whatsapp", body: "Viewing confirmed for Saturday morning. Sent location pin and building access details." }],
  negotiation: [{ channel: "email", body: "Offer submitted below asking. Awaiting the owner's response through their agent." }],
  closed_won: [{ channel: "note", body: "Agreement signed. Handing over to conveyancing and the transfer checklist." }],
  closed_lost: [
    { channel: "note", body: "Chose a property through another agency. Keep in touch for future requirements." },
    { channel: "call", body: "Search paused — relocation moved to next year. Follow up in six months." },
  ],
};

const PIPELINE: LeadStatus[] = ["new", "contacted", "qualified", "viewing_scheduled", "negotiation", "closed_won"];

function pickStatus(rand: () => number, ageDays: number): LeadStatus {
  if (ageDays < 2) return rand() < 0.75 ? "new" : "contacted";
  // Older leads have had more time to progress.
  const maxStage = Math.min(PIPELINE.length - 1, 1 + Math.floor(ageDays / 9));
  if (ageDays > 14 && rand() < 0.16) return "closed_lost";
  if (ageDays > 28 && rand() < 0.16) return "closed_won";
  const stage = Math.floor(Math.pow(rand(), 1.35) * (maxStage + 1));
  return PIPELINE[Math.min(stage, maxStage)]!;
}

function intentFor(source: LeadSource, rand: () => number): LeadIntent {
  if (source === "sell_lease_form") return rand() < 0.65 ? "sell" : "lease";
  if (source === "property_inquiry" || source === "viewing_request" || source === "property_portal") {
    return weighted(rand, [
      ["buy", 45],
      ["invest", 25],
      ["rent", 30],
    ]);
  }
  return weighted(rand, [
    ["buy", 38],
    ["invest", 22],
    ["rent", 25],
    ["sell", 6],
    ["lease", 4],
  ]);
}

function budgetFor(intent: LeadIntent, rand: () => number) {
  if (intent === "rent" || intent === "lease") {
    return weighted(rand, [
      ["rent-under-100k", 3],
      ["rent-100k-200k", 4],
      ["rent-200k-400k", 2],
      ["rent-400k-plus", 1],
    ]);
  }
  return weighted(rand, [
    ["under-1m", 2],
    ["1m-2m", 4],
    ["2m-5m", 5],
    ["5m-10m", 2],
    ["10m-plus", 1],
  ]);
}

export function generateDemoLeads(now: Date = new Date(), count = 74): Lead[] {
  const rand = mulberry32(20261010);
  const leads: Lead[] = [];
  const DAY = 86_400_000;

  for (let i = 0; i < count; i++) {
    // Skew towards recent dates to show a growing pipeline.
    const ageDays = Math.floor(Math.pow(rand(), 1.25) * 84);
    const createdAt = new Date(now.getTime() - ageDays * DAY - Math.floor(rand() * 10) * 3_600_000);
    const first = FIRST[Math.floor(rand() * FIRST.length)]!;
    const last = LAST[Math.floor(rand() * LAST.length)]!;
    const source = weighted(rand, SOURCE_WEIGHTS);
    const intent = intentFor(source, rand);
    const status = pickStatus(rand, ageDays);

    const linkedProperty =
      source === "property_inquiry" || source === "viewing_request" || source === "property_portal"
        ? (demoProperties.filter((p) => (intent === "rent" ? p.category === "rent" : p.category !== "rent"))[Math.floor(rand() * 12) % 12] ?? null)
        : null;

    const agent =
      status === "new" && rand() < 0.6
        ? null
        : linkedProperty?.agentId
          ? demoAgents.find((a) => a.id === linkedProperty.agentId)!
          : demoAgents[Math.floor(rand() * demoAgents.length)]!;

    const active = !["closed_won", "closed_lost"].includes(status);
    const followUpAt = active && status !== "new" ? new Date(now.getTime() + (Math.floor(rand() * 10) - 2) * DAY).toISOString() : null;

    const id = `lead_demo_${String(i + 1).padStart(3, "0")}`;
    const at = createdAt.toISOString();

    const notes: LeadNote[] = [];
    const statusIndex = PIPELINE.indexOf(status);
    const reached = status === "closed_lost" ? ["contacted", "closed_lost"] : PIPELINE.slice(1, statusIndex + 1);
    reached.forEach((s, idx) => {
      const options = NOTE_TEMPLATES[s as LeadStatus];
      if (!options || !agent) return;
      const tmpl = options[Math.floor(rand() * options.length)]!;
      notes.push({
        id: `${id}_note_${idx}`,
        authorId: agent.id,
        authorName: agent.name,
        channel: tmpl.channel,
        body: tmpl.body,
        createdAt: new Date(Math.min(now.getTime(), createdAt.getTime() + (idx + 1) * 1.5 * DAY)).toISOString(),
      });
    });

    const activity = [
      { id: `${id}_act_0`, type: "created" as const, actorName: null, description: `Lead created from ${source.replace(/_/g, " ")}`, at },
      ...(agent
        ? [
            {
              id: `${id}_act_1`,
              type: "assigned" as const,
              actorName: "Demo Administrator",
              description: `Assigned to ${agent.name}`,
              at: new Date(createdAt.getTime() + 2 * 3_600_000).toISOString(),
            },
          ]
        : []),
      ...(status !== "new"
        ? [
            {
              id: `${id}_act_2`,
              type: "status_changed" as const,
              actorName: agent?.name ?? null,
              description: `Status changed to ${leadStatusLabels[status]}`,
              at: notes.at(-1)?.createdAt ?? at,
            },
          ]
        : []),
    ];

    leads.push({
      id,
      createdAt: at,
      updatedAt: notes.at(-1)?.createdAt ?? at,
      name: `${first} ${last}`,
      email: `${first}.${last}`.toLowerCase().replace(/[^a-z.]/g, "") + "@example.com",
      phone: `+447700900${String(200 + i).padStart(3, "0")}`,
      intent,
      budgetBand: budgetFor(intent, rand),
      preferredCommunity:
        linkedProperty?.communitySlug ??
        (rand() < 0.7
          ? ["downtown-dubai", "dubai-marina", "palm-jumeirah", "business-bay", "dubai-hills-estate", "dubai-creek-harbour", "jumeirah-village-circle"][
              Math.floor(rand() * 7)
            ]!
          : null),
      contactMethod: weighted(rand, [
        ["whatsapp", 5],
        ["phone", 3],
        ["email", 2],
      ]),
      message: linkedProperty ? `Interested in ${linkedProperty.ref}. Please share availability and next steps.` : null,
      source,
      propertyId: linkedProperty?.id ?? null,
      viewing:
        source === "viewing_request"
          ? { date: new Date(createdAt.getTime() + 3 * DAY).toISOString().slice(0, 10), timeSlot: ["morning", "afternoon", "evening"][Math.floor(rand() * 3)]! }
          : null,
      sellDetails: null,
      status,
      agentId: agent?.id ?? null,
      followUpAt,
      utm: source === "social_media" ? { source: "instagram", medium: "paid_social", campaign: "dubai-launch" } : null,
      consent: { privacy: true, marketing: rand() < 0.55, at },
      isDemo: true,
      notes,
      activity,
    });
  }
  return leads.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
