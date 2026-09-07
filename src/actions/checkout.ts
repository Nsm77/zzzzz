"use server";
import { and, eq, sql } from "drizzle-orm";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { loyaltyTransactions, orderItems, orders, promotions, users } from "@/db/schema";
import { createSession, getCurrentUser, hashPassword } from "@/lib/auth";
import { fail, MESSAGES, ok, zodFieldErrors, type ActionResult } from "@/lib/api";
import { GIFT_WRAP_FEE, loyaltyPointsFor, shippingFor } from "@/lib/money";
import { checkOrigin, clientKey } from "@/lib/origin";
import { addOrderEvent, audit, generateOrderNumber, lockProducts, recordMovement, restockOrder, track } from "@/lib/orders";
import { evaluatePromo } from "@/lib/promotions";
import { rateLimit } from "@/lib/rate-limit";
import { checkoutSchema } from "@/lib/validation";
import { log } from "@/lib/logger";

export async function placeOrderAction(input: unknown): Promise<ActionResult<{ number: string }>> {
  if (!(await checkOrigin())) return fail(MESSAGES.badOrigin);
  if (!rateLimit(`checkout:${await clientKey()}`, 6, 300_000)) return fail(MESSAGES.rateLimited);
  const parsed = checkoutSchema.safeParse(input);
  if (!parsed.success) return fail(MESSAGES.invalid, zodFieldErrors(parsed.error.issues));
  const data = parsed.data;
  const me = await getCurrentUser();

  // idempotency
  const existing = await db.query.orders.findFirst({ where: eq(orders.idempotencyKey, data.idempotencyKey) });
  if (existing) return ok({ number: existing.number }, "Commande déjà enregistrée.");

  // merge duplicate lines
  const merged = new Map<number, number>();
  for (const l of data.lines) merged.set(l.productId, Math.min(20, (merged.get(l.productId) ?? 0) + l.quantity));

  try {
    const result = await db.transaction(async (tx) => {
      const locked = await lockProducts(tx, [...merged.keys()]);
      const lines = [] as { productId: number; name: string; sku: string; image: string | null; brandId: number | null; universeId: number | null; unit: number; qty: number; total: number }[];
      for (const [pid, qty] of merged) {
        const p = locked.find((x) => x.id === pid);
        if (!p || p.status !== "active") throw new Error(`Un article n'est plus disponible.`);
        if (p.stock < qty) throw new Error(`Stock insuffisant pour « ${p.name} » (${p.stock} restant${p.stock > 1 ? "s" : ""}).`);
        lines.push({ productId: p.id, name: p.name, sku: p.sku, image: p.image, brandId: p.brand_id, universeId: p.universe_id, unit: p.price_millimes, qty, total: p.price_millimes * qty });
      }
      const subtotal = lines.reduce((a, l) => a + l.total, 0);
      let discount = 0, freeShipping = false, promoCode: string | null = null;
      if (data.promoCode) {
        const res = await evaluatePromo(data.promoCode, lines.map((l) => ({ productId: l.productId, universeId: l.universeId, lineTotal: l.total })), me?.id, data.email);
        if (!res.ok) throw new Error(res.reason);
        discount = res.discount; freeShipping = res.freeShipping; promoCode = res.promo.code;
        await tx.update(promotions).set({ usageCount: sql`${promotions.usageCount} + 1` }).where(eq(promotions.id, res.promo.id));
      }
      const shipping = freeShipping && data.shippingMethod !== "express" ? 0 : shippingFor(subtotal - discount, data.shippingMethod);
      const giftWrapFee = data.giftWrap ? GIFT_WRAP_FEE : 0;
      const total = subtotal - discount + shipping + giftWrapFee;

      let userId = me?.id ?? null;
      if (!me && data.createAccount && data.accountPassword && data.accountPassword.length >= 8) {
        const exists = await tx.query.users.findFirst({ where: eq(users.email, data.email) });
        if (!exists) {
          const [first, ...rest] = data.address.fullName.split(" ");
          const [u] = await tx.insert(users).values({ email: data.email, passwordHash: await hashPassword(data.accountPassword), firstName: first || "Client", lastName: rest.join(" ") || "Cléopâtre", phone: data.address.phone }).returning();
          userId = u.id;
        }
      }

      const brandNames = await tx.execute(sql`SELECT id, name FROM brands`);
      const bn = new Map((brandNames.rows as { id: number; name: string }[]).map((b) => [b.id, b.name]));
      const [order] = await tx.insert(orders).values({
        number: generateOrderNumber(), idempotencyKey: data.idempotencyKey, userId, email: data.email, phone: data.address.phone,
        paymentMethod: data.paymentMethod, shippingMethod: data.shippingMethod, storeId: data.storeId ?? null,
        shippingAddress: { ...data.address, line2: data.address.line2 || undefined, postalCode: data.address.postalCode || undefined },
        subtotalMillimes: subtotal, discountMillimes: discount, shippingMillimes: shipping, giftWrapMillimes: giftWrapFee, totalMillimes: total,
        promoCode, giftWrap: data.giftWrap, giftMessage: data.giftMessage || null, customerNote: data.customerNote || null,
      }).returning();
      await tx.insert(orderItems).values(lines.map((l) => ({ orderId: order.id, productId: l.productId, name: l.name, sku: l.sku, brandName: l.brandId ? bn.get(l.brandId) ?? null : null, image: l.image, unitPriceMillimes: l.unit, quantity: l.qty, lineTotalMillimes: l.total })));
      for (const l of lines) {
        await recordMovement(tx, { productId: l.productId, type: "sale", quantity: -l.qty, reason: `Commande ${order.number}`, orderId: order.id, userId: userId ?? undefined });
        await tx.execute(sql`UPDATE products SET sales_count = sales_count + ${l.qty} WHERE id = ${l.productId}`);
      }
      await addOrderEvent(tx, order.id, "pending", "Commande reçue", userId ?? undefined);
      if (userId) {
        const pts = loyaltyPointsFor(total);
        if (pts > 0) {
          await tx.insert(loyaltyTransactions).values({ userId, points: pts, reason: `Commande ${order.number}`, orderId: order.id });
          await tx.update(users).set({ loyaltyPoints: sql`${users.loyaltyPoints} + ${pts}` }).where(eq(users.id, userId));
        }
      }
      return { order, userId, created: !me && userId != null };
    });

    if (result.created && result.userId) await createSession(result.userId, (await headers()).get("user-agent"));
    await track("order.placed", { number: result.order.number, total: result.order.totalMillimes }, result.userId);
    log.info("order.placed", { number: result.order.number });
    revalidatePath("/admin");
    return ok({ number: result.order.number }, "Commande confirmée.");
  } catch (e) {
    const msg = e instanceof Error ? e.message : MESSAGES.generic;
    log.warn("order.failed", { msg });
    return fail(msg);
  }
}

export async function cancelOrderAction(orderId: number): Promise<ActionResult> {
  const me = await getCurrentUser();
  if (!me) return fail(MESSAGES.unauthorized);
  try {
    await db.transaction(async (tx) => {
      const o = await tx.query.orders.findFirst({ where: and(eq(orders.id, orderId), eq(orders.userId, me.id)) });
      if (!o) throw new Error(MESSAGES.notFound);
      if (!["pending", "confirmed"].includes(o.status)) throw new Error("Cette commande ne peut plus être annulée.");
      await tx.update(orders).set({ status: "cancelled", updatedAt: new Date() }).where(eq(orders.id, o.id));
      await restockOrder(tx, o.id, me.id);
      await addOrderEvent(tx, o.id, "cancelled", "Annulée par le client", me.id);
    });
    await audit(me.id, "order.cancel", "order", orderId);
    revalidatePath("/compte/commandes");
    return ok(undefined, "Commande annulée. Les articles ont été remis en stock.");
  } catch (e) {
    return fail(e instanceof Error ? e.message : MESSAGES.generic);
  }
}

export async function requestReturnAction(orderId: number, reason: string): Promise<ActionResult> {
  const me = await getCurrentUser();
  if (!me) return fail(MESSAGES.unauthorized);
  const o = await db.query.orders.findFirst({ where: and(eq(orders.id, orderId), eq(orders.userId, me.id)) });
  if (!o) return fail(MESSAGES.notFound);
  if (o.status !== "delivered") return fail("Seules les commandes livrées peuvent faire l'objet d'un retour.");
  await addOrderEvent(db, o.id, "delivered", `Demande de retour : ${reason.slice(0, 200)}`, me.id);
  await audit(me.id, "order.return_request", "order", orderId, { reason });
  revalidatePath(`/compte/commandes/${o.number}`);
  return ok(undefined, "Demande de retour enregistrée. Notre équipe vous contactera sous 48 h.");
}
