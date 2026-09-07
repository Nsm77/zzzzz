import type { Metadata } from "next";
import { Suspense } from "react";
import { Listing, type SP } from "@/components/catalog/listing";
import { listProducts } from "@/lib/catalog";
import { Breadcrumbs, ProductGridSkeleton } from "@/components/ui/primitives";
import { logSearchAction } from "@/actions/shop";
export const metadata: Metadata = { title: "Recherche", robots: { index: false } };
export const dynamic = "force-dynamic";
export default async function RecherchePage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.trim() : "";
  if (q.length >= 2 && !sp.page) { const { total } = await listProducts({ q, perPage: 1 }); await logSearchAction(q, total); }
  return (
    <div className="container-lux py-10 lg:py-14">
      <Breadcrumbs items={[{ label: "Recherche" }]} />
      <header className="mt-6 mb-10 max-w-2xl"><p className="eyebrow mb-4">Résultats</p><h1 className="font-display text-display-lg text-ink">{q ? <>« {q} »</> : "Rechercher"}</h1></header>
      {q.length >= 2 ? <Suspense fallback={<ProductGridSkeleton />}><Listing base={{ q }} sp={sp} basePath="/recherche" /></Suspense> : <p className="text-muted">Saisissez au moins deux caractères.</p>}
    </div>
  );
}
