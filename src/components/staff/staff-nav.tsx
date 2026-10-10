"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, LayoutDashboard, PlugZap, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const icons = { dashboard: LayoutDashboard, leads: Users, properties: Building2, integrations: PlugZap };

export interface NavItem {
  href: string;
  label: string;
  icon: keyof typeof icons;
  exact?: boolean;
}

export function StaffNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Platform" className="relative scrollbar-none overflow-x-auto px-3 pb-3 lg:px-3 lg:pb-0">
      <ul className="flex gap-1 lg:flex-col">
        {items.map((item) => {
          const Icon = icons[item.icon];
          const active = item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <li key={item.href}>
              <Link
                prefetch={false}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-sm px-3 py-2.5 text-[14px] whitespace-nowrap transition-colors",
                  active ? "bg-white/10 font-semibold text-ivory" : "text-ivory/70 hover:bg-white/5 hover:text-ivory",
                )}
              >
                <Icon className={cn("size-[18px]", active ? "text-gold" : "")} aria-hidden strokeWidth={1.6} />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
