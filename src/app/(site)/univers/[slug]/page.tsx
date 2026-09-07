import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getCategoryBySlug } from "@/lib/catalog";
import { Listing, type SP } from "@/components/catalog/listing";
import { Breadcrumbs, ProductGridSkeleton } from "@/components/ui/primitives";
import { Reveal } from "@/components/motion/reveal";

export const dynamic = "force-dynamic";
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const c = await getCategoryBySlug((await params).slug);
  return c ? { title: c.name, description: c.description ?? undefined, openGraph: { images: c.image ? [c.image] : [] } } : {};
}

export default async function UniversPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<SP> }) {
  const [{ slug }, sp] = await Promise.all([params, searchParams]);
  const u = await getCategoryBySlug(slug);
  if (!u || !u.isUniverse) notFound();
  return (
    <>
      <section className="border-b border-stone bg-cream">
        <div className="container-lux grid items-center gap-10 py-12 lg:grid-cols-12 lg:py-16">
          <div className="lg:col-span-7">
            <Breadcrumbs items={[{ label: u.name }]} />
            <Reveal><h1 className="mt-6 font-display text-display-lg text-ink">{u.name}</h1><p className="mt-5 max-w-xl text-[15px] leading-relaxed text-muted">{u.story}</p></Reveal>
            <ul className="mt-8 flex flex-wrap gap-2">{u.children.map((c) => <li key={c.id}><Link href={`/categorie/${c.slug}`} className="inline-flex min-h-11 items-center border border-stone-2 px-4 text-xs uppercase tracking-[0.14em] text-charcoal hover:border-ink hover:text-ink">{c.name}</Link></li>)}</ul>
          </div>
          <Reveal className="relative aspect-[4/3] lg:col-span-5" delay={0.15} y={0}>{u.image && <Image src={u.image} alt={u.name} fill priority sizes="(max-width:1024px) 100vw, 40vw" className="object-cover" />}</Reveal>
        </div>
      </section>
      <div className="container-lux py-12"><Suspense fallback={<ProductGridSkeleton />}><Listing base={{ universeId: u.id }} sp={sp} basePath={`/univers/${u.slug}`} /></Suspense></div>
    </>
  );
}
