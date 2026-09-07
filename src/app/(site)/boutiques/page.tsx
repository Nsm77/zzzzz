import type { Metadata } from "next";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { stores } from "@/db/schema";
import { Breadcrumbs } from "@/components/ui/primitives";
import { ClockIcon, ExternalIcon, MapPinIcon, PhoneIcon } from "@/components/icons";
import { Stagger, StaggerItem } from "@/components/motion/reveal";
import { SITE_URL } from "@/lib/env";
export const metadata: Metadata = { title: "Nos boutiques", description: "Parapharmacie Cléopâtre à Ezzahra et Hammam-Lif : adresses, horaires, téléphone." };
export const dynamic = "force-dynamic";
export default async function BoutiquesPage() {
  const list = await db.select().from(stores).where(eq(stores.isActive, true));
  const ld = { "@context": "https://schema.org", "@type": "Organization", name: "Cléopâtre — Espace Santé Beauté", url: SITE_URL, location: list.map((s) => ({ "@type": "Pharmacy", name: s.name, telephone: `+216${s.phone}`, address: { "@type": "PostalAddress", streetAddress: s.address, addressLocality: s.city, addressCountry: "TN" }, openingHours: s.hours })) };
  return (
    <div className="container-lux py-10 lg:py-14">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <Breadcrumbs items={[{ label: "Nos boutiques" }]} />
      <header className="mt-6 mb-12 max-w-2xl"><p className="eyebrow mb-4">Deux adresses</p><h1 className="font-display text-display-lg text-ink">Venez nous rencontrer</h1><p className="mt-4 text-[15px] text-muted">Conseil pharmaceutique en personne, retrait de commande sous 2 h, et toute la sélection en rayon.</p></header>
      <Stagger className="grid gap-px bg-stone md:grid-cols-2">
        {list.map((s) => (
          <StaggerItem key={s.id} className="bg-paper p-8 lg:p-10">
            <h2 className="font-display text-display-sm text-ink">{s.name}</h2>
            <ul className="mt-6 space-y-3 text-[15px] text-charcoal">
              <li className="flex items-start gap-3"><MapPinIcon size={18} className="mt-0.5 shrink-0 text-champagne-2" /><span>{s.address}<br />{s.city}</span></li>
              <li className="flex items-start gap-3"><ClockIcon size={18} className="mt-0.5 shrink-0 text-champagne-2" /><span>{s.hours}</span></li>
              <li className="flex items-center gap-3"><PhoneIcon size={18} className="shrink-0 text-champagne-2" /><a href={`tel:+216${s.phone}`} className="min-h-11 inline-flex items-center hover:text-ink">{s.phone.replace(/(\d{2})(\d{3})(\d{3})/, "$1 $2 $3")}</a></li>
            </ul>
            <div className="mt-8 flex flex-wrap gap-3"><a href={`tel:+216${s.phone}`} className="btn-primary">Appeler</a>{s.mapsUrl && <a href={s.mapsUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary">Itinéraire <ExternalIcon size={14} /></a>}</div>
          </StaggerItem>
        ))}
      </Stagger>
    </div>
  );
}
