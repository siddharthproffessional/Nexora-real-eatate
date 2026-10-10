# QA report

Automated end-to-end run against a production build (`next build && next start`) on the demo store, with production
settings (`NODE_ENV=production`, `AUTH_SECRET` and demo passwords set). Script: `tests/e2e/smoke_test.py`.

**Result: 85 of 85 checks passed.** TypeScript (`tsc --noEmit`), ESLint and Prettier report no issues; `next build` succeeds.

## Routes and SEO

| Check                                           | Result                                                                                   |
| ----------------------------------------------- | ---------------------------------------------------------------------------------------- |
| route /                                         | Pass                                                                                     |
| route /properties                               | Pass                                                                                     |
| route /buy                                      | Pass                                                                                     |
| route /rent                                     | Pass                                                                                     |
| route /off-plan                                 | Pass                                                                                     |
| route /commercial                               | Pass                                                                                     |
| route /communities                              | Pass                                                                                     |
| route /communities/dubai-marina                 | Pass                                                                                     |
| route /sell-or-lease                            | Pass                                                                                     |
| route /about                                    | Pass                                                                                     |
| route /contact                                  | Pass                                                                                     |
| route /insights                                 | Pass                                                                                     |
| route /insights/buying-your-first-home-in-dubai | Pass                                                                                     |
| route /privacy                                  | Pass                                                                                     |
| route /terms                                    | Pass                                                                                     |
| route /saved                                    | Pass                                                                                     |
| route /login                                    | Pass                                                                                     |
| route /robots.txt                               | Pass                                                                                     |
| route /sitemap.xml                              | Pass                                                                                     |
| route /opengraph-image                          | Pass                                                                                     |
| unknown route returns 404                       | Pass — 404                                                                               |
| unknown listing returns 404                     | Pass — 404                                                                               |
| no console errors on public routes              | Pass                                                                                     |
| robots.txt blocks indexing in demo mode         | Pass — User-Agent: * / Disallow: /                                                       |
| sitemap lists listings and communities          | Pass — 55 urls                                                                           |
| old listing slug redirects to canonical URL     | Pass — http://localhost:3100/properties/marina-facing-three-bedroom-apartment-nxr-d-1002 |

## Search and discovery

| Check                                                | Result                                                                                            |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| all 28 listing cards open the matching property page | Pass                                                                                              |
| community filter narrows results                     | Pass — 12 -> 2                                                                                    |
| sort by price ascending                              | Pass — [4600000, 28500000]                                                                        |
| list view toggle                                     | Pass                                                                                              |
| empty results state                                  | Pass                                                                                              |
| phrase search becomes filters                        | Pass — ['Villa\nRemove filter', 'Up to AED 10M\nRemove filter', '3 bedrooms\nRemove filter', 'Cle |
| pagination to page 2                                 | Pass                                                                                              |
| hero search routes to rent with filters              | Pass — http://localhost:3100/rent?community=dubai-marina&beds=2                                   |
| saved property appears on /saved                     | Pass — Penthouse with wraparound terrace                                                          |
| mobile filter sheet opens                            | Pass                                                                                              |

## Lead capture

| Check                                                | Result                                                                                 |
| ---------------------------------------------------- | -------------------------------------------------------------------------------------- |
| consultation form shows validation errors            | Pass — 4                                                                               |
| consultation submission succeeds                     | Pass — Request received Thank you, QA. Your details have been saved and an advisor wil |
| success panel reports notifications honestly         | Pass                                                                                   |
| viewing request succeeds                             | Pass                                                                                   |
| sell or lease request succeeds                       | Pass                                                                                   |
| no console errors during form flows                  | Pass                                                                                   |
| cross-site lead POST blocked (403)                   | Pass — 403                                                                             |
| honeypot submission rejected                         | Pass — 422                                                                             |
| server-side validation rejects invalid email (422)   | Pass — 422                                                                             |
| lead endpoint rate-limits repeated submissions (429) | Pass — [422, 422, 422, 422, 422, 429, 429]                                             |

## Access control and security

| Check                                                              | Result                                                              |
| ------------------------------------------------------------------ | ------------------------------------------------------------------- |
| anonymous /crm redirects to login                                  | Pass — http://localhost:3100/login?next=%2Fcrm                      |
| anonymous /admin redirects to login                                | Pass — http://localhost:3100/login?next=%2Fadmin%2Fproperties%2Fnew |
| anonymous internal API returns 401                                 | Pass — 401                                                          |
| staff AI endpoint requires sign-in                                 | Pass — 401                                                          |
| AI endpoint reports not configured (501), no fake output           | Pass — 501                                                          |
| forged session cookie rejected                                     | Pass — http://localhost:3100/login?next=%2Fcrm                      |
| wrong password rejected                                            | Pass — 401                                                          |
| development default password disabled in production                | Pass — 401                                                          |
| login page hides dev credentials in production                     | Pass                                                                |
| agent login via UI lands on requested page                         | Pass — http://localhost:3100/crm/leads                              |
| agent sees only own and unassigned leads                           | Pass — {'Rohan Mehta', 'Unassigned'}                                |
| agent cannot view integrations                                     | Pass                                                                |
| session cookie is httpOnly + SameSite=Lax                          | Pass                                                                |
| agent cannot update another agent's lead                           | Pass — 404                                                          |
| agent cannot open another agent's lead page                        | Pass                                                                |
| agent cannot publish/unpublish listings (403)                      | Pass — 403                                                          |
| agent cannot edit another agent's listing (403)                    | Pass — 403                                                          |
| agent can claim an unassigned lead                                 | Pass                                                                |
| agent can add a note to own lead                                   | Pass                                                                |
| sign out works                                                     | Pass — http://localhost:3100/login?signedOut=1                      |
| no console errors in agent flows                                   | Pass                                                                |
| viewing lead linked to property and auto-assigned to listing agent | Pass                                                                |

## CRM and administration

| Check                                                        | Result                        |
| ------------------------------------------------------------ | ----------------------------- |
| submitted website lead appears in CRM                        | Pass — QA Consultation 612858 |
| lead activity logs honest notification results               | Pass                          |
| admin updates status and assignment                          | Pass                          |
| dashboard renders KPIs and charts                            | Pass                          |
| listing form shows server validation errors                  | Pass                          |
| listing created as draft                                     | Pass                          |
| photo upload works                                           | Pass                          |
| uploaded photo is served                                     | Pass — 200 image/jpeg         |
| non-image upload rejected by signature check (415)           | Pass — 415                    |
| published listing appears in public search                   | Pass                          |
| admin can unpublish                                          | Pass                          |
| unpublished listing disappears from search                   | Pass                          |
| integrations page lists credential needs                     | Pass                          |
| no console errors in admin flows                             | Pass                          |
| mobile menu opens                                            | Pass                          |
| no horizontal overflow at 390/820/1440px                     | Pass                          |
| staff pages have no page-level horizontal overflow on mobile | Pass                          |

## Also verified

- Supabase schema (`supabase/migrations/0001_init.sql`) and `supabase/seed.sql` executed on Postgres (PGlite) with stand-ins for Supabase's `auth` and `storage` schemas. Row-level security exercised: anonymous users read only published listings and no leads, cannot insert leads; agents see own + unassigned leads only, cannot edit other agents' listings or leads, cannot publish; administrators see everything.
- Visual review of desktop (1440 px), tablet (820 px) and mobile (390 px) layouts for the homepage, search, listing, community, contact, sell-or-lease, about, CRM and admin pages.
- Accessibility basics: one `h1` per page, labelled controls with linked error messages, keyboard-operable combobox, tabs, sheets and gallery, visible focus, reduced-motion support, chart data tables.

## Not verified in this environment

- Photography loading from the Unsplash CDN and the OpenStreetMap embed: the build sandbox has no access to those hosts, so tests served stand-in images. Image URLs were taken from Unsplash's own listings and will load in a normal browser.
- Live delivery through Resend, WhatsApp Cloud API, an external CRM webhook, Google Maps or analytics (no credentials). Each reports "not configured" honestly.
- The TypeScript Supabase adapter against a live Supabase project.
