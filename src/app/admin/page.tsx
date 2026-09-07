import Link from "next/link";
import { desc, eq, gte, sql } from "drizzle-orm";
import { db } from "@/db";
import { orders, products, reviews, supportTickets } from "@/db/schema";
import { formatDT } from "@/lib/money";
import { formatDateTime } from "@/lib/utils";
import { AdminPage, KPI, Panel, StatusBadge, Table } from "@/components/admin/ui";
export const dynamic = "force-dynamic";
export default async function AdminDashboard() {
  const since = new Date(Date.now() - 30 * 86_400_000);
  const [[kpi], [today], recent, low, [pendingReviews], [openTickets]] = await Promise.all([
    db.select({ n: sql<number>`count(*)::int`, rev: sql<number>`coalesce(sum(total_millimes) filter (where status <> 'cancelled'),0)::int`, avg: sql<number>`coalesce(avg(total_millimes) filter (where status <> 'cancelled'),0)::int` }).from(orders).where(gte(orders.createdAt, since)),
    db.select({ n: sql<number>`count(*)::int` }).from(orders).where(eq(orders.status, "pending")),
    db.select().from(orders).orderBy(desc(orders.createdAt)).limit(8),
    db.select({ id: products.id, name: products.name, stock: products.stock, t: products.lowStockThreshold }).from(products).where(sql`${products.stock} <= ${products.lowStockThreshold} AND ${products.status} = 'active'`).orderBy(products.stock).limit(8),
    db.select({ n: sql<number>`count(*)::int` }).from(reviews).where(eq(reviews.status, "pending")),
    db.select({ n: sql<number>`count(*)::int` }).from(supportTickets).where(eq(supportTickets.status, "open")),
  ]);
  return (
    <AdminPage title="Tableau de bord" sub="30 derniers jours">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><KPI label="Chiffre d'affaires" value={formatDT(kpi.rev)} sub={`${kpi.n} commandes`} /><KPI label="Panier moyen" value={formatDT(kpi.avg)} /><KPI label="À confirmer" value={String(today.n)} sub="commandes en attente" /><KPI label="À traiter" value={String(pendingReviews.n + openTickets.n)} sub={`${pendingReviews.n} avis · ${openTickets.n} tickets`} /></div>
      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2"><div className="mb-3 flex items-center justify-between"><h2 className="text-sm uppercase tracking-[0.14em] text-admin-muted">Commandes récentes</h2><Link href="/admin/commandes" className="text-xs text-admin-muted hover:text-admin-text">Tout voir</Link></div>
          <Table head={["N°", "Client", "Total", "Statut", "Date"]}>{recent.map((o) => <tr key={o.id} className="hover:bg-admin-panel"><td className="px-4 py-3"><Link href={`/admin/commandes/${o.id}`} className="font-mono text-xs hover:underline">{o.number}</Link></td><td className="px-4 py-3">{o.shippingAddress.fullName}</td><td className="px-4 py-3 tabular-nums">{formatDT(o.totalMillimes)}</td><td className="px-4 py-3"><StatusBadge s={o.status} /></td><td className="px-4 py-3 text-xs text-admin-muted">{formatDateTime(o.createdAt)}</td></tr>)}</Table></div>
        <div><h2 className="mb-3 text-sm uppercase tracking-[0.14em] text-admin-muted">Alertes stock</h2><Panel>{low.length === 0 ? <p className="p-4 text-sm text-admin-muted">Aucune alerte.</p> : <ul className="divide-y divide-admin-border">{low.map((p) => <li key={p.id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm"><Link href={`/admin/produits/${p.id}`} className="truncate hover:underline">{p.name}</Link><span className={`shrink-0 tabular-nums ${p.stock === 0 ? "text-error" : "text-warning"}`}>{p.stock}</span></li>)}</ul>}</Panel></div>
      </div>
    </AdminPage>
  );
}
