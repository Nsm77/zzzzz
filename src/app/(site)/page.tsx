import Image from "next/image";
import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { articles, brands } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { getFeatured, getNewArrivals, getPromoProducts, getUniverses } from "@/lib/catalog";
import { ArrowRightIcon, ShieldIcon, TruckIcon, UsersIcon, CashIcon } from "@/components/icons";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { Magnetic } from "@/components/motion/magnetic";
import { SectionHeading } from "@/components/ui/primitives";
import { ProductGrid } from "@/components/catalog/product-card";
import { HeroText } from "@/components/shell/hero-text";
import { formatDate } from "@/lib/utils";

export default async function HomePage() {
  const [universes, featured, promos, news, brandRows, posts, user] = await Promise.all([
    getUniverses(), getFeatured(8), getPromoProducts(4), getNewArrivals(4),
    db.select().from(brands).where(eq(brands.isFeatured, true)).limit(8),
    db.select().from(articles).where(eq(articles.isPublished, true)).orderBy(desc(articles.publishedAt)).limit(3),
    getCurrentUser(),
  ]);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-stone">
        <div className="container-lux grid min-h-[78vh] items-center gap-10 py-16 lg:grid-cols-12 lg:py-24">
          <div className="lg:col-span-6">
            <HeroText />
            <div className="mt-10 flex flex-wrap gap-4">
              <Magnetic><Link href="/boutique" className="btn-primary">Découvrir la boutique</Link></Magnetic>
              <Magnetic><Link href="/besoin/peau-sensible" className="btn-secondary">Trouver mon soin</Link></Magnetic>
            </div>
            <ul className="mt-12 grid grid-cols-2 gap-x-6 gap-y-3 text-xs text-muted sm:flex sm:flex-wrap sm:gap-x-8">
              <li className="flex items-center gap-2"><ShieldIcon size={14} className="text-champagne-2" /> 100 % authentique</li>
              <li className="flex items-center gap-2"><UsersIcon size={14} className="text-champagne-2" /> Conseils de pharmaciens</li>
              <li className="flex items-center gap-2"><TruckIcon size={14} className="text-champagne-2" /> Offerte dès 99 DT</li>
              <li className="flex items-center gap-2"><CashIcon size={14} className="text-champagne-2" /> Paiement à la livraison</li>
            </ul>
          </div>
          <Reveal className="relative aspect-[4/5] lg:col-span-6 lg:aspect-[5/6]" delay={0.2} y={0}>
            <Image src="/images/hero.jpg" alt="Soins dermo-cosmétiques Cléopâtre" fill priority sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
          </Reveal>
        </div>
      </section>

      {/* Universes */}
      <section className="container-lux py-section-sm lg:py-section">
        <Reveal><SectionHeading eyebrow="Nos univers" title="Chaque besoin a son rayon" description="Sept univers, une sélection resserrée. Ce qui fonctionne, conseillé par des pharmaciens." action={{ href: "/boutique", label: "Toute la boutique" }} /></Reveal>
        <Stagger className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
          {universes.map((u, i) => (
            <StaggerItem key={u.id} className={i === 0 ? "col-span-2 row-span-2" : ""}>
              <Link href={`/univers/${u.slug}`} className="group relative block h-full min-h-[220px] overflow-hidden bg-stone">
                {u.image && <Image src={u.image} alt={u.name} fill sizes="(max-width: 768px) 50vw, 25vw" className="object-cover transition-transform duration-[1400ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]" />}
                <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-ink/10 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5 lg:p-7">
                  <h3 className={`font-display text-paper ${i === 0 ? "text-display-md" : "text-display-sm"}`}>{u.name}</h3>
                  <p className="mt-1 flex items-center gap-2 text-xs text-paper/80">{u.children.length} catégories <ArrowRightIcon size={12} className="transition-transform duration-500 group-hover:translate-x-1" /></p>
                </div>
              </Link>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      {/* Selection */}
      <section className="border-y border-stone bg-cream">
        <div className="container-lux py-section-sm lg:py-section">
          <Reveal><SectionHeading eyebrow="La sélection" title="Les essentiels de nos pharmaciens" description="Des références éprouvées, choisies pour leur tolérance et leur efficacité." action={{ href: "/boutique?sort=bestsellers", label: "Meilleures ventes" }} /></Reveal>
          <div className="mt-12"><ProductGrid items={featured} isAuthed={!!user} /></div>
        </div>
      </section>

      {/* Offers + New */}
      <section className="container-lux grid gap-16 py-section-sm lg:grid-cols-2 lg:gap-12 lg:py-section">
        <div>
          <Reveal><SectionHeading eyebrow="Offres du moment" title="Prix justes, sans artifice" action={{ href: "/promotions", label: "Toutes les offres" }} /></Reveal>
          <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10">{promos.map((p) => <ProductGridItem key={p.id} p={p} authed={!!user} />)}</div>
        </div>
        <div>
          <Reveal><SectionHeading eyebrow="Nouveautés" title="Récemment arrivés en boutique" action={{ href: "/boutique?sort=newest", label: "Voir les nouveautés" }} /></Reveal>
          <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10">{news.map((p) => <ProductGridItem key={p.id} p={p} authed={!!user} />)}</div>
        </div>
      </section>

      {/* Brands */}
      <section className="border-y border-stone bg-paper-2">
        <div className="container-lux py-section-sm">
          <Reveal><p className="eyebrow text-center">Marques partenaires</p></Reveal>
          <Stagger className="mt-8 grid grid-cols-2 gap-px bg-stone sm:grid-cols-4" delay={0.05}>
            {brandRows.map((b) => (
              <StaggerItem key={b.id}><Link href={`/marque/${b.slug}`} className="flex min-h-24 items-center justify-center bg-paper-2 px-4 font-display text-xl text-charcoal transition-colors hover:bg-paper hover:text-ink">{b.name}</Link></StaggerItem>
            ))}
          </Stagger>
          <div className="mt-8 text-center"><Link href="/marques" className="btn-ghost">Toutes les marques</Link></div>
        </div>
      </section>

      {/* Stores / trust */}
      <section className="container-lux grid gap-12 py-section-sm lg:grid-cols-12 lg:py-section">
        <Reveal className="lg:col-span-5">
          <p className="eyebrow mb-4">Deux adresses, une exigence</p>
          <h2 className="font-display text-display-md text-ink">Ezzahra & Hammam-Lif</h2>
          <p className="mt-5 max-w-md text-[15px] leading-relaxed text-muted">Depuis nos deux boutiques du Grand Tunis, nos pharmaciens vous conseillent en personne, au téléphone, ou préparent votre commande pour un retrait en deux heures.</p>
          <Link href="/boutiques" className="btn-ghost mt-8">Nos boutiques & horaires <ArrowRightIcon size={14} /></Link>
        </Reveal>
        <Stagger className="grid gap-px bg-stone sm:grid-cols-3 lg:col-span-7">
          {[
            { t: "Authenticité garantie", d: "Approvisionnement direct auprès des laboratoires et distributeurs officiels en Tunisie.", i: <ShieldIcon size={22} /> },
            { t: "Livraison 24–72 h", d: "Partout en Tunisie. Offerte dès 99 DT. Paiement à la livraison.", i: <TruckIcon size={22} /> },
            { t: "Conseil pharmaceutique", d: "Une question sur un actif, une routine ? Nos pharmaciens répondent.", i: <UsersIcon size={22} /> },
          ].map((x) => (
            <StaggerItem key={x.t} className="bg-paper p-7"><span className="text-champagne-2">{x.i}</span><h3 className="mt-5 text-[15px] text-ink">{x.t}</h3><p className="mt-2 text-sm leading-relaxed text-muted">{x.d}</p></StaggerItem>
          ))}
        </Stagger>
      </section>

      {/* Journal */}
      <section className="border-t border-stone bg-cream">
        <div className="container-lux py-section-sm lg:py-section">
          <Reveal><SectionHeading eyebrow="Le Journal" title="Comprendre avant d'acheter" action={{ href: "/journal", label: "Tous les articles" }} /></Reveal>
          <Stagger className="mt-12 grid gap-8 md:grid-cols-3">
            {posts.map((a) => (
              <StaggerItem key={a.id}>
                <Link href={`/journal/${a.slug}`} className="group block">
                  <div className="relative aspect-[4/3] overflow-hidden bg-stone">{a.image && <Image src={a.image} alt="" fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover transition-transform duration-[1400ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]" />}</div>
                  <p className="mt-5 text-[10px] uppercase tracking-[0.18em] text-muted">{a.tag} · {a.readMinutes} min · {formatDate(a.publishedAt)}</p>
                  <h3 className="mt-2 font-display text-display-sm text-ink">{a.title}</h3>
                  <p className="mt-2 line-clamp-2 text-sm text-muted">{a.excerpt}</p>
                </Link>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>
    </>
  );
}

import { ProductCard } from "@/components/catalog/product-card";
import type { ProductCard as PC } from "@/lib/catalog";
function ProductGridItem({ p, authed }: { p: PC; authed: boolean }) {
  return <ProductCard p={p} isAuthed={authed} />;
}
