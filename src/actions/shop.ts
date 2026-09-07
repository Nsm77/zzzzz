"use server";
import { and, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { newsletterSubscribers, products, reviews, searchEvents, supportTickets, wishlistItems } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { fail, MESSAGES, ok, zodFieldErrors, type ActionResult } from "@/lib/api";
import { evaluatePromo } from "@/lib/promotions";
import { rateLimit } from "@/lib/rate-limit";
import { clientKey } from "@/lib/origin";
import { newsletterSchema, reviewSchema, ticketSchema } from "@/lib/validation";
import { track } from "@/lib/orders";

export async function toggleWishlistAction(productId: number): Promise<ActionResult<{ wished: boolean }>> {
  const me = await getCurrentUser();
  if (!me) return fail(MESSAGES.unauthorized);
  const ex = await db.select().from(wishlistItems).where(and(eq(wishlistItems.userId, me.id), eq(wishlistItems.productId, productId))).limit(1);
  if (ex.length) {
    await db.delete(wishlistItems).where(and(eq(wishlistItems.userId, me.id), eq(wishlistItems.productId, productId)));
    revalidatePath("/compte/favoris");
    return ok({ wished: false }, "Retiré de vos favoris.");
  }
  await db.insert(wishlistItems).values({ userId: me.id, productId });
  await track("wishlist.add", { productId }, me.id);
  revalidatePath("/compte/favoris");
  return ok({ wished: true }, "Ajouté à vos favoris.");
}

export async function submitReviewAction(_prev: ActionResult | null, form: FormData): Promise<ActionResult> {
  if (!rateLimit(`review:${await clientKey()}`, 5, 600_000)) return fail(MESSAGES.rateLimited);
  const me = await getCurrentUser();
  const parsed = reviewSchema.safeParse({ productId: Number(form.get("productId")), rating: Number(form.get("rating")), title: form.get("title"), body: form.get("body"), authorName: form.get("authorName") || (me ? `${me.firstName} ${me.lastName[0]}.` : "") });
  if (!parsed.success) return fail(MESSAGES.invalid, zodFieldErrors(parsed.error.issues));
  await db.insert(reviews).values({ ...parsed.data, title: parsed.data.title || null, userId: me?.id ?? null, status: "pending" });
  return ok(undefined, "Merci ! Votre avis sera publié après modération.");
}

export async function validatePromoAction(code: string, lines: { productId: number; quantity: number }[]): Promise<ActionResult<{ discount: number; freeShipping: boolean; label: string; code: string }>> {
  if (!rateLimit(`promo:${await clientKey()}`, 20, 60_000)) return fail(MESSAGES.rateLimited);
  const me = await getCurrentUser();
  const ids = lines.map((l) => l.productId);
  if (!ids.length) return fail("Votre panier est vide.");
  const rows = await db.select({ id: products.id, price: products.priceMillimes, universeId: products.universeId }).from(products).where(sql`${products.id} IN ${ids}`);
  const promoLines = lines.map((l) => { const p = rows.find((r) => r.id === l.productId); return { productId: l.productId, universeId: p?.universeId ?? null, lineTotal: (p?.price ?? 0) * l.quantity }; });
  const res = await evaluatePromo(code, promoLines, me?.id);
  if (!res.ok) return fail(res.reason);
  return ok({ discount: res.discount, freeShipping: res.freeShipping, label: res.label, code: res.promo.code }, "Code appliqué.");
}

export async function subscribeNewsletterAction(_prev: ActionResult | null, form: FormData): Promise<ActionResult> {
  const parsed = newsletterSchema.safeParse({ email: form.get("email") });
  if (!parsed.success) return fail("Adresse e-mail invalide.");
  await db.insert(newsletterSubscribers).values({ email: parsed.data.email }).onConflictDoNothing();
  return ok(undefined, "Merci, vous êtes inscrit(e).");
}

export async function createTicketAction(_prev: ActionResult | null, form: FormData): Promise<ActionResult> {
  if (!rateLimit(`ticket:${await clientKey()}`, 3, 600_000)) return fail(MESSAGES.rateLimited);
  const me = await getCurrentUser();
  const parsed = ticketSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return fail(MESSAGES.invalid, zodFieldErrors(parsed.error.issues));
  await db.insert(supportTickets).values({ ...parsed.data, orderNumber: parsed.data.orderNumber || null, userId: me?.id ?? null });
  return ok(undefined, "Message envoyé. Nous répondons sous 24 h ouvrées.");
}

export async function logSearchAction(query: string, resultsCount: number) {
  const q = query.trim().slice(0, 200);
  if (q.length < 2) return;
  const me = await getCurrentUser();
  try { await db.insert(searchEvents).values({ query: q.toLowerCase(), resultsCount, userId: me?.id ?? null }); } catch {}
}
