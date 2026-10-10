# Architecture and roadmap

## Principles

1. **One codebase, two audiences.** The public website and the internal platform share one domain model, one data
   layer and one deployment, so a lead captured on the site is a first-class CRM record the moment it is saved.
2. **Ports and adapters.** UI and API code depend on interfaces (`src/lib/data/types.ts`, `src/lib/ai`,
   `src/lib/integrations`), never on a vendor. Swapping the demo store for Supabase — or Supabase for an in-house
   service — does not touch pages or components.
3. **Truthful by construction.** Unverified facts cannot be displayed as verified: the schema separates "supplied" from
   "verified" (handover dates, permits, yields with sources), notifications report real delivery results, AI features
   return 501 until implemented, and demo content is labelled everywhere.
4. **Defence in depth.** Proxy → page/API permission checks → database row-level security.

## Layers

```
┌──────────────────────────────── Presentation ────────────────────────────────┐
│ Public website (app/(site))            Staff platform (app/(staff), /login)    │
│ server components + small client islands: search state, forms, gallery, charts│
└───────────────────────────────────────┬───────────────────────────────────────┘
                                        │
┌──────────────────────────────── Application ─────────────────────────────────┐
│ API routes (app/api)   proxy.ts   auth (sessions, permissions, guards)         │
│ validation (zod, shared with the browser)   search (query, filter, interpret)   │
│ lead scoring (rules)   CRM metrics   notifications   revalidation              │
└───────────────────────────────────────┬───────────────────────────────────────┘
                                        │
┌──────────────────────────────── Domain ──────────────────────────────────────┐
│ Property · Lead · LeadNote · LeadActivity · Agent · StaffUser · Community      │
└───────────────────────────────────────┬───────────────────────────────────────┘
                                        │ repository interfaces
┌─────────────────────────────── Data adapters ────────────────────────────────┐
│ Demo store (JSON on disk)                Supabase: Postgres + Auth + Storage    │
└───────────────────────────────────────────────────────────────────────────────┘
┌─────────────────────────────── Integrations ─────────────────────────────────┐
│ Resend email · WhatsApp (click-to-chat, Cloud API) · CRM webhook · Maps ·       │
│ Analytics · AI provider (contract only) · Inventory feeds (contract only)       │
└───────────────────────────────────────────────────────────────────────────────┘
```

## Key flows

**Property discovery.** Filters live in the URL (`/buy?community=dubai-marina&beds=2`). The page parses them with a
lenient zod schema, optionally interprets a free-text phrase into filters, and queries the repository. Changing a
filter navigates inside a React transition, keeping current results visible until new ones arrive. Listing, community
and article pages are statically generated and revalidated; admin changes purge the cache.

**Lead capture.** Every form posts to `/api/leads`: same-origin check → rate limit → schema validation → honeypot →
store → auto-assign to the listing agent → notifications (email, WhatsApp, webhook) → each delivery result appended to
the lead's activity log → response tells the visitor exactly what happened.

**Staff work.** Sessions are signed cookies verified at the proxy and again in each page and route. Agents work their
own and unassigned leads; administrators manage everything. Listing changes flow through the same validation schema as
the admin form, then revalidate public pages.

## Data model (Supabase)

| Table           | Purpose                                                                                               |
| --------------- | ----------------------------------------------------------------------------------------------------- |
| `agents`        | Advisors who can be assigned leads and listings                                                       |
| `profiles`      | Staff accounts (Supabase Auth user → role, agent)                                                     |
| `properties`    | Listings, with `verification`, `off_plan`, `rental_yield` as structured JSON and `is_demo`            |
| `leads`         | Inquiries with source, intent, budget, property, viewing, consent, UTM, status, assignment, follow-up |
| `lead_notes`    | Calls, messages, meetings, internal notes                                                             |
| `lead_activity` | Append-only history: creation, status changes, assignment, notifications                              |

## Roadmap: from website to the company's own real estate platform

### Phase 1 — Launch (0–3 months)

- Connect Supabase, Resend and WhatsApp; enter licence details; replace demo content and photography.
- Advertising-permit workflow for every published listing; legal review of privacy policy and terms.
- Analytics with a consent banner; Search Console; switch `NEXT_PUBLIC_DEMO_MODE` off.
- Staff management screen (invite, deactivate, reset password).

### Phase 2 — Agency operating system (3–6 months)

- Viewing calendar with Google/Microsoft calendar sync and automated reminders.
- Deal pipeline after "closed": MOU, NOC, transfer checklist, commission tracking and invoices.
- Document vault per lead/deal (passport, Form F, tenancy contracts) with access controls and retention rules.
- Portal syndication and inventory feeds; landlord/owner portal showing listing performance.
- Audit log, SLAs on first response, task assignment and team dashboards.

### Phase 3 — Intelligence (6–12 months)

- AI adapters behind the existing contracts: inquiry categorisation and routing, lead qualification summaries,
  description drafting with human approval, recommendations from saved searches.
- Market data ingestion from official open data (e.g. Dubai Land Department) for cited market reports and pricing
  evidence; replaces the rules-based phrase search with a hybrid model while keeping explanations visible.
- Saved searches and alerts for clients; investor portal tracking owned units, rents and service charges.
- India desk tooling: INR display, NRI documentation checklists, remittance guidance links.

### Phase 4 — Product

- Arabic and right-to-left interface.
- Multi-office or multi-tenant model (organisation id on every table, per-tenant branding via `siteConfig`), if the
  company chooses to license the platform to partner brokerages.
- Public API for partners and a mobile app for agents built on the same API routes.
