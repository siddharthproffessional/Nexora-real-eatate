# Ten-minute demonstration script

A suggested walkthrough for presenting the build to management. Start from a fresh demo store
(`npm run demo:reset`, then `npm run dev`) and keep two browser windows open: one for the website, one signed in as
the administrator (`/login`).

## 1. The website (3 minutes)

1. **Homepage.** Point out the demonstration ribbon, the search panel (Buy / Rent / Off-plan), featured listings
   labelled "Demo listing", the community index (hover the names), the investment table (handover shown as
   "Awaiting verification", yields "Not published"), and the consultation form.
2. **Phrase search.** In the hero, type `marina`, pick Dubai Marina, choose Rent and search. Then on the results page
   type `3 bed villa under 10m` in the keyword box: the phrase becomes filter chips the visitor can remove.
3. **A listing.** Open any property: gallery viewer (arrow keys), key facts with "Advertising permit: Not yet verified",
   map of the community, similar listings, Save and Share. On a phone, scroll down to see the "Book a viewing" bar.

## 2. A lead arrives (3 minutes)

4. On the listing, **book a viewing** with your own name. The confirmation explains, honestly, that the request was
   stored and that email/WhatsApp alerts are not configured yet.
5. Switch to the platform window: **Dashboard** shows the new lead in the totals; **Leads** shows it at the top,
   already assigned to the listing's agent, with a rules-based score.
6. Open the lead: contact actions (call, WhatsApp, email), the property and viewing request, **"Why this score"**, and
   the activity log, including "Email alert not sent: email provider is not configured".
7. Change the status to _Viewing scheduled_, set a follow-up date, add a call note. The dashboard's follow-up list
   updates.

## 3. Listings and control (3 minutes)

8. **Properties → New listing.** Save with empty fields to show validation, then create a draft, upload a photo and
   **Publish**. Search for it on the website; then **Unpublish** and show that it disappears.
9. Sign out and sign in as the **agent** (`agent@nexora.example`): only their own and unassigned leads are visible,
   the Integrations page is closed to them, and they cannot publish.
10. Back as administrator, open **Integrations**: what is connected, what runs on a fallback, what needs credentials,
    and the AI modules that are defined but deliberately switched off.

## 4. Close (1 minute)

Open the architecture deck's "Decisions needed to launch" slide.
