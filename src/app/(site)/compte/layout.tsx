import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { getCurrentUser } from "@/lib/auth";
import { logoutAction } from "@/actions/auth";
import { AccountNav } from "@/components/account/account-nav";
export default async function CompteLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/connexion?next=/compte");
  return (
    <div className="container-lux py-10 lg:py-14">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4"><div><p className="eyebrow mb-3">Mon compte</p><h1 className="font-display text-display-md text-ink">Bonjour {user.firstName}</h1></div>
        <div className="flex items-center gap-4 text-sm">{(user.role === "admin" || user.role === "support") && <Link href="/admin" className="text-champagne-2 hover:text-ink">Administration</Link>}<form action={logoutAction}><button className="min-h-11 text-muted hover:text-ink">Se déconnecter</button></form></div></div>
      <div className="grid gap-10 lg:grid-cols-12"><AccountNav /><div className="lg:col-span-9">{children}</div></div>
    </div>
  );
}
