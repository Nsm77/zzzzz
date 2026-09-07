import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { articles } from "@/db/schema";
import { Breadcrumbs } from "@/components/ui/primitives";
import { Reveal } from "@/components/motion/reveal";
import { formatDate } from "@/lib/utils";
import { SITE_URL } from "@/lib/env";
export const dynamic = "force-dynamic";
async function get(slug: string) { return db.query.articles.findFirst({ where: and(eq(articles.slug, slug), eq(articles.isPublished, true)) }); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const a = await get((await params).slug);
  return a ? { title: a.title, description: a.excerpt ?? undefined, openGraph: { type: "article", title: a.title, description: a.excerpt ?? undefined, images: a.image ? [a.image] : [], publishedTime: a.publishedAt.toISOString() }, twitter: { card: "summary_large_image" } } : {};
}
export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const a = await get((await params).slug);
  if (!a) notFound();
  const ld = { "@context": "https://schema.org", "@type": "Article", headline: a.title, image: a.image ? [`${SITE_URL}${a.image}`] : [], datePublished: a.publishedAt.toISOString(), author: { "@type": "Organization", name: "Cléopâtre — Espace Santé Beauté" } };
  return (
    <article className="container-lux py-10 lg:py-14">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <Breadcrumbs items={[{ href: "/journal", label: "Journal" }, { label: a.title }]} />
      <header className="mx-auto mt-8 max-w-3xl text-center"><p className="eyebrow mb-4">{a.tag} · {a.readMinutes} min de lecture</p><Reveal as="h1" className="font-display text-display-lg text-ink">{a.title}</Reveal><p className="mt-4 text-sm text-muted">{formatDate(a.publishedAt)}</p></header>
      {a.image && <Reveal className="relative mx-auto mt-10 aspect-[16/9] max-w-5xl overflow-hidden bg-stone" delay={0.1} y={0}><Image src={a.image} alt="" fill priority sizes="(max-width:1280px) 100vw, 1024px" className="object-cover" /></Reveal>}
      <div className="mx-auto mt-12 max-w-2xl space-y-6 text-[17px] leading-[1.75] text-charcoal">{a.body.split("\n\n").map((p, i) => <p key={i}>{p}</p>)}</div>
    </article>
  );
}
