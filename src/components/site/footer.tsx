import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { footerNav, isDemoMode, siteConfig } from "@/config/site";

export function SiteFooter() {
  const { regulatory } = siteConfig;
  const hasLicences = Boolean(regulatory.reraOrn || regulatory.dedTradeLicence);
  const year = new Date().getFullYear();

  return (
    <footer className="on-dark bg-navy text-ivory/80">
      <div className="container-page grid gap-12 pt-16 pb-10 sm:grid-cols-2 lg:grid-cols-12">
        <div className="sm:col-span-2 lg:col-span-4">
          <Logo tone="light" />
          <p className="mt-5 max-w-sm text-[15px] leading-relaxed text-ivory/70">
            Property advisory for buyers, tenants, landlords and investors across Dubai — with a dedicated desk for clients in India.
          </p>
          <ul className="mt-6 space-y-2.5 text-[14px]">
            <li>
              <a href={siteConfig.contact.phoneHref} className="inline-flex items-center gap-2.5 hover:text-ivory">
                <Phone className="size-4 text-gold" aria-hidden /> {siteConfig.contact.phoneDisplay}
              </a>
            </li>
            <li>
              <a href={`mailto:${siteConfig.contact.email}`} className="inline-flex items-center gap-2.5 hover:text-ivory">
                <Mail className="size-4 text-gold" aria-hidden /> {siteConfig.contact.email}
              </a>
            </li>
            <li className="inline-flex items-start gap-2.5">
              <MapPin className="mt-0.5 size-4 shrink-0 text-gold" aria-hidden />
              <span>{siteConfig.contact.addressLines.join(", ")}</span>
            </li>
          </ul>
        </div>

        <nav aria-label="Explore" className="lg:col-span-2 lg:col-start-6">
          <h2 className="text-[13px] font-semibold text-ivory">Explore</h2>
          <ul className="mt-4 space-y-2.5 text-[14px]">
            {footerNav.explore.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="hover:text-ivory">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-label="Company" className="lg:col-span-2">
          <h2 className="text-[13px] font-semibold text-ivory">Company</h2>
          <ul className="mt-4 space-y-2.5 text-[14px]">
            {footerNav.company.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="hover:text-ivory">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="sm:col-span-2 lg:col-span-3">
          <h2 className="text-[13px] font-semibold text-ivory">Regulatory information</h2>
          {hasLicences ? (
            <dl className="mt-4 space-y-2 text-[14px]">
              {regulatory.reraOrn ? (
                <div>
                  <dt className="inline text-ivory/60">RERA ORN: </dt>
                  <dd className="inline">{regulatory.reraOrn}</dd>
                </div>
              ) : null}
              {regulatory.dedTradeLicence ? (
                <div>
                  <dt className="inline text-ivory/60">Trade licence: </dt>
                  <dd className="inline">{regulatory.dedTradeLicence}</dd>
                </div>
              ) : null}
            </dl>
          ) : (
            <p className="mt-4 text-[13.5px] leading-relaxed text-ivory/65">
              Licence details, including the RERA Office Registration Number and trade licence, will be published here once issued.
              {isDemoMode ? " This demonstration site does not represent a licensed brokerage and does not offer property for sale or rent." : ""}
            </p>
          )}
          <ul className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-[13.5px]">
            {siteConfig.social
              .filter((s) => s.href)
              .map((s) => (
                <li key={s.label}>
                  <a href={s.href!} rel="noopener noreferrer" target="_blank" className="hover:text-ivory">
                    {s.label}
                  </a>
                </li>
              ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-page flex flex-col gap-3 py-6 text-[12.5px] text-ivory/55 md:flex-row md:items-center md:justify-between">
          <p>
            © {year} {siteConfig.legalName ?? siteConfig.name}. Information on this site is for general guidance and is not legal, tax or financial advice.
          </p>
          <ul className="flex flex-wrap gap-x-5 gap-y-1">
            {footerNav.legal.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="hover:text-ivory">
                  {l.label}
                </Link>
              </li>
            ))}
            {isDemoMode ? <li>Photography: Unsplash contributors</li> : null}
          </ul>
        </div>
      </div>
    </footer>
  );
}
