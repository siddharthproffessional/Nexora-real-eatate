import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireStaff } from "@/lib/auth/guard";
import { can } from "@/lib/auth/permissions";
import { getStore } from "@/lib/data";
import { StaffPageHeader } from "@/components/staff/staff-shell";
import { PropertyForm } from "@/components/staff/property-form";

export const metadata: Metadata = { title: "New listing" };

export default async function NewPropertyPage() {
  const user = await requireStaff("/admin/properties/new");
  const agents = await getStore().agents.list();
  return (
    <>
      <Link prefetch={false} href="/admin/properties" className="mb-5 inline-flex items-center gap-1.5 text-[13px] font-medium text-slate hover:text-navy">
        <ArrowLeft className="size-4" aria-hidden /> All properties
      </Link>
      <StaffPageHeader title="New listing" description="Save the details first; you can add photos on the next screen." />
      <div className="max-w-4xl">
        <PropertyForm agents={agents} isAdmin={can(user, "properties:edit_any")} />
      </div>
    </>
  );
}
