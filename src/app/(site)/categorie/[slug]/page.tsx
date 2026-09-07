import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getCategoryBySlug } from "@/lib/catalog";
import { Listing, type SP } from "@/components/catalog/listing";
import { Breadcrumbs, ProductGridSkeleton } from "@/components/ui/primitives";

export const dynamic = "force-dynamic";
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const c = await getCategoryBySlug((await params).slug);
  return c ? { title: c.name, description: c.description ?? undefined } : {};
}
export default async function CategoriePage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<SP> }) {
  const [{ slug }, sp] = await Promise.all([params, searchParams]);
  const c = await getCategoryBySlug(slug);
  if (!c || c.isUniverse) notFound();
  return (
    <div className="container-lux py-10 lg:py-14">
      <Breadcrumbs items={[...(c.parent ? [{ href: `/univers/${c.parent.slug}`, label: c.parent.name }] : []), { label: c.name }]} />
      <header className="mt-6 mb-10 max-w-2xl"><p className="eyebrow mb-4">{c.parent?.name}</p><h1 className="font-display text-display-lg text-ink">{c.name}</h1>{c.description && <p className="mt-4 text-[15px] text-muted">{c.description}</p>}</header>
      <Suspense fallback={<ProductGridSkeleton />}><Listing base={{ categoryId: c.id }} sp={sp} basePath={`/categorie/${c.slug}`} /></Suspense>
    </div>
  );
}
