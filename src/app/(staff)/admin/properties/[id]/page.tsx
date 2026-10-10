import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { requireStaff } from "@/lib/auth/guard";
import { can, canEditProperty } from "@/lib/auth/permissions";
import { getStore } from "@/lib/data";
import { formatDateTime } from "@/lib/utils";
import { StaffPageHeader } from "@/components/staff/staff-shell";
import { PropertyForm } from "@/components/staff/property-form";
import { PhotoManager, PublishToggle } from "@/components/staff/photo-manager";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = { title: "Edit listing" };

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ created?: string }> };

export default async function EditPropertyPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { created } = await searchParams;
  const user = await requireStaff(`/admin/properties/${id}`);
  const store = getStore();
  const [property, agents] = await Promise.all([store.properties.getById(id), store.agents.list()]);
  if (!property) notFound();
  const editable = canEditProperty(user, property);
  const isAdmin = can(user, "properties:edit_any");

  return (
    <>
      <Link prefetch={false} href="/admin/properties" className="mb-5 inline-flex items-center gap-1.5 text-[13px] font-medium text-slate hover:text-navy">
        <ArrowLeft className="size-4" aria-hidden /> All properties
      </Link>
      <StaffPageHeader
        title={property.title}
        description={`${property.ref}, last updated ${formatDateTime(property.updatedAt)}`}
        demo={property.isDemo}
        actions={
          <div className="flex flex-wrap items-start gap-3">
            {property.published ? (
              <Link
                prefetch={false}
                href={`/properties/${property.slug}`}
                target="_blank"
                className="inline-flex h-11 items-center gap-2 rounded-sm border border-line-strong bg-white px-4 text-sm font-medium text-navy hover:border-navy"
              >
                View on website <ExternalLink className="size-3.5" aria-hidden />
              </Link>
            ) : (
              <Badge tone="outline" className="h-11 px-3 text-[13px]">
                Draft, not on the website
              </Badge>
            )}
            {can(user, "properties:publish") ? (
              <PublishToggle propertyId={property.id} published={property.published} hasPhotos={property.images.length > 0} />
            ) : null}
          </div>
        }
      />
      {created ? (
        <p role="status" className="mb-6 rounded-sm bg-success-soft px-4 py-3 text-[14px] text-success">
          Listing created as a draft. Add photos below{isAdmin ? ", then publish it" : "; an administrator will publish it"}.
        </p>
      ) : null}
      {!editable ? (
        <p className="mb-6 rounded-sm border border-line bg-white px-4 py-3 text-[14px] text-navy-700">
          This listing is assigned to another agent, so it is read-only for you.
        </p>
      ) : null}

      <div className="flex max-w-4xl flex-col gap-6">
        <PhotoManager propertyId={property.id} images={property.images} canEdit={editable} />
        {editable ? <PropertyForm property={property} agents={agents} isAdmin={isAdmin} /> : null}
      </div>
    </>
  );
}
