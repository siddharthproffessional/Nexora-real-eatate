import type { Metadata } from "next";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { siteConfig } from "@/config/site";
import { PageIntro } from "@/components/site/page-intro";
import { ConsultationForm } from "@/components/leads/consultation-form";
import { WhatsAppButton } from "@/components/property/listing-actions";

export const metadata: Metadata = {
  title: "Contact us",
  description: "Speak to a Nexora property advisor about buying, renting, selling or investing in Dubai.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  const { contact } = siteConfig;
  return (
    <>
      <PageIntro
        title="Contact us"
        intro="Tell us what you are looking for and an advisor will come back to you the way you prefer — by WhatsApp, phone or email."
      />
      <div className="container-page grid gap-12 py-14 lg:grid-cols-12 lg:py-20">
        <aside className="lg:col-span-4" aria-label="Contact details">
          <ul className="space-y-6 text-[15.5px]">
            <li className="flex gap-4">
              <Phone className="mt-1 size-5 shrink-0 text-gold-deep" aria-hidden />
              <div>
                <p className="text-[12.5px] text-slate">Phone</p>
                <a href={contact.phoneHref} className="text-navy hover:text-gold-deep">
                  {contact.phoneDisplay}
                </a>
              </div>
            </li>
            <li className="flex gap-4">
              <Mail className="mt-1 size-5 shrink-0 text-gold-deep" aria-hidden />
              <div>
                <p className="text-[12.5px] text-slate">Email</p>
                <a href={`mailto:${contact.email}`} className="break-all text-navy hover:text-gold-deep">
                  {contact.email}
                </a>
              </div>
            </li>
            <li className="flex gap-4">
              <MapPin className="mt-1 size-5 shrink-0 text-gold-deep" aria-hidden />
              <div>
                <p className="text-[12.5px] text-slate">Office</p>
                <p className="text-navy">{contact.addressLines.join(", ")}</p>
              </div>
            </li>
            <li className="flex gap-4">
              <Clock className="mt-1 size-5 shrink-0 text-gold-deep" aria-hidden />
              <div>
                <p className="text-[12.5px] text-slate">Hours</p>
                <p className="text-navy">{contact.hours}</p>
              </div>
            </li>
          </ul>
          <div className="mt-8 max-w-xs">
            <WhatsAppButton message="Hello, I'd like to speak to a Nexora property advisor." />
          </div>
        </aside>
        <section id="advisor" aria-labelledby="contact-form-title" className="scroll-mt-24 rounded-md bg-white p-6 shadow-panel sm:p-10 lg:col-span-8">
          <h2 id="contact-form-title" className="serif text-[30px] text-navy">
            Speak to an advisor
          </h2>
          <p className="mt-2 mb-8 text-[15px] text-slate">There is no obligation, and your details are used only to respond to you.</p>
          <ConsultationForm idPrefix="contact" source="contact_form" showMessage submitLabel="Send message" />
        </section>
      </div>
    </>
  );
}
