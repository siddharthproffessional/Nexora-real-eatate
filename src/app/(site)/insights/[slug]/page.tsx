import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { articles, getArticle, readingMinutes } from "@/lib/content/articles";
import { formatDate } from "@/lib/utils";
import { siteConfig } from "@/config/site";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { Button } from "@/components/ui/button";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return articles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const a = getArticle(slug);
  if (!a) return { title: "Article not found" };
  return {
    title: a.title,
    description: a.excerpt,
    alternates: { canonical: `/insights/${a.slug}` },
    openGraph: {
      type: "article",
      publishedTime: a.publishedAt,
      images: [{ url: `${a.photo.src}?auto=format&fit=crop&w=1200&h=630&q=75`, width: 1200, height: 630, alt: a.photo.alt }],
    },
  };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();
  const others = articles.filter((a) => a.slug !== slug).slice(0, 3);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt,
    datePublished: article.publishedAt,
    author: { "@type": "Organization", name: siteConfig.name },
    publisher: { "@type": "Organization", name: siteConfig.name },
    image: `${article.photo.src}?auto=format&fit=crop&w=1200&q=75`,
  };

  return (
    <article>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <div className="container-page max-w-[880px] pt-10">
        <Breadcrumbs
          items={[
            { name: "Home", path: "/" },
            { name: "Market insights", path: "/insights" },
            { name: article.category, path: `/insights/${article.slug}` },
          ]}
        />
        <h1 className="display mt-8 text-[2.3rem] sm:text-[3.2rem]">{article.title}</h1>
        <p className="mt-5 text-[18px] leading-relaxed text-slate">{article.excerpt}</p>
        <p className="mt-5 text-[13.5px] text-slate">
          {article.author}, {formatDate(article.publishedAt)}, {readingMinutes(article)} min read
        </p>
      </div>
      <div className="container-page mt-10 max-w-[1100px]">
        <div className="relative aspect-[16/8] overflow-hidden rounded-xs bg-navy-800">
          <Image src={article.photo.src} alt={article.photo.alt} fill priority sizes="(min-width: 1100px) 1100px, 100vw" className="object-cover" />
        </div>
        <p className="mt-2 text-right text-[12px] text-slate">Photo: {article.photo.credit}</p>
      </div>
      <div className="container-page max-w-[720px] pb-16">
        <div className="prose-editorial text-[17px]">
          {article.body.map((block, i) =>
            block.type === "h2" ? (
              <h2 key={i}>{block.text}</h2>
            ) : block.type === "ul" ? (
              <ul key={i}>
                {block.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : (
              <p key={i}>{block.text}</p>
            ),
          )}
        </div>
        <aside className="mt-12 rounded-sm border border-line bg-white p-5 text-[13.5px] leading-relaxed text-slate">
          <p className="font-semibold text-navy">Sources and limitations</p>
          <p className="mt-1">{article.sourcesNote}</p>
          <p className="mt-2">This article is general information, not legal, tax or financial advice.</p>
        </aside>
        <div className="mt-10 flex flex-wrap items-center gap-4">
          <Button asChild>
            <Link href="/contact#advisor">Speak to an advisor</Link>
          </Button>
          <Link href="/insights" className="text-[14.5px] font-semibold text-navy underline decoration-gold-deep/50 underline-offset-4">
            More insights
          </Link>
        </div>
      </div>
      <section aria-labelledby="more-title" className="border-t border-line bg-ivory-200/60 py-14">
        <div className="container-page">
          <h2 id="more-title" className="serif text-[26px] text-navy">
            Keep reading
          </h2>
          <ul className="mt-8 grid gap-8 md:grid-cols-3">
            {others.map((a) => (
              <li key={a.slug} className="group relative border-t border-line-strong pt-4">
                <p className="text-[12.5px] font-medium text-gold-deep">{a.category}</p>
                <h3 className="serif mt-1.5 text-[20px] leading-snug text-navy">
                  <Link href={`/insights/${a.slug}`} className="after:absolute after:inset-0">
                    {a.title}
                  </Link>
                </h3>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </article>
  );
}
