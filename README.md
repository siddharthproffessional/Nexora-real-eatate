# NEXORA Realty — website and property platform

A production-grade foundation for a Dubai real estate company expanding from India: a premium public website, a lead
capture pipeline, a protected internal CRM, and listing administration — built so the company can grow it into its own
real estate software product.

> **Demonstration build.** Listings, prices, project names, advisor profiles and CRM leads are illustrative and clearly
> labelled as such on every screen. Contact details and licence numbers are placeholders. Nothing is presented as live
> inventory or verified data. Set `NEXT_PUBLIC_DEMO_MODE=false` only when real content replaces it.

---

## Contents

1. [Quick start](#quick-start)
2. [What is implemented, and what still needs credentials](#what-is-implemented-and-what-still-needs-credentials)
3. [Pages](#pages)
4. [Project structure](#project-structure)
5. [Environment variables](#environment-variables)
6. [Data: demo store and Supabase](#data-demo-store-and-supabase)
7. [Staff accounts and roles](#staff-accounts-and-roles)
8. [Lead capture workflow](#lead-capture-workflow)
9. [Connecting real services](#connecting-real-services)
10. [Rebranding](#rebranding)
11. [Content, compliance and honesty rules](#content-compliance-and-honesty-rules)
12. [SEO, performance and accessibility](#seo-performance-and-accessibility)
13. [Security](#security)
14. [Quality checks](#quality-checks)
15. [Deployment](#deployment)
16. [Known limitations](#known-limitations)

---

## Quick start

Requirements: **Node.js 20.9 or later** and npm.

```bash
npm install
cp .env.example .env.local     # optional for local development — sensible defaults apply
npm run dev                    # http://localhost:3000
```

With no configuration the app runs on the **demo store**: a local JSON file in `.data/` seeded with demonstration
listings, five fictional advisors and ~70 illustrative leads dated relative to today, so the CRM looks current.

**Staff sign-in (development only):** open <http://localhost:3000/login>.

| Role                | Email                  | Password (dev default) |
| ------------------- | ---------------------- | ---------------------- |
| Administrator       | `admin@nexora.example` | `NexoraAdmin!2026`     |
| Agent (Rohan Mehta) | `agent@nexora.example` | `NexoraAgent!2026`     |

These defaults exist **only when `NODE_ENV` is not `production`**. In production the demo accounts are disabled unless
`DEMO_ADMIN_PASSWORD` / `DEMO_AGENT_PASSWORD` are set (plain text or a bcrypt hash from `npm run hash-password`), and
the login page never displays credentials.

Useful scripts:

| Command                              | What it does                                         |
| ------------------------------------ | ---------------------------------------------------- |
| `npm run dev`                        | Development server                                   |
| `npm run build && npm start`         | Production build and server                          |
| `npm run typecheck` / `npm run lint` | TypeScript and ESLint                                |
| `npm run check`                      | Typecheck, lint and Prettier check                   |
| `npm run demo:reset`                 | Delete the local demo store (re-seeds on next start) |
| `npm run db:seed-sql`                | Regenerate `supabase/seed.sql` from the demo content |
| `npm run hash-password -- "…"`       | Create a bcrypt hash for a demo account password     |

---

## What is implemented, and what still needs credentials

The **Integrations** page in the platform (`/crm/integrations`, administrators only) shows the live status of each item
below, read from the server environment.

| Area                                                                                                                                       | Status                                    | Notes                                                                                                                                          |
| ------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Public website (14 required pages + saved properties)                                                                                      | **Working**                               | Responsive, accessible, SEO metadata                                                                                                           |
| Property search: keyword, community, category, price, beds, baths, type, area, sort, grid/list, pagination, empty state, mobile filters    | **Working**                               | State lives in the URL, so searches are shareable                                                                                              |
| Phrase search ("2 bed marina under 3m")                                                                                                    | **Working (rules-based)**                 | Transparent: interpreted filters are shown to the visitor                                                                                      |
| Property detail: gallery + viewer, specs, description, amenities, map, similar listings, share, save, viewing form                         | **Working**                               | Floor plan section appears only when a plan is uploaded                                                                                        |
| Saved properties                                                                                                                           | **Working**                               | Stored in the visitor's browser; no account                                                                                                    |
| Lead capture (consultation, contact, viewing, property question, sell/lease valuation)                                                     | **Working**                               | Validated in browser and server, rate limited, honeypot, consent recorded                                                                      |
| Internal CRM: KPIs, pipeline, sources, weekly trend, agent performance, activity, follow-ups                                               | **Working**                               | Charts include hover tooltips and table views                                                                                                  |
| Lead management: status, assignment, claim, follow-up dates, notes and contact log, activity history                                       | **Working**                               |                                                                                                                                                |
| Lead scoring                                                                                                                               | **Working (rules-based)**                 | Every point is explained; weights in `src/config/lead-scoring.ts`                                                                              |
| Listing administration: create, edit, pricing, status, agent assignment, publish/unpublish, photo upload/order/remove, permit verification | **Working**                               | New listings start as drafts; publishing needs a photo                                                                                         |
| Role-based access (admin, agent)                                                                                                           | **Working**                               | Proxy + page + API checks; RLS policies for Supabase                                                                                           |
| Database: Supabase Postgres                                                                                                                | **Schema ready — needs credentials**      | Migration, RLS and seed tested on Postgres (see [Supabase](#supabase)); the TypeScript adapter has not yet run against a live Supabase project |
| Staff accounts via Supabase Auth                                                                                                           | **Ready — needs credentials**             |                                                                                                                                                |
| Photo storage via Supabase Storage                                                                                                         | **Ready — needs credentials**             | Demo mode stores uploads locally                                                                                                               |
| Email alerts for new leads (Resend)                                                                                                        | **Needs credentials**                     | Without them, nothing is sent and the lead's activity log says so                                                                              |
| WhatsApp click-to-chat                                                                                                                     | **Needs a number**                        | Buttons show "not yet configured" until set                                                                                                    |
| WhatsApp alerts to staff (Cloud API)                                                                                                       | **Needs credentials + approved template** |                                                                                                                                                |
| External CRM sync (signed webhook)                                                                                                         | **Needs a URL**                           | HMAC-SHA256 signed JSON                                                                                                                        |
| Maps                                                                                                                                       | **Working on fallback**                   | OpenStreetMap embed; Google Maps Embed with a key                                                                                              |
| Analytics (GA4 or Plausible)                                                                                                               | **Needs an ID**                           | UTM campaign tags are captured into the CRM regardless                                                                                         |
| AI features (recommendations, natural-language search, lead qualification, inquiry categorisation, description drafting, market reports)   | **Integration points only**               | Contracts and routes exist; no provider adapter, so they are switched off and return `501`                                                     |
| Property inventory feed (portals/developers)                                                                                               | **Integration point only**                | Adapter interface in `src/lib/integrations/inventory-feed.ts`                                                                                  |

Nothing reports success it did not achieve: a lead form only says a request was saved after the server stored it,
and in demo mode the confirmation lists each notification channel as _sent_, _failed_ or _not configured_.

---

## Pages

| Page                                            | Route                                                                                                |
| ----------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Homepage                                        | `/`                                                                                                  |
| All properties                                  | `/properties`                                                                                        |
| Buy / Rent / Off-plan / Commercial              | `/buy`, `/rent`, `/off-plan`, `/commercial`                                                          |
| Property details                                | `/properties/[slug]` (slug ends with the permanent listing reference; renamed listings 308-redirect) |
| Communities and community details               | `/communities`, `/communities/[slug]`                                                                |
| Sell or lease                                   | `/sell-or-lease`                                                                                     |
| About, Contact                                  | `/about`, `/contact`                                                                                 |
| Market insights                                 | `/insights`, `/insights/[slug]`                                                                      |
| Saved properties                                | `/saved`                                                                                             |
| Privacy policy, Terms (placeholders)            | `/privacy`, `/terms`                                                                                 |
| Staff sign-in                                   | `/login`                                                                                             |
| CRM dashboard, leads, lead detail, integrations | `/crm`, `/crm/leads`, `/crm/leads/[id]`, `/crm/integrations`                                         |
| Property administration                         | `/admin/properties`, `/admin/properties/new`, `/admin/properties/[id]`                               |

---

## Project structure

```
src/
  app/
    (site)/            public website (shared header, footer, demo ribbon)
    (staff)/           CRM and administration (requires a session)
    login/             staff sign-in
    api/
      leads/           public lead capture (POST)
      properties/      public listing cards by id (saved properties)
      auth/            login / logout
      internal/        staff APIs: leads, notes, properties, photos
      ai/[feature]/    AI integration endpoint (501 until a provider exists)
      media/[name]/    serves photos uploaded on the demo store
    sitemap.ts, robots.ts, opengraph-image.tsx
  proxy.ts             network-boundary guard for /crm, /admin, /api/internal (Next.js 16 "proxy")
  components/
    ui/                shadcn-style primitives (button, form controls, badge, sheet/dialog)
    site/ home/ search/ property/ leads/   public site
    staff/             CRM and admin UI, charts
    brand/  seo/
  config/
    site.ts            brand name, contact details, navigation, regulatory fields
    media.ts           photography (swap for licensed company photos)
    lead-scoring.ts    scoring weights
  lib/
    domain/            types, labels, dial codes
    data/              repository interfaces + demo store + Supabase adapter
    auth/              sessions, accounts, permissions, guards
    validation/        zod schemas shared by browser and server
    search/            query parsing, filtering, phrase interpretation
    notifications/     email, WhatsApp, CRM webhook
    crm/ scoring/ ai/ integrations/ security/ content/ demo/
supabase/
  migrations/0001_init.sql   schema, indexes, triggers, RLS, storage bucket
  seed.sql                   demonstration data (is_demo = true)
scripts/                     seed generator, password hashing, demo reset
tests/e2e/smoke_test.py      end-to-end checks (Playwright for Python)
docs/                        architecture notes and QA report
```

**Stack:** Next.js 16 (App Router, TypeScript), React 19, Tailwind CSS 4, Radix primitives in a shadcn-style component
layer, zod, jose (sessions), Recharts, Supabase (Postgres, Auth, Storage). Fonts are self-hosted from npm
(Bodoni Moda for editorial headings, Hanken Grotesk for interface text) — no third-party font requests.

---

## Environment variables

All variables are documented in [`.env.example`](.env.example). Anything prefixed `NEXT_PUBLIC_` reaches the browser —
never put secrets there.

| Variable                                                                                                                                                           | Required                     | Purpose                                                                          |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------- | -------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`                                                                                                                                             | Production                   | Canonical URLs, sitemap, social cards                                            |
| `NEXT_PUBLIC_DEMO_MODE`                                                                                                                                            | —                            | `true` (default) shows demo labels and blocks indexing; `false` for real content |
| `AUTH_SECRET`                                                                                                                                                      | **Production**               | 32+ random characters for signing sessions (`openssl rand -base64 32`)           |
| `DEMO_ADMIN_PASSWORD`, `DEMO_AGENT_PASSWORD`                                                                                                                       | Production on the demo store | Enable the demo staff accounts                                                   |
| `DATA_BACKEND`                                                                                                                                                     | —                            | `demo` (default) or `supabase`                                                   |
| `DEMO_DATA_DIR`                                                                                                                                                    | —                            | Location of the demo store (default `./.data`, `/tmp` on Vercel)                 |
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_STORAGE_BUCKET`                                                | Supabase                     | Database, auth and storage                                                       |
| `RESEND_API_KEY`, `EMAIL_FROM`, `LEAD_NOTIFICATION_EMAIL`                                                                                                          | Email alerts                 |                                                                                  |
| `NEXT_PUBLIC_WHATSAPP_NUMBER`                                                                                                                                      | Click-to-chat                | Digits with country code                                                         |
| `WHATSAPP_CLOUD_API_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_NOTIFY_TO`, `WHATSAPP_TEMPLATE_NAME`, `WHATSAPP_TEMPLATE_LANGUAGE`, `WHATSAPP_GRAPH_API_VERSION` | WhatsApp alerts              | Check the current Graph API version when you set this up                         |
| `CRM_WEBHOOK_URL`, `CRM_WEBHOOK_SECRET`                                                                                                                            | External CRM                 |                                                                                  |
| `NEXT_PUBLIC_GOOGLE_MAPS_EMBED_KEY`                                                                                                                                | —                            | Otherwise OpenStreetMap                                                          |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` or `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`                                                                                                  | —                            | Web analytics                                                                    |
| `AI_PROVIDER`, `AI_API_KEY`, `AI_MODEL`                                                                                                                            | —                            | Reserved for the AI adapter (not implemented)                                    |
| `INVENTORY_FEED_URL`, `INVENTORY_FEED_TOKEN`                                                                                                                       | —                            | Reserved for a feed adapter (not implemented)                                    |

---

## Data: demo store and Supabase

All UI and API code talks to repository interfaces (`src/lib/data/types.ts`). `getStore()` returns the backend chosen
by `DATA_BACKEND`.

### Demo store

- A JSON file (`.data/demo-store.json`) plus an `uploads/` folder. Created automatically on first request.
- Real submissions made through the website are stored next to the seeded demo leads (`isDemo: false`), so the whole
  pipeline — form → CRM → assignment → notes — can be demonstrated live.
- Suitable for local demos and a single server instance. On serverless hosts it lives in `/tmp` and is **not durable**.
  Use Supabase for anything real.
- `npm run demo:reset` wipes it.

### Supabase

1. Create a Supabase project (choose a region close to the UAE).
2. Run the schema: paste `supabase/migrations/0001_init.sql` into the SQL editor, or `supabase db push` with the CLI.
   This creates the tables, indexes, triggers, row-level-security policies and the public `property-media` bucket.
3. Optional demo data: run `supabase/seed.sql` (every row has `is_demo = true`; remove later with
   `delete from leads where is_demo; delete from properties where is_demo; delete from agents where is_demo;`).
4. Create staff users in **Authentication → Users**, then give each a role:
   ```sql
   insert into public.profiles (id, email, full_name, role, agent_id)
   values ('<auth user id>', 'name@company.com', 'Full Name', 'admin', null);          -- administrator
   -- agents link to a row in public.agents:
   insert into public.agents (id, name, title, email, phone) values ('agent_jane', 'Jane Doe', 'Property advisor', 'jane@company.com', '+9715…');
   insert into public.profiles (id, email, full_name, role, agent_id) values ('<auth user id>', 'jane@company.com', 'Jane Doe', 'agent', 'agent_jane');
   ```
5. Set `DATA_BACKEND=supabase` and the four Supabase variables, then restart.

**Verification status:** the migration, seed and RLS policies were executed against Postgres (PGlite, with stand-ins
for Supabase's `auth` and `storage` schemas) and the policies were exercised: anonymous users see only published
listings and no leads, cannot insert leads directly, agents see only their own and unassigned leads, cannot change
another agent's listings or leads, and cannot publish. The TypeScript Supabase adapter (`src/lib/data/supabase-store.ts`)
type-checks against the schema but **has not been run against a live Supabase project** — run through the staff flows
once after connecting.

---

## Staff accounts and roles

| Capability                                                        | Administrator | Agent                                         |
| ----------------------------------------------------------------- | ------------- | --------------------------------------------- |
| Dashboard                                                         | All leads     | Own + unassigned leads                        |
| View leads                                                        | All           | Own + unassigned                              |
| Update status, follow-up, notes                                   | Any lead      | Own leads                                     |
| Assign leads                                                      | To anyone     | Claim unassigned leads for themselves         |
| Create listings                                                   | Yes           | Yes (saved as drafts, assigned to themselves) |
| Edit listings                                                     | Any           | Own                                           |
| Publish, feature, record advertising permit, assign listing agent | Yes           | No                                            |
| Integrations page                                                 | Yes           | No                                            |

Enforcement happens in three layers: `src/proxy.ts` rejects requests without a valid session; each page and API route
checks the permission (`src/lib/auth/permissions.ts`); and on Supabase, row-level security plus a trigger protect the
same rules at the database. Leads an agent cannot see return 404 rather than revealing that they exist.

---

## Lead capture workflow

```
Visitor form ──► browser validation (zod) ──► POST /api/leads
                                               │  same-origin check, rate limit (5 / 10 min / IP),
                                               │  honeypot, server validation (same schema)
                                               ▼
                                         store lead (source, property, UTM, consent)
                                               │  property inquiries auto-assign to the listing agent
                                               ▼
                                         notifications: email · WhatsApp · CRM webhook
                                               │  each result (sent / failed / not configured)
                                               ▼  is written to the lead's activity log
                                         CRM: score, assign, follow up, log calls/messages, close
```

Sources recorded: website consultation, property inquiry, viewing request, sell/lease form, contact form — plus manual
sources (WhatsApp, phone, referral, portal, social, walk-in) for leads entered from other channels.

---

## Connecting real services

**Email (Resend).** Verify your sending domain in Resend, then set `RESEND_API_KEY`, `EMAIL_FROM` and
`LEAD_NOTIFICATION_EMAIL` (comma-separated). Each new lead sends a summary with a link to the CRM.

**WhatsApp.** `NEXT_PUBLIC_WHATSAPP_NUMBER` enables click-to-chat buttons with a pre-filled message naming the listing.
For staff alerts, create a WhatsApp Business Cloud API app, get a permanent token and phone number ID, and have a
utility template approved with three body variables (name, intent, source). Set the `WHATSAPP_*` variables.

**External CRM.** Set `CRM_WEBHOOK_URL` (HubSpot workflow, Zoho, Salesforce middleware, Zapier, Make…). Each new lead
is POSTed as JSON (`event: "lead.created"`). With `CRM_WEBHOOK_SECRET` set, verify requests by recomputing
`HMAC_SHA256(secret, "<X-Nexora-Timestamp>.<raw body>")` and comparing it with the `X-Nexora-Signature` header
(`sha256=<hex>`); reject timestamps older than five minutes.

**Maps.** Without a key, maps use an OpenStreetMap embed. With `NEXT_PUBLIC_GOOGLE_MAPS_EMBED_KEY` (restrict it to
your domain and the Maps Embed API) they switch to Google Maps. Demo listings are pinned to the community centre and
say so; set exact coordinates per listing when you have them.

**Analytics.** Set one of the analytics variables. Scripts load only when configured — add a consent banner before
enabling advertising features.

**AI.** See [`src/lib/ai/README.md`](src/lib/ai/README.md).

**Inventory feeds.** Implement `InventoryFeedAdapter` and import listings as unpublished drafts for staff review.

---

## Rebranding

| What                                                            | Where                                                                             |
| --------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| Name, contact details, social links, navigation, licence fields | `src/config/site.ts`                                                              |
| Colours, fonts, radii, shadows                                  | `@theme` tokens in `src/app/globals.css`                                          |
| Logo and favicon                                                | `src/components/brand/logo.tsx`, `public/icon.svg`, `src/app/opengraph-image.tsx` |
| Photography                                                     | `src/config/media.ts`                                                             |
| Homepage copy                                                   | `src/components/home/*`                                                           |
| Community guides and articles                                   | `src/lib/content/*`                                                               |

---

## Content, compliance and honesty rules

These rules are built into the product, not just the demo content:

- **Demo labelling.** With `NEXT_PUBLIC_DEMO_MODE=true` a ribbon on every page, "Demo listing" badges, demo advisor
  badges and CRM banners mark illustrative content, and `robots.txt` blocks all indexing.
- **Verified means verified.** The "Verified" badge appears only after an administrator records an advertising permit
  number (for example, a DLD Trakheesi permit). Demo listings carry none.
- **Off-plan facts.** Handover dates are shown only when marked verified; payment plans and developers only when
  supplied. Visualisations are labelled. Investor sections carry risk and escrow disclaimers.
- **Yields.** A rental yield can only be saved with a source and an as-of date, and is shown with both.
- **No invented credentials.** The footer shows RERA ORN and trade licence fields only once filled in
  `src/config/site.ts`. No ratings, reviews or awards exist anywhere in the code or structured data.
- **Editorial content.** Articles contain no market statistics. Two regulatory figures are cited from public reporting
  (DLD transfer fee of 4%; AED 2 million Golden Visa property threshold, both as reported in late 2025) and marked for
  re-verification with the authorities before publication.
- **Privacy policy and terms** are placeholders that need legal review (UAE PDPL, Federal Decree-Law No. 45 of 2021).
- **Photography** is from Unsplash under its free licence, credited in the data; replace with licensed company
  photography, especially for community pages.

---

## SEO, performance and accessibility

- Per-page titles, descriptions and canonical URLs; filtered/paginated search variants are `noindex`.
- `sitemap.xml` (static pages, communities, articles, every published listing) and `robots.txt`.
- Open Graph images: a branded default plus listing, community and article photos.
- Structured data limited to what the content supports: `RealEstateAgent` (no placeholder phone/address), breadcrumbs,
  `Article`, and `RealEstateListing` **only for non-demo published listings**.
- Listing, community and article pages are statically generated and revalidated (ISR); admin changes trigger
  revalidation. Unknown listings return a real `404`, renamed listings a `308`.
- Images: `next/image` with a custom loader that asks the Unsplash CDN for width-appropriate AVIF/WebP; uploaded photos
  are served with long-lived cache headers.
- Semantic landmarks, skip links, labelled form controls with error descriptions, keyboard-operable combobox, tabs,
  gallery viewer and sheets, visible focus, `prefers-reduced-motion` respected, chart data available as tables.

---

## Security

- **Sessions:** HS256-signed JWT in an `httpOnly`, `SameSite=Lax`, `Secure` (production) cookie; 8-hour lifetime.
  `AUTH_SECRET` is mandatory in production.
- **CSRF:** all mutating endpoints require a same-origin `Origin` (or `Sec-Fetch-Site`) header.
- **Rate limiting:** lead submissions (5 per 10 minutes per IP), logins (per IP and per account), uploads.
  The limiter is in-memory per server instance — use Redis/Upstash for multi-instance deployments. It keys on
  `X-Forwarded-For`, so deploy behind a proxy that sets this header (Vercel does).
- **Validation:** zod schemas on every input; uploads checked by file signature (JPEG/PNG/WebP), size-limited and
  stored under random names.
- **Headers:** Content-Security-Policy, HSTS (production), `X-Frame-Options: DENY`, `nosniff`, Referrer-Policy,
  Permissions-Policy; internal pages are `no-store` and `noindex`.
- **Secrets:** the Supabase service-role key and all provider keys are read only in server modules (`server-only`).
- **Personal data:** public APIs never return lead data; agents only see leads they are entitled to; demo leads use
  reserved `example.com` addresses and UK drama-range phone numbers (+44 7700 900xxx).
- `npm audit` reports advisories only in ESLint's development dependencies (`braces` via `fast-glob`); nothing in the
  runtime bundle.

---

## Quality checks

Run before each release:

```bash
npm run check          # TypeScript, ESLint, Prettier
npm run build          # production build
```

End-to-end checks (Playwright for Python) cover routes, search and filters, every listing link, all lead forms,
validation, rate limiting, CSRF, access control for both roles, the full listing lifecycle (create → upload → publish →
unpublish), and responsive layouts at 390, 820 and 1440 px:

```bash
pip install playwright && python -m playwright install chromium
AUTH_SECRET=… DEMO_ADMIN_PASSWORD=… DEMO_AGENT_PASSWORD=… npm start -- -p 3100
BASE=http://localhost:3100 ADMIN_PASSWORD=… AGENT_PASSWORD=… python tests/e2e/smoke_test.py
```

The latest run is summarised in [`docs/QA-REPORT.md`](docs/QA-REPORT.md).

---

## Deployment

**Vercel + Supabase (recommended).** Import the repository, set `NEXT_PUBLIC_SITE_URL`, `AUTH_SECRET`,
`DATA_BACKEND=supabase` and the Supabase variables, and deploy. Add the integration variables as each service is
connected. Keep `NEXT_PUBLIC_DEMO_MODE=true` until real listings and licence details are in place.

**Self-hosted Node.** `npm ci && npm run build && npm start` behind a reverse proxy that terminates TLS and sets
`X-Forwarded-For`. The demo store works on a single instance with a persistent disk (`DEMO_DATA_DIR`).

---

## Known limitations

- Demo content only: no real listings, advisors or market data are included.
- The Supabase adapter has not been exercised against a live project (the SQL has — see above).
- Email, WhatsApp, CRM, analytics, Google Maps, AI and inventory feeds need credentials or adapters as listed.
- In-memory rate limiting is per instance.
- No staff password reset or user management screen yet — use the Supabase dashboard.
- Search is optimised for hundreds to low thousands of listings; add Postgres full-text search or a search service
  (Typesense, Algolia) as inventory grows.
- Arabic language and right-to-left layout are not yet implemented (`dir` is set on `<html>` ready for it).
