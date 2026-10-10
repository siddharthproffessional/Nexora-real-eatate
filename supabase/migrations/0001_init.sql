-- ─────────────────────────────────────────────────────────────────────────────
-- NEXORA Realty — initial schema
-- Target: Supabase (Postgres 15+). Run with `supabase db push` or paste into the SQL editor.
--
-- Security model
--   • The Next.js server talks to the database with the service-role key and enforces roles in the app.
--   • Row-level security (below) is a second line of defence for any direct client access with the
--     anon/authenticated keys: the public can read published listings only; staff access depends on role.
--   • Public lead submissions are inserted only by the server (validated, rate limited), never by anon.
-- ─────────────────────────────────────────────────────────────────────────────

-- gen_random_uuid() is built into Postgres 13+, so no extension is required.

-- ── Agents ───────────────────────────────────────────────────────────────────
create table public.agents (
  id          text primary key default gen_random_uuid()::text,
  name        text not null,
  title       text not null default '',
  email       text not null,
  phone       text not null default '',
  languages   text[] not null default '{}',
  focus       text not null default '',
  active      boolean not null default true,
  is_demo     boolean not null default false,
  created_at  timestamptz not null default now()
);

-- ── Staff profiles (one per Supabase Auth user) ──────────────────────────────
create table public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  email       text not null,
  full_name   text not null,
  role        text not null check (role in ('admin', 'agent')),
  agent_id    text references public.agents (id) on delete set null,
  created_at  timestamptz not null default now()
);

-- ── Properties ───────────────────────────────────────────────────────────────
create table public.properties (
  id                  text primary key default gen_random_uuid()::text,
  ref                 text not null unique,
  slug                text not null unique,
  title               text not null check (char_length(title) between 6 and 140),
  category            text not null check (category in ('sale', 'rent', 'off-plan')),
  segment             text not null check (segment in ('residential', 'commercial')),
  type                text not null check (type in ('apartment', 'penthouse', 'villa', 'townhouse', 'office', 'retail')),
  community_slug      text not null,
  building            text,
  price               bigint not null check (price > 0),           -- AED; annual for rentals; starting price for off-plan
  bedrooms            smallint not null default 0 check (bedrooms between 0 and 20),
  bathrooms           smallint not null default 0 check (bathrooms between 0 and 20),
  area_sqft           integer not null check (area_sqft > 0),
  plot_sqft           integer,
  furnishing          text check (furnishing in ('furnished', 'unfurnished', 'partly_furnished')),
  summary             text not null,
  description         text[] not null default '{}',
  amenities           text[] not null default '{}',
  images              jsonb not null default '[]'::jsonb,           -- [{src, alt, credit, kind}]
  floor_plan          jsonb,
  lat                 double precision not null,
  lng                 double precision not null,
  location_precision  text not null default 'community' check (location_precision in ('community', 'exact')),
  agent_id            text references public.agents (id) on delete set null,
  featured            boolean not null default false,
  published           boolean not null default false,
  status              text not null default 'available' check (status in ('available', 'under_offer', 'sold', 'rented', 'off_market')),
  verification        jsonb,                                        -- {permitNumber, verifiedAt, verifiedBy}; set only by admins
  off_plan            jsonb,                                        -- {projectName, developer, handover:{label,verified}, paymentPlan}
  rental_yield        jsonb,                                        -- {grossPercent, source, asOf}; only with a citable source
  is_demo             boolean not null default false,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index properties_search_idx on public.properties (published, category, segment, community_slug);
create index properties_price_idx on public.properties (price);
create index properties_created_idx on public.properties (created_at desc);
create index properties_agent_idx on public.properties (agent_id);

-- ── Leads ────────────────────────────────────────────────────────────────────
create table public.leads (
  id                   text primary key default gen_random_uuid()::text,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),
  name                 text not null,
  email                text not null,
  phone                text not null,                               -- E.164
  intent               text not null check (intent in ('buy', 'rent', 'sell', 'lease', 'invest')),
  budget_band          text,
  preferred_community  text,
  contact_method       text not null check (contact_method in ('phone', 'whatsapp', 'email')),
  message              text,
  source               text not null check (source in ('website_consultation', 'property_inquiry', 'viewing_request', 'sell_lease_form', 'contact_form', 'whatsapp', 'phone', 'referral', 'property_portal', 'social_media', 'walk_in')),
  property_id          text references public.properties (id) on delete set null,
  viewing              jsonb,                                       -- {date, timeSlot}
  sell_details         jsonb,
  status               text not null default 'new' check (status in ('new', 'contacted', 'qualified', 'viewing_scheduled', 'negotiation', 'closed_won', 'closed_lost')),
  agent_id             text references public.agents (id) on delete set null,
  follow_up_at         timestamptz,
  utm                  jsonb,
  consent              jsonb not null,                              -- {privacy, marketing, at}
  is_demo              boolean not null default false
);

create index leads_status_idx on public.leads (status, created_at desc);
create index leads_agent_idx on public.leads (agent_id, created_at desc);
create index leads_follow_up_idx on public.leads (follow_up_at) where follow_up_at is not null;

create table public.lead_notes (
  id           uuid primary key default gen_random_uuid(),
  lead_id      text not null references public.leads (id) on delete cascade,
  author_id    text not null,
  author_name  text not null,
  channel      text not null default 'note' check (channel in ('note', 'call', 'whatsapp', 'email', 'meeting')),
  body         text not null check (char_length(body) between 2 and 4000),
  created_at   timestamptz not null default now()
);
create index lead_notes_lead_idx on public.lead_notes (lead_id, created_at);

create table public.lead_activity (
  id           uuid primary key default gen_random_uuid(),
  lead_id      text not null references public.leads (id) on delete cascade,
  type         text not null check (type in ('created', 'status_changed', 'assigned', 'note_added', 'follow_up_set', 'notification', 'updated')),
  actor_name   text,
  description  text not null,
  at           timestamptz not null default now()
);
create index lead_activity_lead_idx on public.lead_activity (lead_id, at);

-- ── updated_at maintenance ───────────────────────────────────────────────────
create or replace function public.touch_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

create trigger properties_touch before update on public.properties for each row execute function public.touch_updated_at();
create trigger leads_touch before update on public.leads for each row execute function public.touch_updated_at();

-- ── Role helpers (security definer so policies can read profiles) ────────────
create or replace function public.current_staff_role() returns text
language sql stable security definer set search_path = public as $$
  select role from public.profiles where id = auth.uid()
$$;

create or replace function public.current_agent_id() returns text
language sql stable security definer set search_path = public as $$
  select agent_id from public.profiles where id = auth.uid()
$$;

-- Agents may edit their own listings but not publishing, featuring, permits or assignment.
create or replace function public.guard_property_admin_fields() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is not null and coalesce(public.current_staff_role(), '') <> 'admin' then
    if new.published is distinct from old.published
       or new.featured is distinct from old.featured
       or new.verification is distinct from old.verification
       or new.agent_id is distinct from old.agent_id then
      raise exception 'Only administrators can change publishing, featuring, verification or assignment';
    end if;
  end if;
  return new;
end $$;

create trigger properties_guard before update on public.properties for each row execute function public.guard_property_admin_fields();

-- ── Row-level security ───────────────────────────────────────────────────────
alter table public.agents        enable row level security;
alter table public.profiles      enable row level security;
alter table public.properties    enable row level security;
alter table public.leads         enable row level security;
alter table public.lead_notes    enable row level security;
alter table public.lead_activity enable row level security;

-- Agents
create policy "Staff can read agents" on public.agents for select to authenticated using (public.current_staff_role() is not null);
create policy "Admins manage agents" on public.agents for all to authenticated
  using (public.current_staff_role() = 'admin') with check (public.current_staff_role() = 'admin');

-- Profiles
create policy "Users read own profile" on public.profiles for select to authenticated using (id = auth.uid() or public.current_staff_role() = 'admin');
create policy "Admins manage profiles" on public.profiles for all to authenticated
  using (public.current_staff_role() = 'admin') with check (public.current_staff_role() = 'admin');

-- Properties
create policy "Anyone can read published listings" on public.properties for select to anon, authenticated using (published = true);
create policy "Staff read all listings" on public.properties for select to authenticated using (public.current_staff_role() is not null);
create policy "Admins create listings" on public.properties for insert to authenticated with check (public.current_staff_role() = 'admin');
create policy "Agents create own draft listings" on public.properties for insert to authenticated
  with check (public.current_staff_role() = 'agent' and agent_id = public.current_agent_id() and published = false and verification is null);
create policy "Admins update listings" on public.properties for update to authenticated using (public.current_staff_role() = 'admin');
create policy "Agents update own listings" on public.properties for update to authenticated
  using (public.current_staff_role() = 'agent' and agent_id = public.current_agent_id())
  with check (agent_id = public.current_agent_id());
create policy "Admins delete listings" on public.properties for delete to authenticated using (public.current_staff_role() = 'admin');

-- Leads (no anon access: public submissions are inserted by the server)
create policy "Admins read all leads" on public.leads for select to authenticated using (public.current_staff_role() = 'admin');
create policy "Agents read own and unassigned leads" on public.leads for select to authenticated
  using (public.current_staff_role() = 'agent' and (agent_id = public.current_agent_id() or agent_id is null));
create policy "Admins update leads" on public.leads for update to authenticated using (public.current_staff_role() = 'admin');
create policy "Agents update own leads or claim unassigned" on public.leads for update to authenticated
  using (public.current_staff_role() = 'agent' and (agent_id = public.current_agent_id() or agent_id is null))
  with check (agent_id = public.current_agent_id());

-- Notes and activity follow the visibility of their lead
create policy "Read notes on visible leads" on public.lead_notes for select to authenticated
  using (exists (select 1 from public.leads l where l.id = lead_id));
create policy "Add notes to own leads" on public.lead_notes for insert to authenticated
  with check (
    author_id = auth.uid()::text
    and exists (select 1 from public.leads l where l.id = lead_id and (public.current_staff_role() = 'admin' or l.agent_id = public.current_agent_id()))
  );
create policy "Read activity on visible leads" on public.lead_activity for select to authenticated
  using (exists (select 1 from public.leads l where l.id = lead_id));
create policy "Staff add activity" on public.lead_activity for insert to authenticated
  with check (exists (select 1 from public.leads l where l.id = lead_id));

-- ── Storage for listing photos ───────────────────────────────────────────────
insert into storage.buckets (id, name, public)
values ('property-media', 'property-media', true)
on conflict (id) do nothing;

create policy "Public read listing photos" on storage.objects for select using (bucket_id = 'property-media');
create policy "Staff upload listing photos" on storage.objects for insert to authenticated
  with check (bucket_id = 'property-media' and public.current_staff_role() is not null);
create policy "Admins delete listing photos" on storage.objects for delete to authenticated
  using (bucket_id = 'property-media' and public.current_staff_role() = 'admin');
