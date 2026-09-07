import "server-only";
import { randomBytes } from "node:crypto";
import { eq, sql } from "drizzle-orm";
import { db, type Tx } from "@/db";
import { analyticsEvents, auditLogs, inventoryMovements, orderEvents, orders, products, type OrderStatus } from "@/db/schema";

export function generateOrderNumber(): string {
  const d = new Date();
  const ymd = `${d.getFullYear().toString().slice(2)}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  return `CL-${ymd}-${randomBytes(2).toString("hex").toUpperCase()}`;
}
export function newIdempotencyKey() {
  return randomBytes(16).toString("hex");
}

/** Lock product rows FOR UPDATE and return them (throws if any missing). */
export async function lockProducts(tx: Tx, ids: number[]) {
  if (!ids.length) return [];
  const rows = await tx.execute(sql`SELECT id, name, sku, price_millimes, stock, image, brand_id, universe_id, status FROM products WHERE id IN ${ids} FOR UPDATE`);
  return rows.rows as Array<{ id: number; name: string; sku: string; price_millimes: number; stock: number; image: string | null; brand_id: number | null; universe_id: number | null; status: string }>;
}

export async function recordMovement(tx: Tx, args: { productId: number; type: "in" | "out" | "adjust" | "sale" | "restock" | "return"; quantity: number; reason?: string; orderId?: number; userId?: number }) {
  const [p] = await tx.update(products).set({ stock: sql`${products.stock} + ${args.quantity}`, updatedAt: new Date() }).where(eq(products.id, args.productId)).returning({ stock: products.stock });
  await tx.insert(inventoryMovements).values({ productId: args.productId, type: args.type, quantity: args.quantity, stockAfter: p?.stock ?? 0, reason: args.reason, orderId: args.orderId, userId: args.userId });
  return p?.stock ?? 0;
}

export async function addOrderEvent(tx: Tx | typeof db, orderId: number, status: OrderStatus, message?: string, actorId?: number) {
  await tx.insert(orderEvents).values({ orderId, status, message, actorId });
}

export async function audit(actorId: number | null, action: string, entity: string, entityId?: string | number, details: Record<string, unknown> = {}) {
  try { await db.insert(auditLogs).values({ actorId, action, entity, entityId: entityId != null ? String(entityId) : null, details }); } catch { /* never block */ }
}
export async function track(name: string, payload: Record<string, unknown> = {}, userId?: number | null) {
  try { await db.insert(analyticsEvents).values({ name, payload, userId: userId ?? null }); } catch { /* never block */ }
}

export { ORDER_STATUS_LABELS, ORDER_FLOW, ALLOWED_TRANSITIONS, PAYMENT_LABELS, SHIPPING_LABELS } from "./order-constants";

export async function restockOrder(tx: Tx, orderId: number, actorId?: number) {
  const items = await tx.execute(sql`SELECT product_id, quantity FROM order_items WHERE order_id = ${orderId} AND product_id IS NOT NULL`);
  for (const it of items.rows as Array<{ product_id: number; quantity: number }>) {
    await recordMovement(tx, { productId: it.product_id, type: "return", quantity: it.quantity, reason: "Annulation commande", orderId, userId: actorId });
    await tx.update(products).set({ salesCount: sql`greatest(${products.salesCount} - ${it.quantity}, 0)` }).where(eq(products.id, it.product_id));
  }
}
export { orders };
