import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getBrandBySlug } from "@/lib/catalog";
import { Listing, type SP } from "@/components/catalog/listing";
import { Breadcrumbs, ProductGridSkeleton } from "@/components/ui/primitives";

export const dynamic = "force-dynamic";
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const b = await getBrandBySlug((await params).slug);
  return b ? { title: `${b.name} — Tous les produits`, description: b.story ?? undefined } : {};
}
export default async function MarquePage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<SP> }) {
  const [{ slug }, sp] = await Promise.all([params, searchParams]);
  const b = await getBrandBySlug(slug);
  if (!b) notFound();
  return (
    <div className="container-lux py-10 lg:py-14">
      <Breadcrumbs items={[{ href: "/marques", label: "Marques" }, { label: b.name }]} />
      <header className="mt-6 mb-10 max-w-2xl"><p className="eyebrow mb-4">{b.country}</p><h1 className="font-display text-display-lg text-ink">{b.name}</h1><p className="mt-5 text-[15px] leading-relaxed text-muted">{b.story}</p></header>
      <Suspense fallback={<ProductGridSkeleton />}><Listing base={{ brandId: b.id }} sp={sp} hideBrands basePath={`/marque/${b.slug}`} /></Suspense>
    </div>
  );
}
