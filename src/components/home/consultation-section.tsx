import Image from "next/image";
import { Mail, Phone } from "lucide-react";
import { pagePhotos } from "@/config/media";
import { siteConfig } from "@/config/site";
import { ConsultationForm } from "@/components/leads/consultation-form";

const nextSteps = [
  "An advisor reviews your request and your preferred communities.",
  "We contact you the way you asked — WhatsApp, phone or email.",
  "You receive a shortlist with the costs and risks set out clearly.",
];

export function ConsultationSection({ id = "advisor" }: { id?: string }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="container-page scroll-mt-24 py-20 lg:py-28">
      <div className="grid overflow-hidden rounded-md bg-white shadow-panel lg:grid-cols-12">
        <div className="on-dark relative flex flex-col justify-between overflow-hidden bg-navy p-8 text-ivory sm:p-10 lg:col-span-5">
          <Image src={pagePhotos.consultation.src} alt="" fill sizes="(min-width: 1024px) 520px, 100vw" className="object-cover opacity-25" />
          <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-navy/60 to-navy" />
          <div className="relative">
            <h2 id={`${id}-title`} className="display text-[2.2rem] sm:text-[2.6rem]">
              Speak to an advisor
            </h2>
            <p className="mt-4 max-w-[40ch] text-[16px] leading-relaxed text-ivory/75">
              Tell us what you are looking for. There is no obligation, and your details stay with us.
            </p>
          </div>
          <div className="relative mt-12">
            <h3 className="text-[13px] font-semibold text-gold">What happens next</h3>
            <ol className="mt-4 space-y-4">
              {nextSteps.map((s, i) => (
                <li key={s} className="flex gap-4 text-[14.5px] leading-relaxed text-ivory/85">
                  <span className="serif tabular flex size-7 shrink-0 items-center justify-center rounded-full border border-gold/60 text-[13px] text-gold">
                    {i + 1}
                  </span>
                  {s}
                </li>
              ))}
            </ol>
            <div className="mt-10 flex flex-col gap-2 border-t border-white/15 pt-6 text-[14px] text-ivory/80">
              <a href={siteConfig.contact.phoneHref} className="inline-flex items-center gap-2.5 hover:text-ivory">
                <Phone className="size-4 text-gold" aria-hidden /> {siteConfig.contact.phoneDisplay}
              </a>
              <a href={`mailto:${siteConfig.contact.email}`} className="inline-flex items-center gap-2.5 hover:text-ivory">
                <Mail className="size-4 text-gold" aria-hidden /> {siteConfig.contact.email}
              </a>
            </div>
          </div>
        </div>
        <div className="p-6 sm:p-10 lg:col-span-7 lg:p-12">
          <ConsultationForm />
        </div>
      </div>
    </section>
  );
}
