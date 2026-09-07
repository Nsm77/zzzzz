import type { Metadata } from "next";
import Link from "next/link";
import { getBrands } from "@/lib/catalog";
import { Breadcrumbs } from "@/components/ui/primitives";
import { Stagger, StaggerItem } from "@/components/motion/reveal";
export const metadata: Metadata = { title: "Marques", description: "Toutes les marques dermo-cosmétiques disponibles chez Cléopâtre." };
export default async function MarquesPage() {
  const list = await getBrands();
  const groups = list.reduce<Record<string, typeof list>>((a, b) => { const k = b.name[0].toUpperCase(); (a[k] ??= []).push(b); return a; }, {});
  return (
    <div className="container-lux py-10 lg:py-14">
      <Breadcrumbs items={[{ label: "Marques" }]} />
      <header className="mt-6 mb-12 max-w-2xl"><p className="eyebrow mb-4">{list.length} marques</p><h1 className="font-display text-display-lg text-ink">Nos marques partenaires</h1><p className="mt-4 text-[15px] text-muted">Laboratoires dermatologiques et maisons de soin, distribués officiellement en Tunisie.</p></header>
      <Stagger className="grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-3" delay={0.04}>
        {Object.entries(groups).sort().map(([l, bs]) => (
          <StaggerItem key={l}><p className="mb-4 border-b border-stone pb-2 font-display text-2xl text-champagne-2">{l}</p>
            <ul className="space-y-1">{bs.map((b) => <li key={b.id}><Link href={`/marque/${b.slug}`} className="link-underline inline-block py-1.5 text-[15px] text-charcoal hover:text-ink">{b.name}</Link> <span className="ml-1 text-xs text-muted-2">{b.country}</span></li>)}</ul></StaggerItem>
        ))}
      </Stagger>
    </div>
  );
}
