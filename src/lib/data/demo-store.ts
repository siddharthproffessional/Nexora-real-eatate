import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import type { Agent, Lead, Property, StaffUser } from "@/lib/domain/types";
import { leadStatusLabels } from "@/lib/domain/labels";
import { env } from "@/lib/env";
import { demoProperties } from "@/lib/demo/properties";
import { demoAgents } from "@/lib/demo/people";
import { generateDemoLeads } from "@/lib/demo/leads";
import { filterProperties, paginate } from "@/lib/search/filter";
import { applyPropertyInput, nextRef } from "./mapping";
import { NotFoundError, type DataStore, type LeadListFilter } from "./types";

/**
 * Demo backend: a JSON file on local disk.
 *
 * Seeded with the demonstration listings, fictional advisors and illustrative leads. Real submissions made
 * through the site are stored alongside them (isDemo: false) so the full lead workflow can be demonstrated.
 * Suitable for local demos and single-instance hosting only — use Supabase for production.
 */

const SEED_VERSION = 5;

interface DemoState {
  seedVersion: number;
  createdAt: string;
  properties: Property[];
  leads: Lead[];
  agents: Agent[];
}

export function demoDataDir() {
  if (env.demoDataDir) return env.demoDataDir;
  if (process.env.VERCEL) return "/tmp/nexora-demo";
  return path.join(process.cwd(), ".data");
}

const storeFile = () => path.join(demoDataDir(), "demo-store.json");

type Cache = { state: DemoState | null; loading: Promise<DemoState> | null; writeChain: Promise<void> };
const globalCache = globalThis as unknown as { __nexoraDemo?: Cache };
const cache: Cache = (globalCache.__nexoraDemo ??= { state: null, loading: null, writeChain: Promise.resolve() });

function seed(): DemoState {
  const now = new Date();
  return {
    seedVersion: SEED_VERSION,
    createdAt: now.toISOString(),
    properties: structuredClone(demoProperties),
    agents: structuredClone(demoAgents),
    leads: generateDemoLeads(now),
  };
}

async function load(): Promise<DemoState> {
  if (cache.state) return cache.state;
  cache.loading ??= (async () => {
    try {
      const raw = await fs.readFile(storeFile(), "utf8");
      const parsed = JSON.parse(raw) as DemoState;
      if (parsed.seedVersion !== SEED_VERSION) {
        // Demo content changed: refresh seeded records, keep anything created through the app.
        const fresh = seed();
        parsed.properties = [...fresh.properties, ...parsed.properties.filter((p) => !p.isDemo)];
        parsed.agents = fresh.agents;
        parsed.leads = [...parsed.leads.filter((l) => !l.isDemo), ...fresh.leads];
        parsed.seedVersion = SEED_VERSION;
      }
      cache.state = parsed;
    } catch {
      cache.state = seed();
      await persist();
    }
    return cache.state!;
  })();
  return cache.loading;
}

async function persist() {
  const state = cache.state;
  if (!state) return;
  cache.writeChain = cache.writeChain.then(async () => {
    const file = storeFile();
    await fs.mkdir(path.dirname(file), { recursive: true });
    const tmp = `${file}.${process.pid}.tmp`;
    await fs.writeFile(tmp, JSON.stringify(state), "utf8");
    await fs.rename(tmp, file);
  });
  try {
    await cache.writeChain;
  } catch (err) {
    console.error("[demo-store] Could not persist demo data:", err);
  }
}

function leadVisible(lead: Lead, f: LeadListFilter) {
  if (f.visibleToAgentId && lead.agentId && lead.agentId !== f.visibleToAgentId) return false;
  if (f.status && lead.status !== f.status) return false;
  if (f.source && lead.source !== f.source) return false;
  if (f.intent && lead.intent !== f.intent) return false;
  if (f.agentId) {
    if (f.agentId === "unassigned" ? lead.agentId !== null : lead.agentId !== f.agentId) return false;
  }
  if (f.q) {
    const q = f.q.toLowerCase();
    if (![lead.name, lead.email, lead.phone, lead.message ?? ""].some((s) => s.toLowerCase().includes(q))) return false;
  }
  return true;
}

const activity = (type: Lead["activity"][number]["type"], description: string, actorName: string | null) => ({
  id: randomUUID(),
  type,
  description,
  actorName,
  at: new Date().toISOString(),
});

export function createDemoStore(): DataStore {
  return {
    backend: "demo",
    properties: {
      async search(query) {
        const s = await load();
        return paginate(filterProperties(s.properties, query), query.page);
      },
      async getBySlug(slug, opts) {
        const s = await load();
        const p = s.properties.find((x) => x.slug === slug);
        return p && (p.published || opts?.includeUnpublished) ? p : null;
      },
      async getById(id) {
        const s = await load();
        return s.properties.find((x) => x.id === id) ?? null;
      },
      async getByIds(ids) {
        const s = await load();
        return ids.map((id) => s.properties.find((p) => p.id === id && p.published)).filter((p): p is Property => Boolean(p));
      },
      async listFeatured(limit) {
        const s = await load();
        return s.properties
          .filter((p) => p.published && p.featured && p.status === "available")
          .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
          .slice(0, limit);
      },
      async listSimilar(property, limit) {
        const s = await load();
        const score = (p: Property) =>
          (p.communitySlug === property.communitySlug ? 3 : 0) +
          (p.type === property.type ? 2 : 0) +
          (Math.abs(p.price - property.price) / property.price < 0.35 ? 2 : 0);
        return s.properties
          .filter((p) => p.published && p.id !== property.id && p.category === property.category && p.segment === property.segment)
          .sort((a, b) => score(b) - score(a))
          .slice(0, limit);
      },
      async listPublished() {
        const s = await load();
        return s.properties.filter((p) => p.published);
      },
      async listForAdmin(filter) {
        const s = await load();
        return s.properties
          .filter((p) => (filter.status ? p.status === filter.status : true))
          .filter((p) => (filter.published === undefined ? true : p.published === filter.published))
          .filter((p) => (filter.agentId ? p.agentId === filter.agentId : true))
          .filter((p) => (filter.q ? `${p.title} ${p.ref}`.toLowerCase().includes(filter.q.toLowerCase()) : true))
          .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
      },
      async create(input, actor) {
        const s = await load();
        const now = new Date().toISOString();
        const ref = nextRef(s.properties.filter((p) => !p.isDemo).map((p) => p.ref));
        const base: Property = {
          id: `prop_${randomUUID()}`,
          ref,
          slug: "",
          title: input.title,
          category: input.category,
          segment: input.segment,
          type: input.type,
          communitySlug: input.communitySlug,
          building: null,
          price: input.price,
          bedrooms: input.bedrooms,
          bathrooms: input.bathrooms,
          areaSqft: input.areaSqft,
          plotSqft: null,
          furnishing: null,
          summary: input.summary,
          description: [],
          amenities: [],
          images: [],
          floorPlan: null,
          location: { lat: 0, lng: 0, precision: "community" },
          agentId: actor.role === "agent" ? actor.agentId : null,
          featured: false,
          published: false,
          status: "available",
          verification: null,
          offPlan: null,
          rentalYield: null,
          isDemo: false,
          createdAt: now,
          updatedAt: now,
        };
        const isAdmin = actor.role === "admin";
        const created = applyPropertyInput(base, input, { canPublish: isAdmin, canVerify: isAdmin, canAssign: isAdmin, actorName: actor.name, now });
        s.properties.unshift(created);
        await persist();
        return created;
      },
      async update(id, input, actor) {
        const s = await load();
        const idx = s.properties.findIndex((p) => p.id === id);
        if (idx < 0) throw new NotFoundError("Property");
        const isAdmin = actor.role === "admin";
        const updated = applyPropertyInput(s.properties[idx]!, input, {
          canPublish: isAdmin,
          canVerify: isAdmin,
          canAssign: isAdmin,
          actorName: actor.name,
          now: new Date().toISOString(),
        });
        s.properties[idx] = updated;
        await persist();
        return updated;
      },
      async setPublished(id, published) {
        const s = await load();
        const p = s.properties.find((x) => x.id === id);
        if (!p) throw new NotFoundError("Property");
        p.published = published;
        p.updatedAt = new Date().toISOString();
        await persist();
        return p;
      },
      async addImages(id, images) {
        const s = await load();
        const p = s.properties.find((x) => x.id === id);
        if (!p) throw new NotFoundError("Property");
        p.images = [...p.images, ...images].slice(0, 30);
        p.updatedAt = new Date().toISOString();
        await persist();
        return p;
      },
      async removeImage(id, src) {
        const s = await load();
        const p = s.properties.find((x) => x.id === id);
        if (!p) throw new NotFoundError("Property");
        p.images = p.images.filter((i) => i.src !== src);
        p.updatedAt = new Date().toISOString();
        await persist();
        return p;
      },
      async reorderImage(id, src, direction) {
        const s = await load();
        const p = s.properties.find((x) => x.id === id);
        if (!p) throw new NotFoundError("Property");
        const i = p.images.findIndex((img) => img.src === src);
        const j = direction === "up" ? i - 1 : i + 1;
        if (i >= 0 && j >= 0 && j < p.images.length) {
          [p.images[i], p.images[j]] = [p.images[j]!, p.images[i]!];
          p.updatedAt = new Date().toISOString();
          await persist();
        }
        return p;
      },
    },

    leads: {
      async create(input) {
        const s = await load();
        const now = new Date().toISOString();
        const lead: Lead = {
          ...input,
          id: `lead_${randomUUID()}`,
          createdAt: now,
          updatedAt: now,
          status: "new",
          agentId: input.agentId ?? null,
          followUpAt: null,
          notes: [],
          activity: [activity("created", `Lead created from the ${input.source.replace(/_/g, " ")}`, null)],
          isDemo: false,
        };
        s.leads.unshift(lead);
        await persist();
        return lead;
      },
      async list(filter) {
        const s = await load();
        return s.leads.filter((l) => leadVisible(l, filter)).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      },
      async getById(id) {
        const s = await load();
        return s.leads.find((l) => l.id === id) ?? null;
      },
      async update(id, patch, actor: StaffUser) {
        const s = await load();
        const lead = s.leads.find((l) => l.id === id);
        if (!lead) throw new NotFoundError("Lead");
        if (patch.status && patch.status !== lead.status) {
          lead.activity.push(
            activity("status_changed", `Status changed from ${leadStatusLabels[lead.status]} to ${leadStatusLabels[patch.status]}`, actor.name),
          );
          lead.status = patch.status;
        }
        if (patch.agentId !== undefined && patch.agentId !== lead.agentId) {
          const agent = patch.agentId ? s.agents.find((a) => a.id === patch.agentId) : null;
          lead.activity.push(activity("assigned", agent ? `Assigned to ${agent.name}` : "Unassigned", actor.name));
          lead.agentId = agent ? agent.id : null;
        }
        if (patch.followUpAt !== undefined && patch.followUpAt !== lead.followUpAt) {
          lead.activity.push(activity("follow_up_set", patch.followUpAt ? "Follow-up date updated" : "Follow-up cleared", actor.name));
          lead.followUpAt = patch.followUpAt;
        }
        lead.updatedAt = new Date().toISOString();
        await persist();
        return lead;
      },
      async addNote(id, note, actor) {
        const s = await load();
        const lead = s.leads.find((l) => l.id === id);
        if (!lead) throw new NotFoundError("Lead");
        const now = new Date().toISOString();
        lead.notes.push({ id: randomUUID(), authorId: actor.id, authorName: actor.name, channel: note.channel, body: note.body, createdAt: now });
        lead.activity.push(activity("note_added", `Added a ${note.channel === "note" ? "note" : `${note.channel} log`}`, actor.name));
        lead.updatedAt = now;
        await persist();
        return lead;
      },
      async appendActivity(id, entry) {
        const s = await load();
        const lead = s.leads.find((l) => l.id === id);
        if (!lead) return;
        lead.activity.push({ ...entry, id: randomUUID(), at: new Date().toISOString() });
        await persist();
      },
    },

    agents: {
      async list() {
        const s = await load();
        return s.agents;
      },
      async getById(id) {
        const s = await load();
        return s.agents.find((a) => a.id === id) ?? null;
      },
    },

    media: {
      async save(file) {
        const dir = path.join(demoDataDir(), "uploads");
        await fs.mkdir(dir, { recursive: true });
        const name = `${randomUUID()}.${file.extension}`;
        await fs.writeFile(path.join(dir, name), file.bytes);
        return { src: `/api/media/${name}` };
      },
    },
  };
}
