import Link from "next/link";
import { BreadcrumbJsonLd } from "@/components/seo/json-ld";

export function Breadcrumbs({ items }: { items: { name: string; path: string }[] }) {
  return (
    <>
      <nav aria-label="Breadcrumb">
        <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-slate">
          {items.map((item, i) => {
            const last = i === items.length - 1;
            return (
              <li key={item.path} className="flex items-center gap-2">
                {last ? (
                  <span aria-current="page" className="text-navy-700">
                    {item.name}
                  </span>
                ) : (
                  <>
                    <Link href={item.path} className="hover:text-navy">
                      {item.name}
                    </Link>
                    <span aria-hidden className="text-line-strong">
                      /
                    </span>
                  </>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
      <BreadcrumbJsonLd items={items} />
    </>
  );
}
