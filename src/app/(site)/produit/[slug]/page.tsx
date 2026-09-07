import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { wishlistItems } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { getProductBySlug, getRelated } from "@/lib/catalog";
import { SITE_URL } from "@/lib/env";
import { discountPercent, formatDT } from "@/lib/money";
import { formatDate } from "@/lib/utils";
import { Badge, Breadcrumbs } from "@/components/ui/primitives";
import { Stars } from "@/components/ui/stars";
import { Reveal } from "@/components/motion/reveal";
import { ProductGrid } from "@/components/catalog/product-card";
import { RecentlyViewed, TrackView } from "@/components/catalog/recently-viewed";
import { BuyBox } from "@/components/product/buy-box";
import { ReviewForm } from "@/components/product/review-form";
import { SectionHeading } from "@/components/ui/primitives";

export const dynamic = "force-dynamic";
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const p = await getProductBySlug((await params).slug);
  if (!p) return {};
  const title = `${p.name}${p.brand ? ` — ${p.brand.name}` : ""}`;
  return { title, description: p.shortDescription ?? undefined, openGraph: { title, description: p.shortDescription ?? undefined, images: p.image ? [p.image] : [], type: "website" }, twitter: { card: "summary_large_image", title, images: p.image ? [p.image] : [] } };
}

export default async function ProduitPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [p, user] = await Promise.all([getProductBySlug(slug), getCurrentUser()]);
  if (!p) notFound();
  const [related, wishedRow] = await Promise.all([
    getRelated(p.id, p.categoryId, p.universeId, 4),
    user ? db.select().from(wishlistItems).where(and(eq(wishlistItems.userId, user.id), eq(wishlistItems.productId, p.id))).limit(1) : Promise.resolve([]),
  ]);
  const pct = discountPercent(p.priceMillimes, p.compareAtMillimes);
  const jsonLd = {
    "@context": "https://schema.org", "@type": "Product", name: p.name, image: p.image ? [`${SITE_URL}${p.image}`] : [], description: p.shortDescription, sku: p.sku, brand: p.brand ? { "@type": "Brand", name: p.brand.name } : undefined,
    offers: { "@type": "Offer", url: `${SITE_URL}/produit/${p.slug}`, priceCurrency: "TND", price: (p.priceMillimes / 1000).toFixed(3), availability: p.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock", itemCondition: "https://schema.org/NewCondition" },
    aggregateRating: p.ratingCount > 0 ? { "@type": "AggregateRating", ratingValue: (p.ratingAvg / 100).toFixed(1), reviewCount: p.ratingCount } : undefined,
    review: p.reviews.slice(0, 5).map((r) => ({ "@type": "Review", author: { "@type": "Person", name: r.authorName }, reviewRating: { "@type": "Rating", ratingValue: r.rating }, reviewBody: r.body })),
  };
  const crumbs = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Accueil", item: SITE_URL }, ...(p.universe ? [{ "@type": "ListItem", position: 2, name: p.universe.name, item: `${SITE_URL}/univers/${p.universe.slug}` }] : []), { "@type": "ListItem", position: 3, name: p.name, item: `${SITE_URL}/produit/${p.slug}` }] };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(crumbs) }} />
      <TrackView id={p.id} />
      <div className="container-lux py-6 lg:py-10">
        <Breadcrumbs items={[...(p.universe ? [{ href: `/univers/${p.universe.slug}`, label: p.universe.name }] : []), ...(p.category ? [{ href: `/categorie/${p.category.slug}`, label: p.category.name }] : []), { label: p.name }]} />
        <div className="mt-6 grid gap-10 lg:grid-cols-12 lg:gap-16">
          {/* Gallery */}
          <div className="lg:col-span-7">
            <Reveal y={0} className="relative aspect-square overflow-hidden bg-stone lg:sticky lg:top-28">
              {p.image && <Image src={p.image} alt={p.name} fill priority sizes="(max-width:1024px) 100vw, 58vw" className="object-cover" />}
              <div className="absolute left-4 top-4 flex flex-col gap-1.5">{pct > 0 && <Badge tone="ink">-{pct} %</Badge>}{p.isNew && <Badge tone="accent">Nouveau</Badge>}</div>
            </Reveal>
          </div>
          {/* Info */}
          <div className="lg:col-span-5">
            {p.brand && <Link href={`/marque/${p.brand.slug}`} className="text-[11px] uppercase tracking-[0.2em] text-muted hover:text-ink">{p.brand.name}</Link>}
            <h1 className="mt-2 font-display text-display-md text-ink">{p.name}</h1>
            {p.volume && <p className="mt-1 text-sm text-muted-2">{p.volume} · Réf. {p.sku}</p>}
            {p.ratingCount > 0 && <a href="#avis" className="mt-3 inline-flex"><Stars value={p.ratingAvg / 100} count={p.ratingCount} size={14} /></a>}
            <div className="mt-6 flex items-baseline gap-3">
              <span className="text-2xl font-medium tabular-nums text-ink">{formatDT(p.priceMillimes)}</span>
              {pct > 0 && p.compareAtMillimes && <span className="text-sm tabular-nums text-muted-2 line-through">{formatDT(p.compareAtMillimes)}</span>}
            </div>
            <p className="mt-5 text-[15px] leading-relaxed text-charcoal">{p.shortDescription}</p>
            {p.concerns.length > 0 && <ul className="mt-5 flex flex-wrap gap-2">{p.concerns.map((c) => <li key={c.concernId}><Link href={`/besoin/${c.concern.slug}`} className="inline-flex min-h-9 items-center border border-stone-2 px-3 text-[11px] uppercase tracking-[0.14em] text-charcoal hover:border-ink">{c.concern.name}</Link></li>)}</ul>}
            <div className="mt-8"><BuyBox p={{ id: p.id, slug: p.slug, name: p.name, brandName: p.brand?.name ?? null, image: p.image, priceMillimes: p.priceMillimes, compareAtMillimes: p.compareAtMillimes, stock: p.stock, lowStockThreshold: p.lowStockThreshold, volume: p.volume }} wished={wishedRow.length > 0} isAuthed={!!user} /></div>
            <div className="mt-10 divide-y divide-stone border-y border-stone">
              {[["Description", p.description], ["Ingrédients", p.ingredients], ["Conseils d'utilisation", p.howToUse]].map(([t, body], i) => body ? (
                <details key={t} open={i === 0} className="group py-4"><summary className="flex min-h-11 cursor-pointer list-none items-center justify-between text-sm uppercase tracking-[0.14em] text-ink">{t}<span className="text-lg text-muted transition-transform duration-500 group-open:rotate-45">+</span></summary><p className="pb-2 pt-2 text-[15px] leading-relaxed text-charcoal">{body}</p></details>
              ) : null)}
            </div>
          </div>
        </div>
      </div>

      {/* Reviews */}
      <section id="avis" className="border-t border-stone bg-cream">
        <div className="container-lux grid gap-10 py-section-sm lg:grid-cols-12">
          <div className="lg:col-span-4"><p className="eyebrow mb-4">Avis clients</p><h2 className="font-display text-display-md text-ink">{p.ratingCount > 0 ? (p.ratingAvg / 100).toFixed(1) : "—"}<span className="text-lg text-muted">/5</span></h2>{p.ratingCount > 0 && <Stars value={p.ratingAvg / 100} count={p.ratingCount} size={16} className="mt-2" />}<p className="mt-4 text-sm text-muted">Avis vérifiés et modérés par notre équipe.</p></div>
          <div className="space-y-8 lg:col-span-8">
            {p.reviews.length === 0 ? <p className="text-sm text-muted">Aucun avis pour l&apos;instant. Soyez le premier à partager votre expérience.</p> : (
              <ul className="divide-y divide-stone">{p.reviews.map((r) => (
                <li key={r.id} className="py-5"><div className="flex items-center justify-between gap-4"><Stars value={r.rating} showCount={false} size={12} /><span className="text-xs text-muted-2">{formatDate(r.createdAt)}</span></div>{r.title && <p className="mt-2 text-[15px] text-ink">{r.title}</p>}<p className="mt-1 text-sm leading-relaxed text-charcoal">{r.body}</p><p className="mt-2 text-xs text-muted">{r.authorName}</p>{r.reply && <div className="mt-3 border-l-2 border-champagne bg-paper p-3 text-sm text-charcoal"><span className="eyebrow block mb-1">Réponse Cléopâtre</span>{r.reply}</div>}</li>
              ))}</ul>
            )}
            <ReviewForm productId={p.id} defaultName={user ? `${user.firstName} ${user.lastName[0]}.` : ""} />
          </div>
        </div>
      </section>

      {related.length > 0 && <section className="container-lux py-section-sm"><SectionHeading eyebrow="Complétez votre routine" title="Vous aimerez aussi" /><div className="mt-10"><ProductGrid items={related} isAuthed={!!user} priorityCount={0} /></div></section>}
      <RecentlyViewed excludeId={p.id} isAuthed={!!user} />
      <div className="h-20 lg:hidden" />
    </>
  );
}
