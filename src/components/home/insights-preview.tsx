import Image from "next/image";
import Link from "next/link";
import { articles, readingMinutes } from "@/lib/content/articles";
import { formatDate } from "@/lib/utils";

export function InsightsPreview() {
  const [lead, ...rest] = articles;
  if (!lead) return null;
  return (
    <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
      <article className="group relative lg:col-span-7">
        <div className="relative aspect-[16/10] overflow-hidden rounded-xs bg-navy-800">
          <Image
            src={lead.photo.src}
            alt={lead.photo.alt}
            fill
            sizes="(min-width: 1024px) 720px, 92vw"
            className="object-cover transition-transform duration-700 group-hover:scale-[1.02]"
          />
        </div>
        <p className="mt-5 text-[13px] font-medium text-gold-deep">{lead.category}</p>
        <h3 className="serif mt-2 text-[28px] leading-tight text-navy sm:text-[32px]">
          <Link href={`/insights/${lead.slug}`} className="after:absolute after:inset-0">
            {lead.title}
          </Link>
        </h3>
        <p className="mt-3 max-w-[60ch] text-[15.5px] leading-relaxed text-slate">{lead.excerpt}</p>
        <p className="mt-3 text-[13px] text-slate">
          {formatDate(lead.publishedAt)}, {readingMinutes(lead)} min read
        </p>
      </article>
      <ul className="flex flex-col lg:col-span-5">
        {rest.map((a) => (
          <li key={a.slug} className="group relative border-t border-line py-5 first:border-t-0 first:pt-0 lg:first:border-t lg:first:pt-5">
            <p className="text-[12.5px] font-medium text-gold-deep">{a.category}</p>
            <h3 className="serif mt-1.5 text-[21px] leading-snug text-navy group-hover:text-navy-700">
              <Link href={`/insights/${a.slug}`} className="after:absolute after:inset-0">
                {a.title}
              </Link>
            </h3>
            <p className="mt-1.5 text-[13px] text-slate">
              {formatDate(a.publishedAt)}, {readingMinutes(a)} min read
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
