"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookIcon, BoxesIcon, ChartIcon, ChatIcon, HomeIcon, ListIcon, PackageIcon, SearchIcon, StarIcon, StoreIcon, TagIcon, UsersIcon } from "@/components/icons";
const items = [
  { href: "/admin", l: "Tableau de bord", i: HomeIcon }, { href: "/admin/commandes", l: "Commandes", i: PackageIcon }, { href: "/admin/produits", l: "Produits", i: BoxesIcon },
  { href: "/admin/stock", l: "Stock", i: ChartIcon }, { href: "/admin/clients", l: "Clients", i: UsersIcon }, { href: "/admin/promotions", l: "Promotions", i: TagIcon, admin: true },
  { href: "/admin/avis", l: "Avis", i: StarIcon }, { href: "/admin/support", l: "Support", i: ChatIcon }, { href: "/admin/recherches", l: "Recherches", i: SearchIcon },
  { href: "/admin/journal", l: "Journal", i: BookIcon, admin: true }, { href: "/admin/boutiques", l: "Boutiques", i: StoreIcon, admin: true }, { href: "/admin/audit", l: "Audit", i: ListIcon, admin: true },
];
export function AdminNav({ role }: { role: string }) {
  const p = usePathname();
  return (
    <nav aria-label="Administration"><ul className="flex gap-1 overflow-x-auto scrollbar-none lg:flex-col">{items.filter((i) => !i.admin || role === "admin").map((it) => { const active = it.href === "/admin" ? p === it.href : p.startsWith(it.href); return <li key={it.href} className="shrink-0"><Link href={it.href} aria-current={active ? "page" : undefined} className={`flex min-h-11 items-center gap-3 px-3 text-[13px] transition-colors ${active ? "bg-admin-panel text-admin-text" : "text-admin-muted hover:text-admin-text"}`}><it.i size={15} />{it.l}</Link></li>; })}</ul></nav>
  );
}
