import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Plus } from "lucide-react";
import { requireStaff } from "@/lib/auth/guard";
import { can, canEditProperty } from "@/lib/auth/permissions";
import { getStore } from "@/lib/data";
import { LISTING_STATUSES, type ListingStatus } from "@/lib/domain/types";
import { categoryLabels, listingStatusLabels } from "@/lib/domain/labels";
import { getCommunityName } from "@/lib/content/communities";
import { formatAED, formatDate } from "@/lib/utils";
import { StaffPageHeader } from "@/components/staff/staff-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Properties" };

type Props = { searchParams: Promise<Record<string, string | undefined>> };

export default async function AdminPropertiesPage({ searchParams }: Props) {
  const user = await requireStaff("/admin/properties");
  const sp = await searchParams;
  const status = LISTING_STATUSES.includes(sp.status as ListingStatus) ? (sp.status as ListingStatus) : undefined;
  const published = sp.published === "yes" ? true : sp.published === "no" ? false : undefined;
  const mine = sp.mine === "1" && user.agentId ? user.agentId : undefined;
  const q = sp.q?.trim().slice(0, 80) || undefined;

  const store = getStore();
  const [list, agents] = await Promise.all([store.properties.listForAdmin({ status, published, agentId: mine, q }), store.agents.list()]);
  const agentName = new Map(agents.map((a) => [a.id, a.name]));

  return (
    <>
      <StaffPageHeader
        title="Properties"
        description={
          can(user, "properties:edit_any")
            ? "Create and edit listings, manage photos and pricing, assign agents and control what is published."
            : "Create listings and edit the ones assigned to you. An administrator reviews and publishes them."
        }
        demo={list.some((p) => p.isDemo)}
        actions={
          <Button asChild>
            <Link prefetch={false} href="/admin/properties/new">
              <Plus className="size-4" aria-hidden /> New listing
            </Link>
          </Button>
        }
      />

      <form method="get" className="mb-5 flex flex-wrap items-end gap-3" aria-label="Filter listings">
        <div className="flex min-w-[220px] flex-1 flex-col gap-1">
          <label htmlFor="prop-q" className="text-[12px] font-medium text-slate">
            Search
          </label>
          <input
            id="prop-q"
            name="q"
            defaultValue={q}
            placeholder="Title or reference"
            className="h-10 rounded-sm border border-line-strong bg-white px-3 text-[14px]"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="prop-status" className="text-[12px] font-medium text-slate">
            Status
          </label>
          <select id="prop-status" name="status" defaultValue={status ?? ""} className="h-10 rounded-sm border border-line-strong bg-white px-3 text-[14px]">
            <option value="">Any status</option>
            {LISTING_STATUSES.map((s) => (
              <option key={s} value={s}>
                {listingStatusLabels[s]}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="prop-pub" className="text-[12px] font-medium text-slate">
            Visibility
          </label>
          <select
            id="prop-pub"
            name="published"
            defaultValue={sp.published ?? ""}
            className="h-10 rounded-sm border border-line-strong bg-white px-3 text-[14px]"
          >
            <option value="">Published and drafts</option>
            <option value="yes">Published</option>
            <option value="no">Drafts</option>
          </select>
        </div>
        {user.agentId ? (
          <label className="flex h-10 items-center gap-2 text-[13.5px] text-navy-700">
            <input type="checkbox" name="mine" value="1" defaultChecked={Boolean(mine)} className="size-4 accent-navy" /> Only mine
          </label>
        ) : null}
        <Button type="submit" size="sm" className="h-10">
          Apply
        </Button>
      </form>

      <p className="mb-3 text-[13px] text-slate">
        {list.length} {list.length === 1 ? "listing" : "listings"}
      </p>
      <div className="relative overflow-x-auto rounded-md border border-line bg-white">
        <table className="w-full min-w-[960px] border-collapse text-left text-[13.5px]">
          <thead>
            <tr className="border-b border-line bg-mist/70 text-[12px] text-slate">
              <th scope="col" className="px-4 py-2.5 font-medium">
                Listing
              </th>
              <th scope="col" className="px-3 py-2.5 font-medium">
                Category
              </th>
              <th scope="col" className="px-3 py-2.5 text-right font-medium">
                Price (AED)
              </th>
              <th scope="col" className="px-3 py-2.5 font-medium">
                Status
              </th>
              <th scope="col" className="px-3 py-2.5 font-medium">
                Website
              </th>
              <th scope="col" className="px-3 py-2.5 font-medium">
                Agent
              </th>
              <th scope="col" className="px-3 py-2.5 font-medium">
                Updated
              </th>
              <th scope="col" className="px-4 py-2.5 font-medium">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {list.map((p) => {
              const editable = canEditProperty(user, p);
              return (
                <tr key={p.id} className="border-b border-line last:border-b-0 hover:bg-mist/50">
                  <th scope="row" className="px-4 py-3 font-normal">
                    <div className="flex items-center gap-3">
                      <div className="relative h-11 w-16 shrink-0 overflow-hidden rounded-xs bg-mist">
                        {p.images[0] ? <Image src={p.images[0].src} alt="" fill sizes="64px" className="object-cover" /> : null}
                      </div>
                      <div className="min-w-0">
                        <Link prefetch={false} href={`/admin/properties/${p.id}`} className="line-clamp-1 font-semibold text-navy hover:underline">
                          {p.title}
                        </Link>
                        <span className="block text-[12px] text-slate">
                          <span className="tabular">{p.ref}</span>, {getCommunityName(p.communitySlug)}
                          {p.isDemo ? <span className="ml-1.5 text-gold-deep">Demo</span> : null}
                        </span>
                      </div>
                    </div>
                  </th>
                  <td className="px-3 py-3 text-navy-700">
                    {p.segment === "commercial" ? "Commercial, " : ""}
                    {categoryLabels[p.category].toLowerCase()}
                  </td>
                  <td className="tabular px-3 py-3 text-right">{formatAED(p.price).replace("AED ", "")}</td>
                  <td className="px-3 py-3">
                    <Badge tone={p.status === "available" ? "success" : p.status === "under_offer" ? "warning" : "neutral"}>
                      {listingStatusLabels[p.status]}
                    </Badge>
                  </td>
                  <td className="px-3 py-3">{p.published ? <Badge tone="info">Published</Badge> : <Badge tone="outline">Draft</Badge>}</td>
                  <td className="px-3 py-3 text-navy-700">{p.agentId ? agentName.get(p.agentId) : <span className="text-slate">Unassigned</span>}</td>
                  <td className="tabular px-3 py-3 whitespace-nowrap text-navy-700">{formatDate(p.updatedAt)}</td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <Link prefetch={false} href={`/admin/properties/${p.id}`} className="text-[13px] font-semibold text-info hover:underline">
                      {editable ? "Edit" : "View"}
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
