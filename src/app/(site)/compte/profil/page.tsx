import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { addresses } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { AddressList, PasswordForm, ProfileForm } from "@/components/account/profile-forms";
export const dynamic = "force-dynamic";
export default async function ProfilPage() {
  const user = (await getCurrentUser())!;
  const list = await db.select().from(addresses).where(eq(addresses.userId, user.id)).orderBy(desc(addresses.isDefault));
  return (
    <div className="space-y-14">
      <section><h2 className="mb-6 font-display text-display-sm text-ink">Informations</h2><ProfileForm user={user} /></section>
      <section><h2 className="mb-6 font-display text-display-sm text-ink">Adresses</h2><AddressList addresses={list} /></section>
      <section><h2 className="mb-6 font-display text-display-sm text-ink">Mot de passe</h2><PasswordForm /></section>
    </div>
  );
}
