"use server";
import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { addresses, users } from "@/db/schema";
import { createSession, destroySession, getCurrentUser, hashPassword, verifyPassword } from "@/lib/auth";
import { fail, MESSAGES, ok, zodFieldErrors, type ActionResult } from "@/lib/api";
import { clientKey, checkOrigin } from "@/lib/origin";
import { rateLimit } from "@/lib/rate-limit";
import { addressSchema, loginSchema, passwordChangeSchema, profileSchema, registerSchema } from "@/lib/validation";
import { audit } from "@/lib/orders";

export async function loginAction(_prev: ActionResult | null, form: FormData): Promise<ActionResult> {
  if (!(await checkOrigin())) return fail(MESSAGES.badOrigin);
  if (!rateLimit(`login:${await clientKey()}`, 8, 60_000)) return fail(MESSAGES.rateLimited);
  const parsed = loginSchema.safeParse({ email: form.get("email"), password: form.get("password") });
  if (!parsed.success) return fail(MESSAGES.invalid, zodFieldErrors(parsed.error.issues));
  const user = await db.query.users.findFirst({ where: eq(users.email, parsed.data.email) });
  const valid = user ? await verifyPassword(parsed.data.password, user.passwordHash) : await verifyPassword(parsed.data.password, "scrypt$00$00");
  if (!user || !valid) return fail("E-mail ou mot de passe incorrect.");
  await createSession(user.id, (await headers()).get("user-agent"));
  const next = String(form.get("next") || "");
  redirect(next.startsWith("/") ? next : user.role === "customer" ? "/compte" : "/admin");
}

export async function registerAction(_prev: ActionResult | null, form: FormData): Promise<ActionResult> {
  if (!(await checkOrigin())) return fail(MESSAGES.badOrigin);
  if (!rateLimit(`register:${await clientKey()}`, 5, 300_000)) return fail(MESSAGES.rateLimited);
  const parsed = registerSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return fail(MESSAGES.invalid, zodFieldErrors(parsed.error.issues));
  const exists = await db.query.users.findFirst({ where: eq(users.email, parsed.data.email) });
  if (exists) return fail("Un compte existe déjà avec cet e-mail.", { email: "E-mail déjà utilisé" });
  const [u] = await db.insert(users).values({ ...parsed.data, phone: parsed.data.phone || null, passwordHash: await hashPassword(parsed.data.password) }).returning();
  await createSession(u.id, (await headers()).get("user-agent"));
  redirect("/compte");
}

export async function logoutAction() {
  await destroySession();
  redirect("/");
}

export async function updateProfileAction(_prev: ActionResult | null, form: FormData): Promise<ActionResult> {
  const me = await getCurrentUser();
  if (!me) return fail(MESSAGES.unauthorized);
  const parsed = profileSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return fail(MESSAGES.invalid, zodFieldErrors(parsed.error.issues));
  await db.update(users).set({ ...parsed.data, phone: parsed.data.phone || null, updatedAt: new Date() }).where(eq(users.id, me.id));
  revalidatePath("/compte");
  return ok(undefined, "Profil mis à jour.");
}

export async function changePasswordAction(_prev: ActionResult | null, form: FormData): Promise<ActionResult> {
  const me = await getCurrentUser();
  if (!me) return fail(MESSAGES.unauthorized);
  const parsed = passwordChangeSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return fail(MESSAGES.invalid, zodFieldErrors(parsed.error.issues));
  const full = await db.query.users.findFirst({ where: eq(users.id, me.id) });
  if (!full || !(await verifyPassword(parsed.data.current, full.passwordHash))) return fail("Mot de passe actuel incorrect.", { current: "Incorrect" });
  await db.update(users).set({ passwordHash: await hashPassword(parsed.data.next), updatedAt: new Date() }).where(eq(users.id, me.id));
  return ok(undefined, "Mot de passe modifié.");
}

export async function saveAddressAction(_prev: ActionResult | null, form: FormData): Promise<ActionResult> {
  const me = await getCurrentUser();
  if (!me) return fail(MESSAGES.unauthorized);
  const parsed = addressSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return fail(MESSAGES.invalid, zodFieldErrors(parsed.error.issues));
  const id = Number(form.get("id") || 0);
  const data = { ...parsed.data, line2: parsed.data.line2 || null, postalCode: parsed.data.postalCode || null, label: String(form.get("label") || "Domicile"), isDefault: form.get("isDefault") === "on" };
  if (data.isDefault) await db.update(addresses).set({ isDefault: false }).where(eq(addresses.userId, me.id));
  if (id) await db.update(addresses).set({ ...data, updatedAt: new Date() }).where(and(eq(addresses.id, id), eq(addresses.userId, me.id)));
  else await db.insert(addresses).values({ ...data, userId: me.id });
  revalidatePath("/compte/profil");
  return ok(undefined, "Adresse enregistrée.");
}

export async function deleteAddressAction(id: number): Promise<ActionResult> {
  const me = await getCurrentUser();
  if (!me) return fail(MESSAGES.unauthorized);
  await db.delete(addresses).where(and(eq(addresses.id, id), eq(addresses.userId, me.id)));
  await audit(me.id, "address.delete", "address", id);
  revalidatePath("/compte/profil");
  return ok(undefined, "Adresse supprimée.");
}
