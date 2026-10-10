import Link from "next/link";
import type { Property } from "@/lib/domain/types";
import { propertyTypeLabels } from "@/lib/domain/labels";
import { getCommunityName } from "@/lib/content/communities";
import { formatAED } from "@/lib/utils";
import { isDemoMode } from "@/config/site";

function Missing({ children }: { children: React.ReactNode }) {
  return <span className="text-ivory/45">{children}</span>;
}

function handoverText(p: Property) {
  const h = p.offPlan?.handover;
  if (!h) return <Missing>Not supplied</Missing>;
  if (!h.verified) return <Missing>Awaiting verification</Missing>;
  return h.label;
}

function yieldText(p: Property) {
  if (!p.rentalYield) return <Missing>Not published</Missing>;
  return (
    <span>
      {p.rentalYield.grossPercent.toFixed(1)}% gross
      <span className="block text-[12px] text-ivory/55">
        {p.rentalYield.source}, {p.rentalYield.asOf}
      </span>
    </span>
  );
}

/**
 * Investor-facing ledger of off-plan opportunities. Shows only what has been supplied or verified:
 * handover dates appear once verified, yields only with a cited source.
 */
export function InvestmentLedger({ properties }: { properties: Property[] }) {
  return (
    <div>
      {/* Desktop table */}
      <div className="relative hidden overflow-x-auto lg:block">
        <table className="w-full border-collapse text-left text-[14.5px]">
          <caption className="sr-only">Off-plan investment opportunities</caption>
          <thead>
            <tr className="border-b border-gold/40 text-[12.5px] text-ivory/60">
              <th scope="col" className="py-3 pr-6 font-medium">
                Project
              </th>
              <th scope="col" className="py-3 pr-6 font-medium">
                Category
              </th>
              <th scope="col" className="py-3 pr-6 font-medium">
                Entry price
              </th>
              <th scope="col" className="py-3 pr-6 font-medium">
                Payment plan
              </th>
              <th scope="col" className="py-3 pr-6 font-medium">
                Handover
              </th>
              <th scope="col" className="py-3 pr-6 font-medium">
                Rental yield
              </th>
              <th scope="col" className="py-3 font-medium">
                <span className="sr-only">Details</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {properties.map((p) => (
              <tr key={p.id} className="group border-b border-white/10 align-top transition-colors hover:bg-white/[0.03]">
                <th scope="row" className="py-5 pr-6 font-normal">
                  <span className="serif block text-[19px] leading-snug text-ivory">{p.offPlan?.projectName ?? p.title}</span>
                  <span className="mt-1 block text-[13px] text-ivory/60">
                    {getCommunityName(p.communitySlug)}
                    {p.offPlan?.developer ? `, by ${p.offPlan.developer}` : ""}
                  </span>
                </th>
                <td className="py-5 pr-6 text-ivory/85">
                  Off-plan {propertyTypeLabels[p.type].toLowerCase()}
                  <span className="block text-[13px] text-ivory/55">
                    {p.bedrooms === 0 ? "Studios" : `${p.bedrooms}-bedroom`} from {p.areaSqft.toLocaleString("en")} sq ft
                  </span>
                </td>
                <td className="tabular py-5 pr-6 font-semibold whitespace-nowrap text-ivory">{formatAED(p.price)}</td>
                <td className="max-w-[260px] py-5 pr-6 text-[13.5px] leading-relaxed text-ivory/80">
                  {p.offPlan?.paymentPlan ?? <Missing>Not supplied</Missing>}
                </td>
                <td className="py-5 pr-6 whitespace-nowrap text-ivory/85">{handoverText(p)}</td>
                <td className="py-5 pr-6 text-ivory/85">{yieldText(p)}</td>
                <td className="py-5 text-right">
                  <Link
                    href={`/properties/${p.slug}`}
                    className="inline-flex text-[13.5px] font-semibold whitespace-nowrap text-gold underline decoration-gold/40 underline-offset-4 hover:decoration-gold"
                  >
                    View details<span className="sr-only"> for {p.offPlan?.projectName ?? p.title}</span>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile: stacked entries */}
      <ul className="divide-y divide-white/10 border-y border-white/10 lg:hidden">
        {properties.map((p) => (
          <li key={p.id} className="py-5">
            <Link href={`/properties/${p.slug}`} className="serif text-[21px] leading-snug text-ivory underline decoration-gold/40 underline-offset-4">
              {p.offPlan?.projectName ?? p.title}
            </Link>
            <p className="mt-1 text-[13px] text-ivory/60">
              {getCommunityName(p.communitySlug)}, off-plan {propertyTypeLabels[p.type].toLowerCase()}
            </p>
            <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-[13.5px]">
              <div>
                <dt className="text-ivory/55">Entry price</dt>
                <dd className="tabular font-semibold text-ivory">{formatAED(p.price)}</dd>
              </div>
              <div>
                <dt className="text-ivory/55">Handover</dt>
                <dd className="text-ivory/85">{handoverText(p)}</dd>
              </div>
              <div className="col-span-2">
                <dt className="text-ivory/55">Payment plan</dt>
                <dd className="text-ivory/85">{p.offPlan?.paymentPlan ?? <Missing>Not supplied</Missing>}</dd>
              </div>
              <div className="col-span-2">
                <dt className="text-ivory/55">Rental yield</dt>
                <dd className="text-ivory/85">{yieldText(p)}</dd>
              </div>
            </dl>
          </li>
        ))}
      </ul>

      <div className="mt-8 grid gap-4 text-[13px] leading-relaxed text-ivory/60 md:grid-cols-2">
        <p>
          {isDemoMode ? "These are illustrative demonstration projects with illustrative prices and payment plans. " : ""}
          Entry prices are starting prices and depend on availability. Handover dates are shown only once verified with the developer, and rental yields only
          when backed by a cited data source.
        </p>
        <p>
          Property values and rents can fall as well as rise, and past performance is not a guide to future returns. Nothing here is financial advice. Before
          reserving an off-plan unit, confirm the project&rsquo;s registration and escrow account with the Dubai Land Department.
        </p>
      </div>
    </div>
  );
}
