import type { Metadata } from "next";
import { Suspense } from "react";
import { Listing, type SP } from "@/components/catalog/listing";
import { Breadcrumbs, ProductGridSkeleton } from "@/components/ui/primitives";

export const metadata: Metadata = { title: "Boutique", description: "Toute la sélection Cléopâtre : dermo-cosmétique, solaire, cheveux, bébé, compléments." };
export const dynamic = "force-dynamic";

export default async function BoutiquePage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  return (
    <div className="container-lux py-10 lg:py-14">
      <Breadcrumbs items={[{ label: "Boutique" }]} />
      <header className="mt-6 mb-10 max-w-2xl"><p className="eyebrow mb-4">Boutique</p><h1 className="font-display text-display-lg text-ink">Toute la sélection</h1><p className="mt-4 text-[15px] text-muted">Chaque référence est choisie par nos pharmaciens pour sa tolérance et son efficacité.</p></header>
      <Suspense fallback={<ProductGridSkeleton />}><Listing base={{}} sp={sp} basePath="/boutique" /></Suspense>
    </div>
  );
}
