"""
End-to-end smoke tests for NEXORA Realty, run against a production build.

    pip install playwright && python -m playwright install chromium
    BASE=http://localhost:3100 ADMIN_PASSWORD=... AGENT_PASSWORD=... python tests/e2e/smoke_test.py

The server must run on the demo store (DATA_BACKEND=demo) with DEMO_ADMIN_PASSWORD / DEMO_AGENT_PASSWORD set to the
same values, and should be freshly started (rate limits are in memory). Results are written to smoke-results.json.
Set MOCK_IMAGES=1 to serve stand-in photographs when the Unsplash CDN is unreachable (e.g. in CI sandboxes).
"""
import hashlib, io, json, os, re, sys, time, datetime
from playwright.sync_api import sync_playwright, expect

BASE = os.environ.get("BASE", "http://localhost:3100")
ADMIN = (os.environ.get("ADMIN_EMAIL", "admin@nexora.example"), os.environ["ADMIN_PASSWORD"])
AGENT = (os.environ.get("AGENT_EMAIL", "agent@nexora.example"), os.environ["AGENT_PASSWORD"])
HERE = os.path.dirname(os.path.abspath(__file__))
# Smallest valid JPEG (1x1 px) for upload tests and optional image mocking.
TINY_JPEG = bytes.fromhex(
    "ffd8ffe000104a46494600010100000100010000ffdb004300080606070605080707070909080a0c140d0c0b0b0c1912130f141d1a1f1e1d1a1c1c"
    "20242e2720222c231c1c2837292c30313434341f27393d38323c2e333432ffc0000b080001000101011100ffc4001f00000105010101010101000000"
    "00000000000102030405060708090a0bffc400b5100002010303020403050504040000017d01020300041105122131410613516107227114328191a1"
    "082342b1c11552d1f02433627282090a161718191a25262728292a3435363738393a434445464748494a535455565758595a636465666768696a7374"
    "75767778797a838485868788898a92939495969798999aa2a3a4a5a6a7a8a9aab2b3b4b5b6b7b8b9bac2c3c4c5c6c7c8c9cad2d3d4d5d6d7d8d9da"
    "e1e2e3e4e5e6e7e8e9eaf1f2f3f4f5f6f7f8f9faffda0008010100003f00fbd3ffd9"
)
MOCKS = [TINY_JPEG] * 6
MOCK_IMAGES = os.environ.get("MOCK_IMAGES") == "1"

results = []
def check(name, ok, detail=""):
    results.append((name, bool(ok), detail))
    print(("PASS " if ok else "FAIL ") + name + (f"  [{detail}]" if detail else ""))

IGNORED = ("ERR_TUNNEL_CONNECTION_FAILED", "images.unsplash.com", "openstreetmap", "Failed to load resource")

def new_ctx(browser, ip, width=1440, height=900, mobile=False):
    ctx = browser.new_context(viewport={"width": width, "height": height}, extra_http_headers={"X-Forwarded-For": ip}, is_mobile=mobile, has_touch=mobile, reduced_motion="reduce")
    if MOCK_IMAGES:
        ctx.route("**/images.unsplash.com/**", lambda r: r.fulfill(status=200, content_type="image/jpeg", body=MOCKS[0]))
        ctx.route("**/www.openstreetmap.org/**", lambda r: r.fulfill(status=200, content_type="text/html", body="<html><body>map</body></html>"))
    return ctx

def watch(page, bucket):
    page.on("console", lambda m: bucket.append(m.text) if m.type == "error" and not any(s in m.text for s in IGNORED) else None)
    page.on("pageerror", lambda e: bucket.append(f"pageerror {e}"))

def login(ctx, creds):
    r = ctx.request.post(f"{BASE}/api/auth/login", data={"email": creds[0], "password": creds[1]}, headers={"Origin": BASE})
    return r.status

with sync_playwright() as p:
    browser = p.chromium.launch()

    # ── 1. Public routes render ─────────────────────────────────
    ctx = new_ctx(browser, "10.0.0.1")
    page = ctx.new_page(); errors = []; watch(page, errors)
    routes = ["/", "/properties", "/buy", "/rent", "/off-plan", "/commercial", "/communities", "/communities/dubai-marina", "/sell-or-lease", "/about", "/contact", "/insights", "/insights/buying-your-first-home-in-dubai", "/privacy", "/terms", "/saved", "/login", "/robots.txt", "/sitemap.xml", "/opengraph-image"]
    for r in routes:
        resp = page.goto(BASE + r, wait_until="networkidle")
        ok = resp.status == 200
        detail = str(resp.status)
        if ok and not r.endswith((".txt", ".xml", "image")):
            h1 = page.locator("h1").count()
            title = page.title()
            ok = h1 >= 1 and len(title) > 5
            detail = f"h1={h1} title={title[:60]!r}"
        check(f"route {r}", ok, detail)
    resp = page.goto(BASE + "/this-does-not-exist", wait_until="networkidle")
    check("unknown route returns 404", resp.status == 404, str(resp.status))
    resp = page.goto(BASE + "/properties/nonexistent-nxr-d-9999", wait_until="networkidle")
    check("unknown listing returns 404", resp.status == 404, str(resp.status))
    check("no console errors on public routes", not errors, "; ".join(errors[:3]))

    # robots in demo mode
    txt = page.goto(BASE + "/robots.txt").text()
    check("robots.txt blocks indexing in demo mode", "Disallow: /" in txt, txt.strip().replace("\n", " | "))
    sm = page.goto(BASE + "/sitemap.xml").text()
    check("sitemap lists listings and communities", sm.count("<url>") >= 40 and "/properties/" in sm, f"{sm.count('<url>')} urls")

    # ── 2. Property links from every search card ────────────────
    errors.clear()
    hrefs = set()
    for pg in range(1, 5):
        page.goto(f"{BASE}/properties?page={pg}", wait_until="networkidle")
        for a in page.locator("article h3 a").all():
            hrefs.add((a.get_attribute("href"), a.inner_text().strip()))
    bad = []
    for href, title in sorted(hrefs):
        resp = page.goto(BASE + href, wait_until="domcontentloaded")
        h1 = page.locator("h1").first.inner_text().strip()
        if resp.status != 200 or h1 != title:
            bad.append(f"{href} -> {resp.status} {h1!r}")
    check(f"all {len(hrefs)} listing cards open the matching property page", len(hrefs) >= 27 and not bad, "; ".join(bad[:3]))

    # Legacy slug redirects to canonical
    resp = page.goto(BASE + "/properties/some-old-title-nxr-d-1002", wait_until="domcontentloaded")
    check("old listing slug redirects to canonical URL", page.url.endswith("/properties/marina-facing-three-bedroom-apartment-nxr-d-1002"), page.url)

    # ── 3. Search & filters ─────────────────────────────────────
    page.goto(BASE + "/buy", wait_until="networkidle")
    total0 = int(re.search(r"(\d+)", page.locator("[aria-live=polite]").first.inner_text()).group(1))
    page.select_option("#filters-community", "palm-jumeirah")
    page.wait_for_url(re.compile(r"community=palm-jumeirah"))
    page.wait_for_load_state("networkidle")
    total1 = int(re.search(r"(\d+)", page.locator("[aria-live=polite]").first.inner_text()).group(1))
    communities_shown = set(t.split("/")[0].strip() for t in page.locator("article .text-slate span").all_inner_texts() if "/" in t)
    check("community filter narrows results", total1 < total0 and total1 > 0, f"{total0} -> {total1}")
    page.select_option("#sort", "price-asc")
    page.wait_for_url(re.compile(r"sort=price-asc"))
    page.wait_for_load_state("networkidle")
    prices = [int(re.sub(r"\D", "", t)) for t in page.locator("article p.tabular span.font-semibold").all_inner_texts()]
    check("sort by price ascending", prices == sorted(prices) and len(prices) > 1, str(prices))
    page.click("button[aria-pressed=false]:has(.sr-only:text('List view'))")
    page.wait_for_url(re.compile(r"view=list"))
    check("list view toggle", "view=list" in page.url)
    page.goto(BASE + "/rent?beds=9", wait_until="networkidle")
    page.goto(BASE + "/rent?minPrice=100000000", wait_until="networkidle")
    check("empty results state", page.locator("text=No properties match these filters").count() == 1)
    page.goto(BASE + "/buy?q=3+bed+villa+under+10m", wait_until="networkidle")
    chips = page.locator("[aria-label='Active filters'] a").all_inner_texts()
    check("phrase search becomes filters", any("Villa" in c for c in chips) and any("3 bedrooms" in c for c in chips) and any("10M" in c for c in chips), str(chips))
    page.goto(BASE + "/properties", wait_until="networkidle")
    page.click("nav[aria-label=Pagination] a:has-text('2')")
    page.wait_for_url(re.compile(r"page=2"))
    check("pagination to page 2", page.locator("article").count() > 0)

    # Hero search
    page.goto(BASE + "/", wait_until="networkidle")
    page.click("label:has-text('Rent')")
    page.fill("#hero-location", "mari")
    page.click("[role=option]:has-text('Dubai Marina')")
    page.select_option("#hero-beds", "2")
    page.click("button:has-text('Search properties')")
    page.wait_for_url(re.compile(r"/rent\?"))
    check("hero search routes to rent with filters", "community=dubai-marina" in page.url and "beds=2" in page.url, page.url)

    # Favourites
    page.goto(BASE + "/buy", wait_until="networkidle")
    first_title = page.locator("article h3 a").first.inner_text()
    page.locator("article button[aria-pressed]").first.click()
    page.goto(BASE + "/saved", wait_until="networkidle")
    page.wait_for_selector("article", timeout=10000)
    check("saved property appears on /saved", first_title in page.locator("article h3").all_inner_texts()[0], first_title)
    ctx.close()

    # ── 4. Lead capture forms ───────────────────────────────────
    ctx = new_ctx(browser, "10.0.0.2")
    page = ctx.new_page(); errors = []; watch(page, errors)
    page.goto(BASE + "/", wait_until="networkidle")
    form = page.locator("#advisor form")
    form.locator("button[type=submit]").click()
    check("consultation form shows validation errors", page.locator("#advisor .text-danger").count() >= 3, str(page.locator("#advisor .text-danger").count()))
    stamp = str(int(time.time()))[-6:]
    name = f"QA Consultation {stamp}"
    form.locator("[name=name]").fill(name)
    form.locator("[name=email]").fill(f"qa{stamp}@example.com")
    form.locator("[name=phoneNumber]").fill("0501234567")
    form.locator("[name=intent]").select_option("invest")
    form.locator("[name=budgetBand]").select_option("2m-5m")
    form.locator("[name=preferredCommunity]").select_option("business-bay")
    form.locator("[name=consentPrivacy]").check()
    form.locator("button[type=submit]").click()
    page.wait_for_selector("#advisor [role=status]", timeout=15000)
    status_text = page.locator("#advisor [role=status]").inner_text()
    check("consultation submission succeeds", "Request received" in status_text and "Demo environment" in status_text, status_text[:80])
    check("success panel reports notifications honestly", "not configured, nothing was sent" in status_text)

    # Viewing request
    page.goto(BASE + "/properties/two-bedroom-residence-with-burj-khalifa-views-nxr-d-1001", wait_until="networkidle")
    d = (datetime.date.today() + datetime.timedelta(days=3)).isoformat()
    vf = page.locator("aside form")
    vf.locator("[name=viewingDate]").fill(d)
    vf.locator("[name=viewingTimeSlot]").select_option("evening")
    viewer = f"QA Viewing {stamp}"
    vf.locator("[name=name]").fill(viewer)
    vf.locator("[name=email]").fill(f"viewer{stamp}@example.com")
    vf.locator("[name=phoneCountry]").select_option("+91")
    vf.locator("[name=phoneNumber]").fill("9876543210")
    vf.locator("[name=consentPrivacy]").check()
    vf.locator("button[type=submit]").click()
    page.wait_for_selector("aside [role=status]", timeout=15000)
    check("viewing request succeeds", "Viewing request received" in page.locator("aside [role=status]").inner_text())

    # Sell or lease
    page.goto(BASE + "/sell-or-lease", wait_until="networkidle")
    sf = page.locator("form").first
    sf.locator("label:has-text('Lease it out')").click()
    sf.locator("[name=sellPropertyType]").select_option("apartment")
    sf.locator("[name=sellCommunity]").select_option("Dubai Marina")
    sf.locator("[name=sellAreaSqft]").fill("1450")
    sf.locator("[name=name]").fill(f"QA Owner {stamp}")
    sf.locator("[name=email]").fill(f"owner{stamp}@example.com")
    sf.locator("[name=phoneNumber]").fill("501112233")
    sf.locator("[name=consentPrivacy]").check()
    sf.locator("button[type=submit]").click()
    page.wait_for_selector("[role=status]:has-text('Valuation request received')", timeout=15000)
    check("sell or lease request succeeds", True)
    check("no console errors during form flows", not errors, "; ".join(errors[:3]))

    # API hardening
    r = ctx.request.post(f"{BASE}/api/leads", data={"name": "x"}, headers={"Origin": "https://evil.example"})
    check("cross-site lead POST blocked (403)", r.status == 403, str(r.status))
    payload = {"name": "Bot", "email": "bot@example.com", "phoneCountry": "+971", "phoneNumber": "501234567", "intent": "buy", "contactMethod": "email", "source": "contact_form", "consentPrivacy": True, "website": "http://spam"}
    r = ctx.request.post(f"{BASE}/api/leads", data=payload, headers={"Origin": BASE, "X-Forwarded-For": "10.0.0.99"})
    check("honeypot submission rejected", r.status in (400, 422), str(r.status))
    bad = dict(payload, website="", email="not-an-email")
    r = ctx.request.post(f"{BASE}/api/leads", data=bad, headers={"Origin": BASE, "X-Forwarded-For": "10.0.0.98"})
    check("server-side validation rejects invalid email (422)", r.status == 422 and "email" in r.json().get("fieldErrors", {}), str(r.status))
    codes = []
    for i in range(7):
        rr = ctx.request.post(f"{BASE}/api/leads", data=bad, headers={"Origin": BASE, "X-Forwarded-For": "10.0.0.77"})
        codes.append(rr.status)
    check("lead endpoint rate-limits repeated submissions (429)", 429 in codes, str(codes))
    ctx.close()

    # ── 5. Access control ───────────────────────────────────────
    ctx = new_ctx(browser, "10.0.0.3")
    page = ctx.new_page()
    page.goto(BASE + "/crm", wait_until="networkidle")
    check("anonymous /crm redirects to login", "/login?next=%2Fcrm" in page.url, page.url)
    page.goto(BASE + "/admin/properties/new", wait_until="networkidle")
    check("anonymous /admin redirects to login", "/login" in page.url, page.url)
    r = ctx.request.get(f"{BASE}/api/internal/leads/lead_demo_001")
    check("anonymous internal API returns 401", r.status == 401, str(r.status))
    r = ctx.request.post(f"{BASE}/api/ai/lead-qualification", headers={"Origin": BASE})
    check("staff AI endpoint requires sign-in", r.status == 401, str(r.status))
    r = ctx.request.post(f"{BASE}/api/ai/natural-language-search", headers={"Origin": BASE})
    check("AI endpoint reports not configured (501), no fake output", r.status == 501 and r.json().get("configured") is False, str(r.status))
    # forged cookie
    ctx.add_cookies([{"name": "nx_session", "value": "eyJhbGciOiJIUzI1NiJ9.eyJyb2xlIjoiYWRtaW4ifQ.forged", "url": BASE}])
    page.goto(BASE + "/crm", wait_until="networkidle")
    check("forged session cookie rejected", "/login" in page.url, page.url)
    # wrong password
    r = ctx.request.post(f"{BASE}/api/auth/login", data={"email": ADMIN[0], "password": "wrong"}, headers={"Origin": BASE})
    check("wrong password rejected", r.status == 401, str(r.status))
    if ADMIN[1] != "NexoraAdmin!2026":
        r = ctx.request.post(f"{BASE}/api/auth/login", data={"email": ADMIN[0], "password": "NexoraAdmin!2026"}, headers={"Origin": BASE})
        check("development default password disabled in production", r.status == 401, str(r.status))
    ctx.close()

    # Login through the UI as agent
    ctx = new_ctx(browser, "10.0.0.4")
    page = ctx.new_page(); errors = []; watch(page, errors)
    page.goto(BASE + "/login?next=/crm/leads", wait_until="networkidle")
    check("login page hides dev credentials in production", page.locator("text=Demo accounts").count() == 0)
    page.fill("#login-email", AGENT[0]); page.fill("#login-password", AGENT[1])
    page.click("button:has-text('Sign in')")
    page.wait_for_url(lambda u: "/login" not in u, timeout=15000)
    page.wait_for_load_state("networkidle")
    check("agent login via UI lands on requested page", page.url.endswith("/crm/leads"), page.url)
    advisors = set(page.locator("tbody td:nth-child(6)").all_inner_texts())
    check("agent sees only own and unassigned leads", advisors and advisors <= {"Rohan Mehta", "Unassigned"}, str(advisors))
    pend = {}
    page.on("request", lambda r: pend.__setitem__(r.url, 1))
    page.on("requestfinished", lambda r: pend.pop(r.url, None))
    page.on("requestfailed", lambda r: pend.pop(r.url, None))
    try:
        page.goto(BASE + "/crm/integrations", wait_until="networkidle", timeout=15000)
    except Exception:
        pass
        page.goto(BASE + "/crm/integrations", wait_until="domcontentloaded")
    check("agent cannot view integrations", page.locator("text=Only administrators can view integration settings").count() == 1)
    # find a lead owned by someone else via admin later; test API directly with a known other-agent lead
    cookies = ctx.cookies()
    check("session cookie is httpOnly + SameSite=Lax", any(c["name"] == "nx_session" and c["httpOnly"] and c["sameSite"] == "Lax" for c in cookies))
    actx = new_ctx(browser, "10.0.0.5"); login(actx, ADMIN)
    all_leads_html = actx.request.get(f"{BASE}/crm/leads?agent=agent_aisha").text()
    other = re.search(r'href="/crm/leads/(lead_[^"]+)"', all_leads_html).group(1)
    r = ctx.request.patch(f"{BASE}/api/internal/leads/{other}", data={"status": "closed_won"}, headers={"Origin": BASE})
    check("agent cannot update another agent's lead", r.status in (403, 404), str(r.status))
    page.goto(f"{BASE}/crm/leads/{other}", wait_until="networkidle")
    check("agent cannot open another agent's lead page", page.locator("text=This page could not be found").count() == 1)
    r = ctx.request.patch(f"{BASE}/api/internal/properties/prop_nxrd1005", data={"published": False}, headers={"Origin": BASE})
    check("agent cannot publish/unpublish listings (403)", r.status == 403, str(r.status))
    r = ctx.request.put(f"{BASE}/api/internal/properties/prop_nxrd1001", data={}, headers={"Origin": BASE})
    check("agent cannot edit another agent's listing (403)", r.status == 403, str(r.status))
    # agent claims an unassigned lead
    page.goto(BASE + "/crm/leads?agent=", wait_until="networkidle")
    page.goto(BASE + "/crm/leads", wait_until="networkidle")
    row = page.locator("tbody tr:has-text('Unassigned')").first
    row.locator("th a").click()
    page.wait_for_load_state("networkidle")
    page.click("button:has-text('Assign to me')")
    page.wait_for_selector("text=Assigned to Rohan Mehta", timeout=10000)
    check("agent can claim an unassigned lead", True)
    page.fill("#note-body", "QA: called the client, viewing next week.")
    page.click("button:has-text('Add note')")
    page.wait_for_selector("text=QA: called the client, viewing next week.", timeout=10000)
    check("agent can add a note to own lead", True)
    page.click("form[action='/api/auth/logout'] button >> nth=0") if page.locator("form[action='/api/auth/logout'] button:visible").count() else None
    page.wait_for_url(re.compile(r"/login"), timeout=10000)
    check("sign out works", "signedOut=1" in page.url, page.url)
    check("no console errors in agent flows", not errors, "; ".join(errors[:3]))
    ctx.close()

    # ── 6. Admin flows ─────────────────────────────────────────
    ctx = actx
    page = ctx.new_page(); errors = []; watch(page, errors)
    page.goto(BASE + "/crm/leads?q=QA+Consultation", wait_until="networkidle")
    check("submitted website lead appears in CRM", page.locator(f"text={name}").count() >= 1, name)
    page.click(f"text={name}")
    page.wait_for_url(re.compile(r"/crm/leads/lead_"))
    page.wait_for_load_state("networkidle")
    check("lead activity logs honest notification results", page.locator("text=Email alert not sent: email provider is not configured").count() == 1)
    page.select_option("#lead-status", "qualified")
    page.select_option("#lead-agent", "agent_mei")
    page.click("button:has-text('Save changes')")
    page.wait_for_selector("text=Changes saved", timeout=10000)
    pend2 = {}
    page.on("request", lambda r: pend2.__setitem__(r.url, r.method))
    page.on("requestfinished", lambda r: pend2.pop(r.url, None))
    page.on("requestfailed", lambda r: pend2.pop(r.url, None))
    try:
        page.reload(wait_until="networkidle", timeout=15000)
    except Exception:
        pass
        page.reload(wait_until="domcontentloaded")
    check("admin updates status and assignment", "Mei Lin Chen" in page.locator("p:has-text('Assigned to')").first.inner_text() and page.locator("#lead-status").input_value() == "qualified")
    page.goto(BASE + "/crm/leads?q=QA+Viewing", wait_until="networkidle")
    page.click(f"text={viewer}"); page.wait_for_url(re.compile(r"/crm/leads/lead_")); page.wait_for_load_state("networkidle")
    body = page.locator("main").inner_text()
    check("viewing lead linked to property and auto-assigned to listing agent", "NXR-D-1001" in body and "Aisha Rahman" in body)

    # Dashboard
    page.goto(BASE + "/crm", wait_until="networkidle")
    check("dashboard renders KPIs and charts", page.locator("text=Conversion rate").count() == 1 and page.locator(".recharts-surface").count() >= 3)

    # Create a listing, upload photo, publish, find on site
    page.goto(BASE + "/admin/properties/new", wait_until="networkidle")
    page.click("button:has-text('Create listing')")
    page.wait_for_selector("text=Check the highlighted fields.")
    check("listing form shows server validation errors", page.locator("text=Enter a descriptive title").count() >= 1)
    page.fill("#pf-title", f"QA test apartment {stamp}")
    page.select_option("#pf-category", "sale")
    page.select_option("#pf-community", "business-bay")
    page.fill("#pf-price", "1,999,000")
    page.fill("#pf-beds", "2"); page.fill("#pf-baths", "2"); page.fill("#pf-area", "1100")
    page.fill("#pf-summary", "A QA-created apartment used to verify the listing workflow end to end.")
    page.fill("#pf-description", "First paragraph.\nSecond paragraph.")
    page.fill("#pf-amenities", "Balcony, Gym")
    page.click("button:has-text('Create listing')")
    page.wait_for_url(re.compile(r"/admin/properties/prop_.*created=1"), timeout=15000)
    check("listing created as draft", page.locator("text=Draft, not on the website").count() == 1)
    pid = re.search(r"/admin/properties/(prop_[^?]+)", page.url).group(1)
    page.set_input_files("#photo-files", files=[{"name": "photo.jpg", "mimeType": "image/jpeg", "buffer": MOCKS[0]}])
    page.fill("#photo-alt", "QA living room")
    page.click("button:has-text('Upload')")
    page.wait_for_selector("img[alt='QA living room']", timeout=15000)
    check("photo upload works", page.locator("img[alt='QA living room']").count() == 1)
    img_src = page.locator("img[alt='QA living room']").get_attribute("src")
    r = ctx.request.get(BASE + img_src)
    check("uploaded photo is served", r.status == 200 and r.headers.get("content-type") == "image/jpeg", f"{r.status} {r.headers.get('content-type')}")
    r = ctx.request.post(f"{BASE}/api/internal/properties/{pid}/images", multipart={"files": {"name": "x.jpg", "mimeType": "image/jpeg", "buffer": b"<script>alert(1)</script>"}}, headers={"Origin": BASE})
    check("non-image upload rejected by signature check (415)", r.status == 415, str(r.status))
    page.click("button:has-text('Publish')")
    page.wait_for_selector("text=View on website", timeout=10000)
    page.goto(BASE + f"/buy?q=QA+test+apartment+{stamp}", wait_until="networkidle")
    check("published listing appears in public search", page.locator(f"article h3:has-text(\"QA test apartment {stamp}\")").count() >= 1)
    r = ctx.request.patch(f"{BASE}/api/internal/properties/{pid}", data={"published": False}, headers={"Origin": BASE})
    check("admin can unpublish", r.status == 200)
    page.goto(BASE + f"/buy?q=QA+test+apartment+{stamp}", wait_until="networkidle")
    check("unpublished listing disappears from search", page.locator(f"article h3:has-text(\"QA test apartment {stamp}\")").count() == 0)
    page.goto(BASE + "/crm/integrations", wait_until="networkidle")
    check("integrations page lists credential needs", page.locator("text=Needs credentials").count() >= 3)
    check("no console errors in admin flows", not errors, "; ".join(errors[:3]))
    ctx.close()

    # ── 7. Responsive layouts ───────────────────────────────────
    overflow = []
    for w, h, label in [(390, 844, "mobile"), (820, 1180, "tablet"), (1440, 900, "desktop")]:
        c = new_ctx(browser, f"10.0.1.{w % 250}", w, h, mobile=(w < 500))
        pg = c.new_page()
        for r in ["/", "/buy", "/properties/marina-facing-three-bedroom-apartment-nxr-d-1002", "/communities/palm-jumeirah", "/contact", "/sell-or-lease", "/about"]:
            pg.goto(BASE + r, wait_until="networkidle")
            sw = pg.evaluate("document.documentElement.scrollWidth")
            if sw > w + 1:
                overflow.append(f"{label} {r} scrollWidth={sw}")
        if w == 390:
            pg.goto(BASE + "/", wait_until="networkidle")
            pg.click("button[aria-label='Open menu']")
            check("mobile menu opens", pg.locator("nav[aria-label=Mobile]").is_visible())
            pg.keyboard.press("Escape")
            pg.goto(BASE + "/buy", wait_until="networkidle")
            pg.click("button:has-text('Filters')")
            check("mobile filter sheet opens", pg.locator("#filters-mobile-community").is_visible())
        c.close()
    check("no horizontal overflow at 390/820/1440px", not overflow, "; ".join(overflow[:4]))

    # staff responsive
    c = new_ctx(browser, "10.0.2.1", 390, 844, mobile=True); login(c, ADMIN); pg = c.new_page()
    of = []
    for r in ["/crm", "/crm/leads", "/admin/properties", "/admin/properties/prop_nxrd1002"]:
        pg.goto(BASE + r, wait_until="networkidle")
        sw = pg.evaluate("document.documentElement.scrollWidth")
        if sw > 391: of.append(f"{r} {sw}")
    check("staff pages have no page-level horizontal overflow on mobile", not of, "; ".join(of))
    c.close()
    browser.close()

passed = sum(1 for _, ok, _ in results if ok)
print(f"\n{passed}/{len(results)} checks passed")
json.dump([{"check": n, "ok": ok, "detail": d} for n, ok, d in results], open("smoke-results.json", "w"), indent=1)
sys.exit(0 if passed == len(results) else 1)
