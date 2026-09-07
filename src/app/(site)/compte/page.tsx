import Link from "next/link";
import { desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { orders, wishlistItems } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { formatDT } from "@/lib/money";
import { formatDate } from "@/lib/utils";
import { ORDER_STATUS_LABELS } from "@/lib/orders";
import { Badge } from "@/components/ui/primitives";
export const dynamic = "force-dynamic";
export default async function ComptePage() {
  const user = (await getCurrentUser())!;
  const [recent, [{ n: wish }], [{ spent }]] = await Promise.all([
    db.select().from(orders).where(eq(orders.userId, user.id)).orderBy(desc(orders.createdAt)).limit(3),
    db.select({ n: sql<number>`count(*)::int` }).from(wishlistItems).where(eq(wishlistItems.userId, user.id)),
    db.select({ spent: sql<number>`coalesce(sum(total_millimes),0)::int` }).from(orders).where(sql`${orders.userId} = ${user.id} AND ${orders.status} <> 'cancelled'`),
  ]);
  return (
    <div className="space-y-12">
      <div className="grid gap-px bg-stone sm:grid-cols-3">{[["Points fidélité", String(user.loyaltyPoints), "1 point = 10 DT d'achat"], ["Total commandé", formatDT(spent), "hors annulations"], ["Favoris", String(wish), "produits enregistrés"]].map(([t, v, s]) => <div key={t} className="bg-paper p-6"><p className="eyebrow">{t}</p><p className="mt-3 font-display text-display-sm text-ink">{v}</p><p className="mt-1 text-xs text-muted-2">{s}</p></div>)}</div>
      <section><div className="mb-5 flex items-center justify-between"><h2 className="font-display text-display-sm text-ink">Dernières commandes</h2><Link href="/compte/commandes" className="text-sm text-muted hover:text-ink">Tout voir</Link></div>
        {recent.length === 0 ? <p className="text-sm text-muted">Aucune commande pour l&apos;instant. <Link href="/boutique" className="text-ink underline underline-offset-4">Découvrir la boutique</Link></p> : (
          <ul className="divide-y divide-stone border-y border-stone">{recent.map((o) => <li key={o.id}><Link href={`/compte/commandes/${o.number}`} className="flex flex-wrap items-center justify-between gap-3 py-4 hover:bg-cream"><div><p className="text-sm text-ink">{o.number}</p><p className="text-xs text-muted">{formatDate(o.createdAt)}</p></div><div className="flex items-center gap-4"><Badge tone={o.status === "delivered" ? "success" : o.status === "cancelled" ? "error" : "accent"}>{ORDER_STATUS_LABELS[o.status]}</Badge><span className="text-sm tabular-nums text-ink">{formatDT(o.totalMillimes)}</span></div></Link></li>)}</ul>
        )}</section>
    </div>
  );
}
