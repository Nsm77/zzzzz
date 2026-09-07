"use client";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/cart/cart-provider";
import { CheckIcon, HeartIcon, PlusIcon } from "@/components/icons";
import { Badge } from "@/components/ui/primitives";
import { Stars } from "@/components/ui/stars";
import { useToast } from "@/components/ui/toaster";
import type { ProductCard as PC } from "@/lib/catalog";
import { discountPercent, formatDT } from "@/lib/money";
import { EASE_LUXE } from "@/lib/motion";
import { toggleWishlistAction } from "@/actions/shop";

export function ProductCard({ p, wished = false, priority = false, isAuthed = false }: { p: PC; wished?: boolean; priority?: boolean; isAuthed?: boolean }) {
  const cart = useCart();
  const { toast } = useToast();
  const router = useRouter();
  const reduce = useReducedMotion();
  const [added, setAdded] = useState(false);
  const [w, setW] = useState(wished);
  const [pending, start] = useTransition();
  const pct = discountPercent(p.priceMillimes, p.compareAtMillimes);
  const out = p.stock <= 0;
  const low = !out && p.stock <= p.lowStockThreshold;

  const quickAdd = () => {
    if (out) return;
    cart.add({ productId: p.id, slug: p.slug, name: p.name, brandName: p.brandName, image: p.image, priceMillimes: p.priceMillimes, stock: p.stock, volume: p.volume });
    setAdded(true);
    setTimeout(() => setAdded(false), 1400);
    toast({ kind: "success", title: "Ajouté au panier", description: p.name, action: { label: "Voir le panier", onClick: cart.open } });
  };
  const wish = () => {
    if (!isAuthed) { router.push("/connexion?next=" + encodeURIComponent(window.location.pathname)); return; }
    start(async () => {
      const r = await toggleWishlistAction(p.id);
      if (r.ok) { setW(r.data.wished); toast({ kind: "success", title: r.message ?? "" }); } else toast({ kind: "error", title: r.error });
    });
  };

  return (
    <motion.article whileHover={reduce ? undefined : { y: -3 }} transition={{ duration: 0.4, ease: EASE_LUXE }} className="group relative flex flex-col">
      <div className="relative aspect-[4/5] overflow-hidden bg-stone">
        <Link href={`/produit/${p.slug}`} aria-label={p.name} className="absolute inset-0">
          {p.image && <Image src={p.image} alt={p.name} fill priority={priority} sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw" className={`object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04] ${out ? "opacity-60 grayscale-[30%]" : ""}`} />}
        </Link>
        <div className="pointer-events-none absolute left-3 top-3 flex flex-col gap-1.5">
          {pct > 0 && <Badge tone="ink">-{pct} %</Badge>}
          {p.isNew && !pct && <Badge tone="accent">Nouveau</Badge>}
          {out && <Badge tone="neutral">Épuisé</Badge>}
        </div>
        <button onClick={wish} disabled={pending} aria-pressed={w} aria-label={w ? "Retirer des favoris" : "Ajouter aux favoris"} className={`absolute right-2 top-2 flex h-11 w-11 items-center justify-center transition-colors ${w ? "text-champagne-2" : "text-ink/70 hover:text-ink"}`}>
          <motion.span animate={w && !reduce ? { scale: [1, 1.18, 1] } : {}} transition={{ duration: 0.5, ease: EASE_LUXE }} className="flex"><HeartIcon size={18} filled={w} /></motion.span>
        </button>
        {!out && (
          <button onClick={quickAdd} aria-label={`Ajouter ${p.name} au panier`} className="absolute inset-x-3 bottom-3 flex h-11 items-center justify-center gap-2 bg-paper/95 text-[11px] uppercase tracking-[0.16em] text-ink opacity-100 backdrop-blur transition-opacity duration-500 md:translate-y-2 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100 md:transition-[opacity,transform]">
            <AnimatePresence mode="wait" initial={false}>
              {added ? <motion.span key="ok" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-2 text-success"><CheckIcon size={14} /> Ajouté</motion.span>
                : <motion.span key="add" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2"><PlusIcon size={14} /> Ajout rapide</motion.span>}
            </AnimatePresence>
          </button>
        )}
      </div>
      <div className="flex flex-1 flex-col pt-4">
        {p.brandName && <Link href={`/marque/${p.brandSlug}`} className="text-[10px] uppercase tracking-[0.18em] text-muted hover:text-ink">{p.brandName}</Link>}
        <h3 className="mt-1 text-[15px] leading-snug text-ink"><Link href={`/produit/${p.slug}`} className="line-clamp-2">{p.name}</Link></h3>
        {p.volume && <p className="mt-0.5 text-xs text-muted-2">{p.volume}</p>}
        <div className="mt-2 flex items-center gap-2">
          {p.ratingCount > 0 && <Stars value={p.ratingAvg / 100} count={p.ratingCount} size={11} />}
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-[15px] font-medium tabular-nums text-ink">{formatDT(p.priceMillimes)}</span>
          {pct > 0 && p.compareAtMillimes && <span className="text-xs tabular-nums text-muted-2 line-through">{formatDT(p.compareAtMillimes)}</span>}
        </div>
        {low && <p className="mt-1 text-[11px] text-warning">Plus que {p.stock} en stock</p>}
      </div>
    </motion.article>
  );
}

export function ProductGrid({ items, wishedIds = [], isAuthed = false, priorityCount = 4 }: { items: PC[]; wishedIds?: number[]; isAuthed?: boolean; priorityCount?: number }) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 md:gap-x-6 lg:grid-cols-4">
      {items.map((p, i) => <ProductCard key={p.id} p={p} wished={wishedIds.includes(p.id)} isAuthed={isAuthed} priority={i < priorityCount} />)}
    </div>
  );
}
