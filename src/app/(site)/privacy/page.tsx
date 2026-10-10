import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { PageIntro } from "@/components/site/page-intro";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: "How Nexora Realty collects, uses and protects personal information.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <>
      <PageIntro title="Privacy policy" intro="How we collect, use and protect your personal information." />
      <div className="container-page max-w-[760px] py-14">
        <p role="note" className="rounded-sm border border-dashed border-gold-deep/60 bg-white p-4 text-[14px] leading-relaxed text-navy-700">
          <strong>Placeholder policy.</strong> This draft describes how the website and platform currently handle data. It must be reviewed by legal counsel
          against the UAE Personal Data Protection Law (Federal Decree-Law No. 45 of 2021) and any other applicable rules before launch.
        </p>
        <div className="prose-editorial text-[16px]">
          <h2>Who we are</h2>
          <p>
            {siteConfig.legalName ?? siteConfig.name} (&ldquo;we&rdquo;) operates this website. Contact: {siteConfig.contact.email}. Registered company details
            will be added once confirmed.
          </p>
          <h2>What we collect</h2>
          <ul>
            <li>Details you give us in a form: name, email, phone number, preferred contact method, and what you are looking for.</li>
            <li>Details about a property you ask about or want to sell or lease.</li>
            <li>Campaign information from the link you arrived through (for example, UTM tags), so we know which channels are useful.</li>
            <li>Basic technical logs needed to run and secure the site, such as IP addresses used for rate limiting.</li>
          </ul>
          <p>Saved properties are stored only in your own browser and are not sent to us unless you submit an inquiry.</p>
          <h2>How we use it</h2>
          <ul>
            <li>To respond to your inquiry and provide the property services you ask for.</li>
            <li>To send market updates and new listings, only if you opt in. You can unsubscribe at any time.</li>
            <li>To keep the site secure and prevent spam.</li>
          </ul>
          <h2>Who we share it with</h2>
          <p>
            Our advisors, and service providers that host the site and database or deliver our emails and messages, under agreements that restrict their use of
            your data. We do not sell personal information. We share details with a property owner, developer or another agent only with your agreement.
          </p>
          <h2>How long we keep it</h2>
          <p>Inquiry records are kept for as long as needed to provide our services and meet legal obligations. Retention periods will be confirmed here.</p>
          <h2>Your choices</h2>
          <p>You can ask to access, correct or delete your personal information, or withdraw consent to marketing, by emailing {siteConfig.contact.email}.</p>
          <h2>Security</h2>
          <p>Data is sent over encrypted connections, access to our internal systems is restricted by role, and staff accounts are protected by sign-in.</p>
        </div>
      </div>
    </>
  );
}
