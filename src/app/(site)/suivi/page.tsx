import type { Metadata } from "next";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { Breadcrumbs, Field } from "@/components/ui/primitives";
import { OrderTimeline } from "@/components/account/order-timeline";
import { PackageIcon } from "@/components/icons";
export const metadata: Metadata = { title: "Suivre ma commande", robots: { index: false } };
export const dynamic = "force-dynamic";
export default async function SuiviPage({ searchParams }: { searchParams: Promise<{ n?: string; e?: string }> }) {
  const { n, e } = await searchParams;
  const order = n && e ? await db.query.orders.findFirst({ where: and(eq(orders.number, n.trim().toUpperCase()), eq(orders.email, e.trim().toLowerCase())), with: { events: true } }) : null;
  return (
    <div className="container-lux py-10 lg:py-14">
      <Breadcrumbs items={[{ label: "Suivi de commande" }]} />
      <div className="mx-auto mt-6 max-w-xl"><p className="eyebrow mb-4">Suivi</p><h1 className="font-display text-display-lg text-ink">Où en est ma commande ?</h1>
        <form className="mt-8 space-y-4"><Field label="Numéro de commande"><input name="n" defaultValue={n} placeholder="CL-241010-XXXX" required className="field" /></Field><Field label="E-mail utilisé"><input name="e" type="email" defaultValue={e} required className="field" /></Field><button className="btn-primary w-full">Suivre</button></form>
        {n && e && !order && <p className="mt-6 text-sm text-error" role="alert">Aucune commande trouvée avec ces informations.</p>}
        {order && <div className="mt-12 border border-stone bg-cream p-6"><div className="mb-6 flex items-center gap-3 text-ink"><PackageIcon size={20} className="text-champagne-2" /><span className="font-display text-xl">{order.number}</span>{order.trackingCode && <span className="ml-auto text-xs text-muted">Suivi transporteur : {order.trackingCode}</span>}</div><OrderTimeline status={order.status} events={order.events} /></div>}
      </div>
    </div>
  );
}
