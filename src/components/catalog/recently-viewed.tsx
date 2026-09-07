"use client";
import { useEffect, useState } from "react";
import { useCart } from "@/components/cart/cart-provider";
import type { ProductCard as PC } from "@/lib/catalog";
import { ProductGrid } from "./product-card";

export function RecentlyViewed({ excludeId, isAuthed }: { excludeId?: number; isAuthed: boolean }) {
  const { recentlyViewed, hydrated } = useCart();
  const [items, setItems] = useState<PC[]>([]);
  const ids = recentlyViewed.filter((i) => i !== excludeId).slice(0, 4);
  const key = ids.join(",");
  useEffect(() => {
    if (!hydrated || !key) { setItems([]); return; }
    fetch(`/api/products?ids=${key}`).then((r) => r.json()).then((d: { items: PC[] }) => setItems(d.items)).catch(() => {});
  }, [key, hydrated]);
  if (!items.length) return null;
  return (
    <section className="container-lux py-section-sm">
      <p className="eyebrow mb-3">Vus récemment</p>
      <h2 className="mb-8 font-display text-display-sm text-ink">Reprenez là où vous étiez</h2>
      <ProductGrid items={items} isAuthed={isAuthed} priorityCount={0} />
    </section>
  );
}

export function TrackView({ id }: { id: number }) {
  const { pushRecentlyViewed, hydrated } = useCart();
  useEffect(() => { if (hydrated) pushRecentlyViewed(id); }, [id, hydrated, pushRecentlyViewed]);
  return null;
}
