import type { Metadata } from "next";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { addresses, stores } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { CheckoutFlow } from "@/components/checkout/checkout-flow";
export const metadata: Metadata = { title: "Commande", robots: { index: false } };
export const dynamic = "force-dynamic";
export default async function CommandePage() {
  const user = await getCurrentUser();
  const [saved, storeRows] = await Promise.all([user ? db.select().from(addresses).where(eq(addresses.userId, user.id)).orderBy(desc(addresses.isDefault)) : Promise.resolve([]), db.select().from(stores).where(eq(stores.isActive, true))]);
  return (<div className="container-lux py-10 lg:py-14"><p className="eyebrow mb-3">Commande</p><h1 className="mb-10 font-display text-display-lg text-ink">Finaliser</h1><CheckoutFlow user={user} savedAddresses={saved} stores={storeRows} /></div>);
}
