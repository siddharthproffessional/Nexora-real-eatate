import type { Metadata } from "next";
import Link from "next/link";
import { pagePhotos } from "@/config/media";
import { isDemoMode } from "@/config/site";
import { getStore } from "@/lib/data";
import { initials } from "@/lib/utils";
import { PhotoHero } from "@/components/site/page-intro";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "About us",
  description:
    "Nexora Realty is a property advisory expanding from India to Dubai, built around clear advice, transparent communication and modern technology.",
  alternates: { canonical: "/about" },
};

const principles = [
  {
    title: "Advice before inventory",
    text: "We start with what you are trying to achieve — a family home, a first investment, a relocation — and only then look at properties.",
  },
  {
    title: "Everything in writing",
    text: "Fees, costs of purchase, risks and timelines are set out before you commit. If we do not know something, we say so.",
  },
  {
    title: "Verified, not assumed",
    text: "We publish handover dates, yields and market figures only when they come from a source we can cite.",
  },
  {
    title: "Technology that serves clients",
    text: "Our own platform tracks every inquiry, viewing and follow-up, so nothing you tell us gets lost between advisors.",
  },
];

export default async function AboutPage() {
  const agents = await getStore().agents.list();
  return (
    <>
      <PhotoHero
        photo={pagePhotos.about}
        title="A Dubai advisory with roots in India"
        intro="Nexora is bringing a client-first property practice to Dubai, for local residents and for the many buyers who invest from India and beyond."
      />

      <section aria-labelledby="story-title" className="container-page grid gap-12 py-16 lg:grid-cols-12 lg:py-24">
        <h2 id="story-title" className="display text-[2rem] sm:text-[2.6rem] lg:col-span-5">
          Why we are here
        </h2>
        <div className="space-y-5 text-[16.5px] leading-[1.75] text-navy-700 lg:col-span-7">
          <p>
            Dubai attracts buyers, tenants and investors from all over the world, and many of them make decisions from a distance. They need an advisor who
            explains the market plainly, handles the detail, and stays accountable after the paperwork is signed.
          </p>
          <p>
            Nexora is expanding from India into Dubai to offer exactly that: residential and investment advisory, a dedicated desk for clients based in India,
            and a commercial team for businesses setting up in the city.
          </p>
          <p className="rounded-sm border border-dashed border-gold-deep/50 bg-white/70 p-4 text-[14px] leading-relaxed text-slate">
            Company history, leadership biographies, licence numbers and office details will be added here once confirmed. We do not publish credentials or
            awards we cannot evidence.
          </p>
        </div>
      </section>

      <section aria-labelledby="principles-title" className="border-y border-line bg-ivory-200/60 py-16 lg:py-24">
        <div className="container-page">
          <h2 id="principles-title" className="display text-[2rem] sm:text-[2.6rem]">
            How we work
          </h2>
          <ul className="mt-12 grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {principles.map((p) => (
              <li key={p.title} className="border-t border-line-strong pt-5">
                <h3 className="text-[17px] font-semibold text-navy">{p.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-slate">{p.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="team-title" className="container-page py-16 lg:py-24">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 id="team-title" className="display text-[2rem] sm:text-[2.6rem]">
            Advisors
          </h2>
          {isDemoMode ? <Badge tone="demo">Demo profiles — fictional advisors</Badge> : null}
        </div>
        <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {agents.map((a) => (
            <li key={a.id} className="flex gap-4 rounded-md border border-line bg-white p-5">
              <span className="serif flex size-14 shrink-0 items-center justify-center rounded-full bg-navy text-[19px] text-gold">{initials(a.name)}</span>
              <div>
                <p className="text-[16px] font-semibold text-navy">{a.name}</p>
                <p className="text-[13.5px] text-slate">{a.title}</p>
                <p className="mt-2 text-[13.5px] leading-relaxed text-navy-700">{a.focus}</p>
                <p className="mt-1 text-[12.5px] text-slate">Speaks {a.languages.join(", ")}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {isDemoMode ? (
        <section id="about-this-demo" aria-labelledby="demo-title" className="scroll-mt-24 border-t border-line bg-white py-16 lg:py-20">
          <div className="container-page grid gap-10 lg:grid-cols-12">
            <h2 id="demo-title" className="display text-[2rem] sm:text-[2.4rem] lg:col-span-4">
              About this demonstration
            </h2>
            <div className="space-y-4 text-[15.5px] leading-relaxed text-navy-700 lg:col-span-8">
              <p>
                This site is a working demonstration of Nexora&rsquo;s website and internal platform. The search, saved properties, inquiry forms, CRM and
                listing administration all function. The content they operate on is illustrative:
              </p>
              <ul className="list-disc space-y-2 pl-5 marker:text-gold-deep">
                <li>
                  Listings, prices, payment plans and project names are invented for demonstration. None are live inventory and none carry an advertising
                  permit.
                </li>
                <li>Advisor profiles are fictional. Contact details in the header and footer are placeholders.</li>
                <li>Community guides describe real Dubai neighbourhoods in general terms. Photography is from Unsplash and is illustrative.</li>
                <li>Inquiries you submit are stored in the demo CRM. Email and WhatsApp alerts are only sent once those services are connected.</li>
              </ul>
              <div className="pt-2">
                <Button asChild variant="outline">
                  <Link href="/contact#advisor">Contact the team</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}
