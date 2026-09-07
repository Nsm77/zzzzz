import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth";
import { logoutAction } from "@/actions/auth";
import { AdminNav } from "@/components/admin/admin-nav";
import { ExternalIcon, LogoMark, LogoutIcon } from "@/components/icons";
export const metadata: Metadata = { title: { default: "Administration", template: "%s — Admin Cléopâtre" }, robots: { index: false, follow: false } };
export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/connexion?next=/admin");
  if (user.role !== "admin" && user.role !== "support") redirect("/compte");
  return (
    <div className="min-h-dvh bg-admin-bg text-admin-text">
      <header className="border-b border-admin-border"><div className="mx-auto flex h-14 max-w-[100rem] items-center justify-between px-4 lg:px-8"><Link href="/admin" className="flex items-center gap-3"><LogoMark size={24} /><span className="font-display text-lg">Cléopâtre</span><span className="text-[10px] uppercase tracking-[0.2em] text-admin-muted">Admin</span></Link><div className="flex items-center gap-5 text-xs text-admin-muted"><span className="hidden sm:inline">{user.firstName} · {user.role}</span><Link href="/" className="flex min-h-11 items-center gap-1.5 hover:text-admin-text"><ExternalIcon size={14} /> Voir le site</Link><form action={logoutAction}><button className="flex min-h-11 items-center gap-1.5 hover:text-admin-text"><LogoutIcon size={14} /> Quitter</button></form></div></div></header>
      <div className="mx-auto grid max-w-[100rem] gap-8 px-4 py-6 lg:grid-cols-[200px_1fr] lg:px-8 lg:py-8"><AdminNav role={user.role} /><main className="min-w-0">{children}</main></div>
    </div>
  );
}
