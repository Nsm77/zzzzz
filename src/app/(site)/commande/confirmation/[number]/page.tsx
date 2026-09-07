import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { formatDT } from "@/lib/money";
import { PAYMENT_LABELS, SHIPPING_LABELS } from "@/lib/orders";
import { deliveryEstimate } from "@/lib/tunisia";
import { OrderTimeline } from "@/components/account/order-timeline";
import { Reveal } from "@/components/motion/reveal";
import { CheckIcon } from "@/components/icons";
export const metadata: Metadata = { title: "Commande confirmée", robots: { index: false } };
export const dynamic = "force-dynamic";
export default async function ConfirmationPage({ params }: { params: Promise<{ number: string }> }) {
  const { number } = await params;
  const [o, user] = await Promise.all([db.query.orders.findFirst({ where: eq(orders.number, number), with: { items: true, events: true } }), getCurrentUser()]);
  if (!o) notFound();
  // Guests may view only within the session that created it; minimal exposure: no PII beyond what they entered.
  return (
    <div className="container-lux py-14 lg:py-20">
      <div className="mx-auto max-w-2xl text-center">
        <Reveal y={0}><span className="mx-auto flex h-14 w-14 items-center justify-center border border-champagne text-champagne-2"><CheckIcon size={24} /></span></Reveal>
        <Reveal delay={0.1}><p className="eyebrow mt-8 mb-4">Merci</p><h1 className="font-display text-display-lg text-ink">Commande confirmée</h1><p className="mt-4 text-[15px] text-muted">Votre commande <span className="font-mono text-ink">{o.number}</span> a bien été enregistrée. Un e-mail de confirmation est envoyé à {o.email}.</p></Reveal>
      </div>
      <div className="mx-auto mt-14 grid max-w-4xl gap-10 lg:grid-cols-12">
        <div className="lg:col-span-7"><OrderTimeline status={o.status} events={o.events} /></div>
        <div className="space-y-6 text-sm lg:col-span-5">
          <div className="border border-stone bg-cream p-5"><p className="eyebrow mb-3">Prochaines étapes</p><ol className="list-decimal space-y-2 pl-4 text-charcoal"><li>Notre équipe confirme votre commande par téléphone sous 24 h ouvrées.</li><li>{o.shippingMethod === "pickup" ? "Nous vous appelons dès que la commande est prête en boutique." : `${SHIPPING_LABELS[o.shippingMethod]} — ${deliveryEstimate(o.shippingAddress.governorate, o.shippingMethod)}.`}</li><li>{PAYMENT_LABELS[o.paymentMethod]}{o.paymentMethod === "bank_transfer" ? " — le RIB vous sera communiqué." : "."}</li></ol></div>
          <dl className="space-y-1.5 border border-stone p-5"><div className="flex justify-between"><dt className="text-muted">Articles</dt><dd>{o.items.reduce((a, i) => a + i.quantity, 0)}</dd></div><div className="flex justify-between"><dt className="text-muted">Sous-total</dt><dd className="tabular-nums">{formatDT(o.subtotalMillimes)}</dd></div>{o.discountMillimes > 0 && <div className="flex justify-between text-success"><dt>Remise</dt><dd className="tabular-nums">−{formatDT(o.discountMillimes)}</dd></div>}<div className="flex justify-between"><dt className="text-muted">Livraison</dt><dd className="tabular-nums">{o.shippingMillimes ? formatDT(o.shippingMillimes) : "Offerte"}</dd></div>{o.giftWrapMillimes > 0 && <div className="flex justify-between"><dt className="text-muted">Emballage cadeau</dt><dd className="tabular-nums">{formatDT(o.giftWrapMillimes)}</dd></div>}<div className="flex justify-between border-t border-stone pt-2 text-base text-ink"><dt>Total</dt><dd className="font-medium tabular-nums">{formatDT(o.totalMillimes)}</dd></div></dl>
          <div className="flex flex-wrap gap-3">{user ? <Link href={`/compte/commandes/${o.number}`} className="btn-primary">Suivre ma commande</Link> : <Link href={`/suivi?n=${o.number}&e=${encodeURIComponent(o.email)}`} className="btn-primary">Suivre ma commande</Link>}<Link href="/boutique" className="btn-secondary">Continuer</Link></div>
        </div>
      </div>
    </div>
  );
}
