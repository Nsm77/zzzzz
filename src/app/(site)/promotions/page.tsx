import type { Metadata } from "next";
import { Suspense } from "react";
import { and, eq, gte, isNull, or } from "drizzle-orm";
import { db } from "@/db";
import { promotions } from "@/db/schema";
import { Listing, type SP } from "@/components/catalog/listing";
import { Breadcrumbs, ProductGridSkeleton } from "@/components/ui/primitives";
import { TagIcon } from "@/components/icons";
import { formatDTShort } from "@/lib/money";
export const metadata: Metadata = { title: "Offres & promotions", description: "Prix justes sur vos soins essentiels. Codes promo Cléopâtre." };
export const dynamic = "force-dynamic";
export default async function PromotionsPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const codes = await db.select().from(promotions).where(and(eq(promotions.isActive, true), or(isNull(promotions.endsAt), gte(promotions.endsAt, new Date()))));
  return (
    <div className="container-lux py-10 lg:py-14">
      <Breadcrumbs items={[{ label: "Offres" }]} />
      <header className="mt-6 mb-10 max-w-2xl"><p className="eyebrow mb-4">Offres du moment</p><h1 className="font-display text-display-lg text-ink">Prix justes, sans artifice</h1><p className="mt-4 text-[15px] text-muted">Des remises réelles sur des références que nous conseillons toute l&apos;année.</p></header>
      {codes.length > 0 && (
        <ul className="mb-12 grid gap-px bg-stone sm:grid-cols-2 lg:grid-cols-4">
          {codes.map((c) => (
            <li key={c.id} className="flex items-start gap-3 bg-cream p-5"><TagIcon size={18} className="mt-0.5 shrink-0 text-champagne-2" /><div><p className="font-mono text-sm tracking-[0.12em] text-ink">{c.code}</p><p className="mt-1 text-sm text-charcoal">{c.label}</p>{c.minSubtotalMillimes > 0 && <p className="mt-1 text-xs text-muted-2">Dès {formatDTShort(c.minSubtotalMillimes)} d&apos;achat</p>}</div></li>
          ))}
        </ul>
      )}
      <Suspense fallback={<ProductGridSkeleton />}><Listing base={{ promo: true }} sp={sp} basePath="/promotions" /></Suspense>
    </div>
  );
}
