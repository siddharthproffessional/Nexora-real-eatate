import "server-only";
import { randomUUID } from "node:crypto";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Agent, Lead, LeadActivity, LeadNote, Property, StaffUser } from "@/lib/domain/types";
import { leadStatusLabels } from "@/lib/domain/labels";
import { env } from "@/lib/env";
import { PAGE_SIZE } from "@/lib/search/query";
import { applyPropertyInput, nextRef } from "./mapping";
import { NotFoundError, type DataStore } from "./types";

/**
 * Supabase backend.
 *
 * Runs only on the server with the service-role key; authorisation is enforced in the app layer
 * (src/lib/auth) AND by row-level security policies in supabase/migrations for any direct client access.
 * Schema: supabase/migrations/0001_init.sql.
 */

let client: SupabaseClient | null = null;
function db() {
  if (!env.supabase.url || !env.supabase.serviceRoleKey) throw new Error("Supabase is not configured");
  client ??= createClient(env.supabase.url, env.supabase.serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return client;
}

/* ── Row mapping ──────────────────────────────────────────── */

type PropertyRow = {
  id: string;
  ref: string;
  slug: string;
  title: string;
  category: Property["category"];
  segment: Property["segment"];
  type: Property["type"];
  community_slug: string;
  building: string | null;
  price: number;
  bedrooms: number;
  bathrooms: number;
  area_sqft: number;
  plot_sqft: number | null;
  furnishing: Property["furnishing"];
  summary: string;
  description: string[];
  amenities: string[];
  images: Property["images"];
  floor_plan: Property["floorPlan"];
  lat: number;
  lng: number;
  location_precision: "community" | "exact";
  agent_id: string | null;
  featured: boolean;
  published: boolean;
  status: Property["status"];
  verification: Property["verification"];
  off_plan: Property["offPlan"];
  rental_yield: Property["rentalYield"];
  is_demo: boolean;
  created_at: string;
  updated_at: string;
};

export function propertyFromRow(r: PropertyRow): Property {
  return {
    id: r.id,
    ref: r.ref,
    slug: r.slug,
    title: r.title,
    category: r.category,
    segment: r.segment,
    type: r.type,
    communitySlug: r.community_slug,
    building: r.building,
    price: Number(r.price),
    bedrooms: r.bedrooms,
    bathrooms: r.bathrooms,
    areaSqft: r.area_sqft,
    plotSqft: r.plot_sqft,
    furnishing: r.furnishing,
    summary: r.summary,
    description: r.description ?? [],
    amenities: r.amenities ?? [],
    images: r.images ?? [],
    floorPlan: r.floor_plan,
    location: { lat: r.lat, lng: r.lng, precision: r.location_precision },
    agentId: r.agent_id,
    featured: r.featured,
    published: r.published,
    status: r.status,
    verification: r.verification,
    offPlan: r.off_plan,
    rentalYield: r.rental_yield,
    isDemo: r.is_demo,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

export function propertyToRow(p: Property): PropertyRow {
  return {
    id: p.id,
    ref: p.ref,
    slug: p.slug,
    title: p.title,
    category: p.category,
    segment: p.segment,
    type: p.type,
    community_slug: p.communitySlug,
    building: p.building,
    price: p.price,
    bedrooms: p.bedrooms,
    bathrooms: p.bathrooms,
    area_sqft: p.areaSqft,
    plot_sqft: p.plotSqft,
    furnishing: p.furnishing,
    summary: p.summary,
    description: p.description,
    amenities: p.amenities,
    images: p.images,
    floor_plan: p.floorPlan,
    lat: p.location.lat,
    lng: p.location.lng,
    location_precision: p.location.precision,
    agent_id: p.agentId,
    featured: p.featured,
    published: p.published,
    status: p.status,
    verification: p.verification,
    off_plan: p.offPlan,
    rental_yield: p.rentalYield,
    is_demo: p.isDemo,
    created_at: p.createdAt,
    updated_at: p.updatedAt,
  };
}

type LeadRow = {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  email: string;
  phone: string;
  intent: Lead["intent"];
  budget_band: string | null;
  preferred_community: string | null;
  contact_method: Lead["contactMethod"];
  message: string | null;
  source: Lead["source"];
  property_id: string | null;
  viewing: Lead["viewing"];
  sell_details: Lead["sellDetails"];
  status: Lead["status"];
  agent_id: string | null;
  follow_up_at: string | null;
  utm: Lead["utm"];
  consent: Lead["consent"];
  is_demo: boolean;
  lead_notes?: { id: string; author_id: string; author_name: string; channel: LeadNote["channel"]; body: string; created_at: string }[];
  lead_activity?: { id: string; type: LeadActivity["type"]; actor_name: string | null; description: string; at: string }[];
};

function leadFromRow(r: LeadRow): Lead {
  return {
    id: r.id,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    name: r.name,
    email: r.email,
    phone: r.phone,
    intent: r.intent,
    budgetBand: r.budget_band,
    preferredCommunity: r.preferred_community,
    contactMethod: r.contact_method,
    message: r.message,
    source: r.source,
    propertyId: r.property_id,
    viewing: r.viewing,
    sellDetails: r.sell_details,
    status: r.status,
    agentId: r.agent_id,
    followUpAt: r.follow_up_at,
    utm: r.utm,
    consent: r.consent,
    isDemo: r.is_demo,
    notes: (r.lead_notes ?? [])
      .map((n) => ({ id: n.id, authorId: n.author_id, authorName: n.author_name, channel: n.channel, body: n.body, createdAt: n.created_at }))
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
    activity: (r.lead_activity ?? [])
      .map((a) => ({ id: a.id, type: a.type, actorName: a.actor_name, description: a.description, at: a.at }))
      .sort((a, b) => a.at.localeCompare(b.at)),
  };
}

/** PostgREST `or` filters use commas and parentheses as syntax — strip them from user input. */
const safeTerm = (q: string) =>
  q
    .replace(/[,()%*\\:"']/g, " ")
    .trim()
    .slice(0, 80);

function check<T>(res: { data: T; error: { message: string } | null }): T {
  if (res.error) throw new Error(`Supabase: ${res.error.message}`);
  return res.data;
}

async function logActivity(leadId: string, type: LeadActivity["type"], description: string, actorName: string | null) {
  check(await db().from("lead_activity").insert({ lead_id: leadId, type, description, actor_name: actorName }));
}

export function createSupabaseStore(): DataStore {
  const LEAD_SELECT = "*, lead_notes(*), lead_activity(*)";

  const properties: DataStore["properties"] = {
    async search(query) {
      let req = db().from("properties").select("*", { count: "exact" }).eq("published", true);
      if (query.category) req = req.eq("category", query.category);
      if (query.segment) req = req.eq("segment", query.segment);
      if (query.community) req = req.eq("community_slug", query.community);
      if (query.type) req = req.eq("type", query.type);
      if (query.minPrice !== undefined) req = req.gte("price", query.minPrice);
      if (query.maxPrice !== undefined) req = req.lte("price", query.maxPrice);
      if (query.beds !== undefined) req = query.beds === 5 ? req.gte("bedrooms", 5) : req.eq("bedrooms", query.beds);
      if (query.baths !== undefined) req = req.gte("bathrooms", query.baths);
      if (query.minArea !== undefined) req = req.gte("area_sqft", query.minArea);
      if (query.maxArea !== undefined) req = req.lte("area_sqft", query.maxArea);
      if (query.q) {
        for (const term of safeTerm(query.q).split(/\s+/).filter(Boolean)) {
          req = req.or(`title.ilike.%${term}%,summary.ilike.%${term}%,ref.ilike.%${term}%,community_slug.ilike.%${term}%`);
        }
      }
      const order =
        query.sort === "price-asc"
          ? { col: "price", asc: true }
          : query.sort === "price-desc"
            ? { col: "price", asc: false }
            : query.sort === "area-desc"
              ? { col: "area_sqft", asc: false }
              : { col: "created_at", asc: false };
      const from = (query.page - 1) * PAGE_SIZE;
      const res = await req.order(order.col, { ascending: order.asc }).range(from, from + PAGE_SIZE - 1);
      const rows = check(res) as PropertyRow[];
      const total = res.count ?? rows.length;
      return { items: rows.map(propertyFromRow), total, page: query.page, pageCount: Math.max(1, Math.ceil(total / PAGE_SIZE)), pageSize: PAGE_SIZE };
    },
    async getBySlug(slug, opts) {
      let req = db().from("properties").select("*").eq("slug", slug);
      if (!opts?.includeUnpublished) req = req.eq("published", true);
      const row = check(await req.maybeSingle()) as PropertyRow | null;
      return row ? propertyFromRow(row) : null;
    },
    async getById(id) {
      const row = check(await db().from("properties").select("*").eq("id", id).maybeSingle()) as PropertyRow | null;
      return row ? propertyFromRow(row) : null;
    },
    async getByIds(ids) {
      if (!ids.length) return [];
      const rows = check(await db().from("properties").select("*").in("id", ids).eq("published", true)) as PropertyRow[];
      return rows.map(propertyFromRow);
    },
    async listFeatured(limit) {
      const rows = check(
        await db()
          .from("properties")
          .select("*")
          .eq("published", true)
          .eq("featured", true)
          .eq("status", "available")
          .order("created_at", { ascending: false })
          .limit(limit),
      ) as PropertyRow[];
      return rows.map(propertyFromRow);
    },
    async listSimilar(property, limit) {
      const rows = check(
        await db()
          .from("properties")
          .select("*")
          .eq("published", true)
          .eq("category", property.category)
          .eq("segment", property.segment)
          .neq("id", property.id)
          .gte("price", Math.round(property.price * 0.5))
          .lte("price", Math.round(property.price * 1.6))
          .limit(24),
      ) as PropertyRow[];
      const score = (p: Property) => (p.communitySlug === property.communitySlug ? 3 : 0) + (p.type === property.type ? 2 : 0);
      return rows
        .map(propertyFromRow)
        .sort((a, b) => score(b) - score(a))
        .slice(0, limit);
    },
    async listPublished() {
      const rows = check(await db().from("properties").select("*").eq("published", true).limit(5000)) as PropertyRow[];
      return rows.map(propertyFromRow);
    },
    async listForAdmin(filter) {
      let req = db().from("properties").select("*");
      if (filter.status) req = req.eq("status", filter.status);
      if (filter.published !== undefined) req = req.eq("published", filter.published);
      if (filter.agentId) req = req.eq("agent_id", filter.agentId);
      if (filter.q) {
        const t = safeTerm(filter.q);
        if (t) req = req.or(`title.ilike.%${t}%,ref.ilike.%${t}%`);
      }
      const rows = check(await req.order("updated_at", { ascending: false }).limit(500)) as PropertyRow[];
      return rows.map(propertyFromRow);
    },
    async create(input, actor) {
      const refs = check(await db().from("properties").select("ref").eq("is_demo", false)) as { ref: string }[];
      const now = new Date().toISOString();
      const base: Property = {
        id: randomUUID(),
        ref: nextRef(refs.map((r) => r.ref)),
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
      check(await db().from("properties").insert(propertyToRow(created)));
      return created;
    },
    async update(id, input, actor) {
      const existing = await properties.getById(id);
      if (!existing) throw new NotFoundError("Property");
      const isAdmin = actor.role === "admin";
      const updated = applyPropertyInput(existing, input, {
        canPublish: isAdmin,
        canVerify: isAdmin,
        canAssign: isAdmin,
        actorName: actor.name,
        now: new Date().toISOString(),
      });
      check(await db().from("properties").update(propertyToRow(updated)).eq("id", id));
      return updated;
    },
    async setPublished(id, published) {
      const row = check(
        await db().from("properties").update({ published, updated_at: new Date().toISOString() }).eq("id", id).select("*").maybeSingle(),
      ) as PropertyRow | null;
      if (!row) throw new NotFoundError("Property");
      return propertyFromRow(row);
    },
    async addImages(id, images) {
      const existing = await properties.getById(id);
      if (!existing) throw new NotFoundError("Property");
      const next = [...existing.images, ...images].slice(0, 30);
      check(await db().from("properties").update({ images: next, updated_at: new Date().toISOString() }).eq("id", id));
      return { ...existing, images: next };
    },
    async removeImage(id, src) {
      const existing = await properties.getById(id);
      if (!existing) throw new NotFoundError("Property");
      const next = existing.images.filter((i) => i.src !== src);
      check(await db().from("properties").update({ images: next, updated_at: new Date().toISOString() }).eq("id", id));
      return { ...existing, images: next };
    },
    async reorderImage(id, src, direction) {
      const existing = await properties.getById(id);
      if (!existing) throw new NotFoundError("Property");
      const imgs = [...existing.images];
      const i = imgs.findIndex((x) => x.src === src);
      const j = direction === "up" ? i - 1 : i + 1;
      if (i < 0 || j < 0 || j >= imgs.length) return existing;
      [imgs[i], imgs[j]] = [imgs[j]!, imgs[i]!];
      check(await db().from("properties").update({ images: imgs, updated_at: new Date().toISOString() }).eq("id", id));
      return { ...existing, images: imgs };
    },
  };

  const leads: DataStore["leads"] = {
    async create(input) {
      const row = check(
        await db()
          .from("leads")
          .insert({
            name: input.name,
            email: input.email,
            phone: input.phone,
            intent: input.intent,
            budget_band: input.budgetBand,
            preferred_community: input.preferredCommunity,
            contact_method: input.contactMethod,
            message: input.message,
            source: input.source,
            property_id: input.propertyId,
            viewing: input.viewing,
            sell_details: input.sellDetails,
            agent_id: input.agentId ?? null,
            utm: input.utm,
            consent: input.consent,
            is_demo: false,
          })
          .select("id")
          .single(),
      ) as { id: string };
      await logActivity(row.id, "created", `Lead created from the ${input.source.replace(/_/g, " ")}`, null);
      const lead = await leads.getById(row.id);
      if (!lead) throw new Error("Lead was not saved");
      return lead;
    },
    async list(filter) {
      let req = db().from("leads").select(LEAD_SELECT);
      if (filter.visibleToAgentId) req = req.or(`agent_id.eq.${safeTerm(filter.visibleToAgentId)},agent_id.is.null`);
      if (filter.status) req = req.eq("status", filter.status);
      if (filter.source) req = req.eq("source", filter.source);
      if (filter.intent) req = req.eq("intent", filter.intent);
      if (filter.agentId) req = filter.agentId === "unassigned" ? req.is("agent_id", null) : req.eq("agent_id", filter.agentId);
      if (filter.q) {
        const t = safeTerm(filter.q);
        if (t) req = req.or(`name.ilike.%${t}%,email.ilike.%${t}%,phone.ilike.%${t}%`);
      }
      const rows = check(await req.order("created_at", { ascending: false }).limit(1000)) as LeadRow[];
      return rows.map(leadFromRow);
    },
    async getById(id) {
      const row = check(await db().from("leads").select(LEAD_SELECT).eq("id", id).maybeSingle()) as LeadRow | null;
      return row ? leadFromRow(row) : null;
    },
    async update(id, patch, actor) {
      const lead = await leads.getById(id);
      if (!lead) throw new NotFoundError("Lead");
      const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
      if (patch.status && patch.status !== lead.status) {
        update.status = patch.status;
        await logActivity(id, "status_changed", `Status changed from ${leadStatusLabels[lead.status]} to ${leadStatusLabels[patch.status]}`, actor.name);
      }
      if (patch.agentId !== undefined && patch.agentId !== lead.agentId) {
        const agent = patch.agentId ? await agents.getById(patch.agentId) : null;
        update.agent_id = agent?.id ?? null;
        await logActivity(id, "assigned", agent ? `Assigned to ${agent.name}` : "Unassigned", actor.name);
      }
      if (patch.followUpAt !== undefined && patch.followUpAt !== lead.followUpAt) {
        update.follow_up_at = patch.followUpAt;
        await logActivity(id, "follow_up_set", patch.followUpAt ? "Follow-up date updated" : "Follow-up cleared", actor.name);
      }
      check(await db().from("leads").update(update).eq("id", id));
      return (await leads.getById(id))!;
    },
    async addNote(id, note, actor) {
      check(await db().from("lead_notes").insert({ lead_id: id, author_id: actor.id, author_name: actor.name, channel: note.channel, body: note.body }));
      await logActivity(id, "note_added", `Added a ${note.channel === "note" ? "note" : `${note.channel} log`}`, actor.name);
      check(await db().from("leads").update({ updated_at: new Date().toISOString() }).eq("id", id));
      const lead = await leads.getById(id);
      if (!lead) throw new NotFoundError("Lead");
      return lead;
    },
    async appendActivity(id, entry) {
      await logActivity(id, entry.type, entry.description, entry.actorName);
    },
  };

  const agents: DataStore["agents"] = {
    async list() {
      const rows = check(await db().from("agents").select("*").order("name")) as {
        id: string;
        name: string;
        title: string;
        email: string;
        phone: string;
        languages: string[];
        focus: string;
        active: boolean;
        is_demo: boolean;
      }[];
      return rows.map((r): Agent => ({
        id: r.id,
        name: r.name,
        title: r.title,
        email: r.email,
        phone: r.phone,
        languages: r.languages ?? [],
        focus: r.focus,
        active: r.active,
        isDemo: r.is_demo,
      }));
    },
    async getById(id) {
      return (await agents.list()).find((a) => a.id === id) ?? null;
    },
  };

  return {
    backend: "supabase",
    properties,
    leads,
    agents,
    media: {
      async save(file) {
        const name = `listings/${randomUUID()}.${file.extension}`;
        check(await db().storage.from(env.supabase.bucket).upload(name, file.bytes, { contentType: file.contentType, upsert: false }));
        const { data } = db().storage.from(env.supabase.bucket).getPublicUrl(name);
        return { src: data.publicUrl };
      },
    },
  };
}

/** Used by Supabase-backed sign-in to resolve a staff profile. */
export async function getSupabaseStaffProfile(userId: string): Promise<StaffUser | null> {
  const row = check(await db().from("profiles").select("id, email, full_name, role, agent_id").eq("id", userId).maybeSingle()) as {
    id: string;
    email: string;
    full_name: string;
    role: "admin" | "agent";
    agent_id: string | null;
  } | null;
  if (!row) return null;
  return { id: row.id, email: row.email, name: row.full_name, role: row.role, agentId: row.agent_id };
}
