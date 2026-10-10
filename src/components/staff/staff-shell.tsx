import Link from "next/link";
import { ExternalLink, LogOut } from "lucide-react";
import type { StaffUser } from "@/lib/domain/types";
import { can, roleLabels } from "@/lib/auth/permissions";
import { initials } from "@/lib/utils";
import { LogoMark } from "@/components/brand/logo";
import { StaffNav, type NavItem } from "./staff-nav";

export function StaffShell({ user, children }: { user: StaffUser; children: React.ReactNode }) {
  const nav: NavItem[] = [
    { href: "/crm", label: "Dashboard", icon: "dashboard", exact: true },
    { href: "/crm/leads", label: "Leads", icon: "leads" },
    { href: "/admin/properties", label: "Properties", icon: "properties" },
    ...(can(user, "integrations:view") ? [{ href: "/crm/integrations", label: "Integrations", icon: "integrations" } as NavItem] : []),
  ];

  return (
    <div className="min-h-dvh bg-mist lg:grid lg:grid-cols-[248px_minmax(0,1fr)]">
      <a href="#staff-main" className="sr-only z-50 rounded-sm bg-navy px-4 py-2 text-ivory focus:not-sr-only focus:fixed focus:top-3 focus:left-3">
        Skip to content
      </a>
      <div className="on-dark bg-navy text-ivory">
        <aside className="flex flex-col lg:sticky lg:top-0 lg:h-dvh">
          <div className="flex items-center justify-between gap-3 px-5 py-4 lg:py-6">
            <Link prefetch={false} href="/crm" className="flex items-center gap-2.5 text-ivory">
              <LogoMark />
              <span className="flex flex-col leading-none">
                <span className="serif text-[17px] tracking-[0.2em]">NEXORA</span>
                <span className="mt-1 text-[10.5px] font-medium text-gold">Platform</span>
              </span>
            </Link>
            <Link prefetch={false} href="/" className="inline-flex items-center gap-1 text-[12.5px] text-ivory/60 hover:text-ivory lg:hidden">
              Website <ExternalLink className="size-3" aria-hidden />
            </Link>
          </div>
          <StaffNav items={nav} />
          <div className="mt-auto hidden border-t border-white/10 px-5 py-5 lg:block">
            <div className="flex items-center gap-3">
              <span className="flex size-9 items-center justify-center rounded-full bg-white/10 text-[13px] font-semibold text-gold">
                {initials(user.name)}
              </span>
              <div className="min-w-0">
                <p className="truncate text-[13.5px] font-semibold">{user.name}</p>
                <p className="text-[12px] text-ivory/60">{roleLabels[user.role]}</p>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <Link prefetch={false} href="/" className="inline-flex items-center gap-1.5 text-[12.5px] text-ivory/60 hover:text-ivory">
                View website <ExternalLink className="size-3" aria-hidden />
              </Link>
              <form action="/api/auth/logout" method="post">
                <button type="submit" className="inline-flex items-center gap-1.5 text-[12.5px] text-ivory/70 hover:text-ivory">
                  <LogOut className="size-3.5" aria-hidden /> Sign out
                </button>
              </form>
            </div>
          </div>
        </aside>
      </div>
      <div className="min-w-0">
        <div className="flex items-center justify-between border-b border-line bg-white px-4 py-2.5 text-[13px] lg:hidden">
          <span className="text-navy-700">
            {user.name} <span className="text-slate">({roleLabels[user.role]})</span>
          </span>
          <form action="/api/auth/logout" method="post">
            <button type="submit" className="inline-flex items-center gap-1.5 font-medium text-navy">
              <LogOut className="size-3.5" aria-hidden /> Sign out
            </button>
          </form>
        </div>
        <main id="staff-main" className="px-4 py-6 sm:px-8 lg:px-10 lg:py-9">
          {children}
        </main>
      </div>
    </div>
  );
}

export function StaffPageHeader({ title, description, actions, demo }: { title: string; description?: string; actions?: React.ReactNode; demo?: boolean }) {
  return (
    <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <h1 className="serif text-[30px] leading-tight text-navy sm:text-[34px]">{title}</h1>
        {description ? <p className="mt-1.5 max-w-[70ch] text-[14.5px] text-slate">{description}</p> : null}
        {demo ? (
          <p className="mt-3 inline-flex items-center gap-2 rounded-xs border border-dashed border-gold-deep/60 bg-white px-2.5 py-1 text-[12.5px] font-medium text-gold-deep">
            Includes illustrative demo data
          </p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}
