import { Compass, Handshake, LineChart, MessagesSquare, ShieldCheck } from "lucide-react";

const values = [
  {
    icon: Compass,
    title: "Dubai market expertise",
    text: "Advisors who know each community street by street — building quality, service charges and how demand behaves.",
  },
  {
    icon: Handshake,
    title: "Personal property advisory",
    text: "One advisor from first conversation to keys, with a shortlist built around your plans rather than our inventory.",
  },
  {
    icon: LineChart,
    title: "Homes and investments",
    text: "Ready homes, off-plan projects and commercial space, assessed with the same discipline.",
  },
  {
    icon: MessagesSquare,
    title: "Transparent communication",
    text: "Fees, timelines and risks set out in writing before you commit, with updates on WhatsApp, email or phone.",
  },
  {
    icon: ShieldCheck,
    title: "Support through every step",
    text: "Mortgage introductions, MOU, developer clearances and the transfer appointment, coordinated for you.",
  },
];

const steps = ["Consultation", "Shortlist", "Viewings", "Offer and MOU", "Transfer and handover"];

export function WhyUs() {
  return (
    <div className="grid gap-14 lg:grid-cols-12">
      <div className="lg:col-span-5">
        <h2 id="why-title" className="display text-[2.1rem] sm:text-[2.75rem]">
          Advice built around your plans, not our listings.
        </h2>
        <p className="mt-5 max-w-[48ch] text-[16px] leading-relaxed text-slate">
          Nexora brings a client-first advisory practice from India to Dubai. Whether you are relocating, buying from abroad or growing a portfolio, you get one
          accountable advisor and a clear process.
        </p>
        <ol className="mt-10 border-l border-line-strong" aria-label="How a purchase works with us">
          {steps.map((s, i) => (
            <li key={s} className="relative py-2 pl-6 text-[14.5px] text-navy-700">
              <span aria-hidden className="absolute top-1/2 -left-[4.5px] size-2 -translate-y-1/2 rounded-full border border-gold-deep bg-ivory" />
              <span className="tabular mr-3 text-[12.5px] text-slate">{i + 1}</span>
              {s}
            </li>
          ))}
        </ol>
      </div>
      <ul className="grid gap-x-10 gap-y-9 sm:grid-cols-2 lg:col-span-7 lg:pt-2">
        {values.map(({ icon: Icon, title, text }) => (
          <li key={title} className="border-t border-line pt-5">
            <Icon aria-hidden className="size-6 text-gold-deep" strokeWidth={1.4} />
            <h3 className="mt-4 text-[17px] font-semibold text-navy">{title}</h3>
            <p className="mt-2 text-[15px] leading-relaxed text-slate">{text}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
