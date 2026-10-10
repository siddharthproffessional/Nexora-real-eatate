import type { Metadata } from "next";
import { siteConfig, isDemoMode } from "@/config/site";
import { PageIntro } from "@/components/site/page-intro";

export const metadata: Metadata = {
  title: "Terms of use",
  description: "Terms governing the use of the Nexora Realty website.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <>
      <PageIntro title="Terms of use" intro="The terms that apply when you use this website." />
      <div className="container-page max-w-[760px] py-14">
        <p role="note" className="rounded-sm border border-dashed border-gold-deep/60 bg-white p-4 text-[14px] leading-relaxed text-navy-700">
          <strong>Placeholder terms.</strong> To be drafted and reviewed by legal counsel before launch.
        </p>
        <div className="prose-editorial text-[16px]">
          <h2>Information on this site</h2>
          <p>
            Property details, prices and availability are provided for general information and may change. They do not form part of any offer or contract.
            {isDemoMode
              ? " During the current demonstration phase, all listings, prices and projects shown are illustrative and are not available to buy or rent."
              : ""}
          </p>
          <h2>No advice</h2>
          <p>
            Articles, guides and figures on this site are general information. They are not legal, tax, mortgage or financial advice. Take independent advice
            before making decisions.
          </p>
          <h2>Investment risk</h2>
          <p>
            Property values and rental income can go down as well as up. We do not guarantee any return, yield, handover date or resale value. Off-plan
            purchases carry construction and delivery risk.
          </p>
          <h2>Acceptable use</h2>
          <p>Do not misuse the site, attempt to access internal systems, or submit false information through our forms.</p>
          <h2>Contact</h2>
          <p>Questions about these terms: {siteConfig.contact.email}.</p>
        </div>
      </div>
    </>
  );
}
