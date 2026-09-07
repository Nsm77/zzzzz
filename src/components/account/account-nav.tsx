"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { HeartIcon, HomeIcon, PackageIcon, UserIcon } from "@/components/icons";
const items = [{ href: "/compte", l: "Tableau de bord", i: HomeIcon }, { href: "/compte/commandes", l: "Mes commandes", i: PackageIcon }, { href: "/compte/favoris", l: "Mes favoris", i: HeartIcon }, { href: "/compte/profil", l: "Profil & adresses", i: UserIcon }];
export function AccountNav() {
  const p = usePathname();
  return (
    <nav className="lg:col-span-3" aria-label="Compte"><ul className="flex gap-1 overflow-x-auto scrollbar-none lg:flex-col">{items.map((it) => { const active = it.href === "/compte" ? p === it.href : p.startsWith(it.href); return <li key={it.href} className="shrink-0"><Link href={it.href} aria-current={active ? "page" : undefined} className={`flex min-h-11 items-center gap-3 px-4 text-sm transition-colors ${active ? "bg-ink text-paper" : "text-charcoal hover:bg-stone/60 hover:text-ink"}`}><it.i size={16} />{it.l}</Link></li>; })}</ul></nav>
  );
}
