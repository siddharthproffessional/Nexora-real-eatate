import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { articles, readingMinutes } from "@/lib/content/articles";
import { formatDate } from "@/lib/utils";
import { PageIntro } from "@/components/site/page-intro";

export const metadata: Metadata = {
  title: "Market insights",
  description: "Guides and commentary on buying, renting and investing in Dubai property.",
  alternates: { canonical: "/insights" },
};

export default function InsightsPage() {
  return (
    <>
      <PageIntro
        title="Market insights"
        intro={
          <>
            Guides for buyers, tenants, owners and investors. This is editorial information to help you ask better questions — it is not legal, tax or financial
            advice.
          </>
        }
      />
      <div className="container-page py-14 lg:py-20">
        <ul className="grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((a, i) => (
            <li key={a.slug} className="group relative">
              <div className="relative aspect-[3/2] overflow-hidden rounded-xs bg-navy-800">
                <Image
                  src={a.photo.src}
                  alt={a.photo.alt}
                  fill
                  priority={i < 3}
                  sizes="(min-width: 1024px) 400px, (min-width: 640px) 45vw, 92vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                />
              </div>
              <p className="mt-5 text-[13px] font-medium text-gold-deep">{a.category}</p>
              <h2 className="serif mt-1.5 text-[24px] leading-snug text-navy">
                <Link href={`/insights/${a.slug}`} className="after:absolute after:inset-0">
                  {a.title}
                </Link>
              </h2>
              <p className="mt-2 text-[15px] leading-relaxed text-slate">{a.excerpt}</p>
              <p className="mt-3 text-[13px] text-slate">
                {formatDate(a.publishedAt)}, {readingMinutes(a)} min read
              </p>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
