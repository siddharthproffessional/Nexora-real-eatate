import type { Metadata } from "next";
import { pagePhotos } from "@/config/media";
import { PhotoHero } from "@/components/site/page-intro";
import { SellLeaseForm } from "@/components/leads/sell-lease-form";

export const metadata: Metadata = {
  title: "Sell or lease your property",
  description: "Request a valuation and a marketing plan for selling or leasing your Dubai property.",
  alternates: { canonical: "/sell-or-lease" },
};

const steps = [
  {
    title: "Valuation",
    text: "We assess your property against recent registered transactions and current competition, and explain how we reached the figure.",
  },
  { title: "Marketing plan", text: "Photography, a written description, listing channels and a viewing plan, agreed with you before anything goes live." },
  { title: "Permits and paperwork", text: "We prepare the listing agreement and obtain the advertising permit required before a property can be marketed." },
  { title: "Viewings and offers", text: "We qualify buyers or tenants, host viewings and bring every offer to you in writing." },
  { title: "Completion", text: "For sales, we coordinate the MOU, developer clearance and transfer. For leases, the tenancy contract and Ejari registration." },
];

export default function SellOrLeasePage() {
  return (
    <>
      <PhotoHero
        photo={pagePhotos.sell}
        title="Sell or lease your property"
        intro="A considered valuation, a clear marketing plan and one advisor accountable from listing to completion."
      />
      <div className="container-page grid gap-16 py-16 lg:grid-cols-12 lg:py-24">
        <section aria-labelledby="process-title" className="lg:col-span-5">
          <h2 id="process-title" className="display text-[2rem] sm:text-[2.5rem]">
            How it works
          </h2>
          <ol className="mt-8 border-l border-line-strong">
            {steps.map((s, i) => (
              <li key={s.title} className="relative pb-8 pl-8 last:pb-0">
                <span className="serif tabular absolute top-0 -left-[15px] flex size-[30px] items-center justify-center rounded-full border border-gold-deep bg-ivory text-[14px] text-gold-deep">
                  {i + 1}
                </span>
                <h3 className="pt-1 text-[16.5px] font-semibold text-navy">{s.title}</h3>
                <p className="mt-1.5 text-[15px] leading-relaxed text-slate">{s.text}</p>
              </li>
            ))}
          </ol>
          <p className="mt-10 rounded-sm border border-line bg-white p-5 text-[13.5px] leading-relaxed text-slate">
            Our fees and the terms of any listing agreement are confirmed in writing before you sign. You are under no obligation when you request a valuation.
          </p>
        </section>
        <section aria-labelledby="valuation-title" className="rounded-md bg-white p-6 shadow-panel sm:p-10 lg:col-span-7">
          <h2 id="valuation-title" className="serif text-[30px] text-navy">
            Request a valuation
          </h2>
          <p className="mt-2 mb-8 text-[15px] text-slate">Tell us about the property. An advisor will come back to you with next steps.</p>
          <SellLeaseForm />
        </section>
      </div>
    </>
  );
}
