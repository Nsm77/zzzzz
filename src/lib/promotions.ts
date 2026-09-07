import "server-only";
import { and, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { orders, promotions, type Promotion } from "@/db/schema";
import type { Millimes } from "./money";

export type PromoLine = { productId: number; universeId: number | null; lineTotal: Millimes };
export type PromoResult =
  | { ok: true; promo: Promotion; discount: Millimes; freeShipping: boolean; label: string }
  | { ok: false; reason: string };

export async function evaluatePromo(code: string, lines: PromoLine[], userId?: number | null, email?: string | null): Promise<PromoResult> {
  const normalized = code.trim().toUpperCase();
  if (!normalized) return { ok: false, reason: "Code requis." };
  const promo = await db.query.promotions.findFirst({ where: eq(promotions.code, normalized) });
  if (!promo || !promo.isActive) return { ok: false, reason: "Ce code n'est pas valide." };
  const now = new Date();
  if (promo.startsAt && promo.startsAt > now) return { ok: false, reason: "Ce code n'est pas encore actif." };
  if (promo.endsAt && promo.endsAt < now) return { ok: false, reason: "Ce code a expiré." };
  if (promo.usageLimit && promo.usageCount >= promo.usageLimit) return { ok: false, reason: "Ce code a atteint sa limite d'utilisation." };

  if (promo.perUserLimit > 0 && (userId || email)) {
    const cond = userId ? eq(orders.userId, userId) : eq(orders.email, email!);
    const used = await db.select({ n: sql<number>`count(*)::int` }).from(orders)
      .where(and(cond, eq(orders.promoCode, normalized), sql`${orders.status} <> 'cancelled'`));
    if ((used[0]?.n ?? 0) >= promo.perUserLimit) return { ok: false, reason: "Vous avez déjà utilisé ce code." };
  }

  const eligible = promo.universeId ? lines.filter((l) => l.universeId === promo.universeId) : lines;
  const eligibleTotal = eligible.reduce((s, l) => s + l.lineTotal, 0);
  const subtotal = lines.reduce((s, l) => s + l.lineTotal, 0);
  if (subtotal < promo.minSubtotalMillimes) {
    return { ok: false, reason: `Minimum d'achat : ${(promo.minSubtotalMillimes / 1000).toFixed(0)} DT.` };
  }
  if (promo.universeId && eligibleTotal === 0) return { ok: false, reason: "Aucun article éligible à ce code." };

  let discount = 0;
  let freeShipping = false;
  if (promo.type === "percent") discount = Math.floor((eligibleTotal * promo.value) / 100);
  else if (promo.type === "fixed") discount = Math.min(promo.value, eligibleTotal);
  else freeShipping = true;
  if (promo.maxDiscountMillimes) discount = Math.min(discount, promo.maxDiscountMillimes);
  discount = Math.max(0, Math.min(discount, subtotal));
  return { ok: true, promo, discount, freeShipping, label: promo.label };
}
