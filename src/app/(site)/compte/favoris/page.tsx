import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { wishlistItems } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { getByIds } from "@/lib/catalog";
import { ProductGrid } from "@/components/catalog/product-card";
import { EmptyState } from "@/components/ui/primitives";
import { HeartIcon } from "@/components/icons";
export const dynamic = "force-dynamic";
export default async function FavorisPage() {
  const user = (await getCurrentUser())!;
  const ids = (await db.select({ id: wishlistItems.productId }).from(wishlistItems).where(eq(wishlistItems.userId, user.id)).orderBy(desc(wishlistItems.createdAt))).map((w) => w.id);
  const items = await getByIds(ids);
  if (!items.length) return <EmptyState icon={<HeartIcon size={22} />} title="Aucun favori" description="Enregistrez vos produits préférés pour les retrouver facilement." action={{ href: "/boutique", label: "Découvrir la boutique" }} />;
  return <div><h2 className="mb-6 font-display text-display-sm text-ink">Mes favoris</h2><ProductGrid items={items} wishedIds={ids} isAuthed priorityCount={0} /></div>;
}
