import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getConcernBySlug, getConcerns } from "@/lib/catalog";
import { Listing, type SP } from "@/components/catalog/listing";
import { Breadcrumbs, ProductGridSkeleton } from "@/components/ui/primitives";
import { InfoIcon } from "@/components/icons";

export const dynamic = "force-dynamic";
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const c = await getConcernBySlug((await params).slug);
  return c ? { title: `${c.name} — Nos conseils et produits`, description: c.intro ?? undefined } : {};
}
export default async function BesoinPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<SP> }) {
  const [{ slug }, sp] = await Promise.all([params, searchParams]);
  const [c, all] = await Promise.all([getConcernBySlug(slug), getConcerns()]);
  if (!c) notFound();
  return (
    <div className="container-lux py-10 lg:py-14">
      <Breadcrumbs items={[{ href: "/boutique", label: "Boutique" }, { label: c.name }]} />
      <header className="mt-6 mb-10 grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-7"><p className="eyebrow mb-4">Par besoin</p><h1 className="font-display text-display-lg text-ink">{c.name}</h1>
          <div className="mt-6 flex gap-3 border-l-2 border-champagne bg-cream p-5 text-[15px] leading-relaxed text-charcoal"><InfoIcon size={18} className="mt-0.5 shrink-0 text-champagne-2" /><p>{c.intro}</p></div></div>
        <nav className="lg:col-span-5" aria-label="Autres besoins"><p className="eyebrow mb-3">Autres besoins</p><ul className="flex flex-wrap gap-2">{all.filter((x) => x.id !== c.id).map((x) => <li key={x.id}><Link href={`/besoin/${x.slug}`} className="inline-flex min-h-11 items-center border border-stone-2 px-3 text-xs text-charcoal hover:border-ink hover:text-ink">{x.name}</Link></li>)}</ul></nav>
      </header>
      <Suspense fallback={<ProductGridSkeleton />}><Listing base={{ concernId: c.id }} sp={sp} hideConcerns basePath={`/besoin/${c.slug}`} /></Suspense>
    </div>
  );
}
