"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { CartIcon, ChevronDownIcon, CloseIcon, HeartIcon, LogoMark, MenuIcon, SearchIcon, UserIcon } from "@/components/icons";
import { useCart } from "@/components/cart/cart-provider";
import type { SafeUser } from "@/lib/auth";
import { EASE_LUXE, tweenExit } from "@/lib/motion";
import { logoutAction } from "@/actions/auth";
import { SearchOverlay } from "./search-overlay";

export type NavUniverse = { id: number; slug: string; name: string; description: string | null; children: { id: number; slug: string; name: string }[] };

function Badge({ n }: { n: number }) {
  const reduce = useReducedMotion();
  return (
    <AnimatePresence>
      {n > 0 && (
        <motion.span
          key={n}
          initial={reduce ? false : { scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1, transition: { type: "spring", stiffness: 260, damping: 22 } }}
          exit={{ scale: 0.6, opacity: 0, transition: tweenExit }}
          className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center bg-ink px-1 text-[9px] font-medium tabular-nums text-paper"
        >
          {n}
        </motion.span>
      )}
    </AnimatePresence>
  );
}

export function Header({ universes, user, wishlistCount }: { universes: NavUniverse[]; user: SafeUser | null; wishlistCount: number }) {
  const { count, open } = useCart();
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mega, setMega] = useState<number | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [acct, setAcct] = useState(false);
  const pathname = usePathname();
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reduce = useReducedMotion();

  useEffect(() => { setMenuOpen(false); setMega(null); setAcct(false); }, [pathname]);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setSearchOpen(true); }
      if (e.key === "Escape") { setMega(null); setAcct(false); setMenuOpen(false); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  useEffect(() => { document.body.style.overflow = menuOpen ? "hidden" : ""; return () => { document.body.style.overflow = ""; }; }, [menuOpen]);

  const enter = (id: number) => { if (closeTimer.current) clearTimeout(closeTimer.current); setMega(id); };
  const leave = () => { closeTimer.current = setTimeout(() => setMega(null), 140); };
  const active = universes.find((u) => u.id === mega);

  return (
    <>
      <div className="bg-ink text-center text-[11px] uppercase tracking-[0.18em] text-paper/90">
        <p className="container-lux py-2">Livraison offerte dès 99 DT · Paiement à la livraison · Ezzahra & Hammam-Lif</p>
      </div>
      <header
        className={`sticky top-0 z-40 border-b transition-[background-color,border-color,box-shadow] duration-500 ${scrolled || mega !== null ? "border-stone bg-paper/85 shadow-whisper backdrop-blur-xl" : "border-transparent bg-paper"}`}
        onMouseLeave={leave}
      >
        <div className="container-lux flex h-16 items-center justify-between gap-4 lg:h-20">
          <div className="flex items-center gap-2 lg:hidden">
            <button onClick={() => setMenuOpen(true)} aria-label="Ouvrir le menu" aria-expanded={menuOpen} className="flex h-11 w-11 items-center justify-center text-ink"><MenuIcon /></button>
            <button onClick={() => setSearchOpen(true)} aria-label="Rechercher" className="flex h-11 w-11 items-center justify-center text-ink"><SearchIcon /></button>
          </div>

          <Link href="/" className="flex items-center gap-3 text-ink" aria-label="Cléopâtre — Accueil">
            <LogoMark size={30} />
            <span className="hidden flex-col leading-none sm:flex">
              <span className="font-display text-[22px] font-medium tracking-[0.02em]">Cléopâtre</span>
              <span className="mt-1 text-[9px] uppercase tracking-[0.3em] text-muted">Espace Santé Beauté</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-7 lg:flex" aria-label="Navigation principale">
            {universes.map((u) => (
              <div key={u.id} onMouseEnter={() => enter(u.id)} onFocus={() => enter(u.id)} className="relative">
                <Link href={`/univers/${u.slug}`} className={`flex h-20 items-center gap-1 text-[12px] uppercase tracking-[0.16em] transition-colors ${mega === u.id ? "text-champagne-2" : "text-charcoal hover:text-ink"}`} aria-expanded={mega === u.id} aria-haspopup="true">
                  {u.name} <ChevronDownIcon size={12} className={`transition-transform duration-500 ${mega === u.id ? "rotate-180" : ""}`} />
                </Link>
              </div>
            ))}
            <Link href="/promotions" onMouseEnter={() => setMega(null)} className="text-[12px] uppercase tracking-[0.16em] text-champagne-2 hover:text-ink">Offres</Link>
            <Link href="/journal" onMouseEnter={() => setMega(null)} className="text-[12px] uppercase tracking-[0.16em] text-charcoal hover:text-ink">Journal</Link>
          </nav>

          <div className="flex items-center gap-1">
            <button onClick={() => setSearchOpen(true)} aria-label="Rechercher (⌘K)" className="hidden h-11 items-center gap-2 px-3 text-[12px] uppercase tracking-[0.16em] text-charcoal hover:text-ink lg:flex">
              <SearchIcon size={18} /> Rechercher
            </button>
            <div className="relative" onMouseEnter={() => { setMega(null); if (user) setAcct(true); }} onMouseLeave={() => setAcct(false)}>
              <Link href={user ? "/compte" : "/connexion"} aria-label={user ? "Mon compte" : "Se connecter"} className="flex h-11 w-11 items-center justify-center text-ink" onFocus={() => user && setAcct(true)}>
                <UserIcon />
              </Link>
              <AnimatePresence>
                {acct && user && (
                  <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE_LUXE } }} exit={{ opacity: 0, transition: tweenExit }} className="absolute right-0 top-full w-56 border border-stone bg-cream p-2 shadow-float">
                    <p className="px-3 py-2 text-xs text-muted">Bonjour, <span className="text-ink">{user.firstName}</span></p>
                    {[["/compte", "Mon compte"], ["/compte/commandes", "Mes commandes"], ["/compte/favoris", "Mes favoris"]].map(([h, l]) => (
                      <Link key={h} href={h} className="block px-3 py-2 text-sm text-charcoal hover:bg-paper hover:text-ink">{l}</Link>
                    ))}
                    {(user.role === "admin" || user.role === "support") && <Link href="/admin" className="block px-3 py-2 text-sm text-champagne-2 hover:bg-paper">Administration</Link>}
                    <form action={logoutAction}><button className="block w-full px-3 py-2 text-left text-sm text-muted hover:bg-paper hover:text-ink">Se déconnecter</button></form>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <Link href={user ? "/compte/favoris" : "/connexion?next=/compte/favoris"} aria-label="Favoris" className="relative hidden h-11 w-11 items-center justify-center text-ink sm:flex">
              <HeartIcon /><Badge n={wishlistCount} />
            </Link>
            <button onClick={open} aria-label={`Panier, ${count} article${count > 1 ? "s" : ""}`} className="relative flex h-11 w-11 items-center justify-center text-ink">
              <CartIcon /><Badge n={count} />
            </button>
          </div>
        </div>

        <AnimatePresence>
          {active && (
            <motion.div
              key={active.id}
              initial={reduce ? false : { opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE_LUXE } }}
              exit={{ opacity: 0, transition: tweenExit }}
              onMouseEnter={() => enter(active.id)}
              className="absolute inset-x-0 top-full hidden border-b border-stone bg-paper/95 backdrop-blur-xl lg:block"
            >
              <div className="container-lux grid grid-cols-12 gap-10 py-10">
                <div className="col-span-4">
                  <p className="eyebrow mb-3">Univers</p>
                  <h3 className="font-display text-display-sm text-ink">{active.name}</h3>
                  <p className="mt-2 max-w-xs text-sm text-muted">{active.description}</p>
                  <Link href={`/univers/${active.slug}`} className="btn-ghost mt-6">Découvrir l&apos;univers</Link>
                </div>
                <motion.ul initial="hidden" animate="show" variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05, delayChildren: 0.1 } } }} className="col-span-8 grid grid-cols-3 gap-x-8 gap-y-3">
                  {active.children.map((c) => (
                    <motion.li key={c.id} variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE_LUXE } } }}>
                      <Link href={`/categorie/${c.slug}`} className="link-underline inline-block py-1.5 text-[15px] text-charcoal hover:text-ink">{c.name}</Link>
                    </motion.li>
                  ))}
                </motion.ul>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.button aria-label="Fermer le menu" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }} onClick={() => setMenuOpen(false)} className="fixed inset-0 z-50 bg-ink/30 backdrop-blur-sm lg:hidden" />
            <motion.aside
              role="dialog" aria-modal="true" aria-label="Menu"
              initial={reduce ? false : { x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 180, damping: 30 }}
              className="fixed inset-y-0 left-0 z-[60] flex w-[86vw] max-w-sm flex-col bg-paper shadow-drawer lg:hidden"
            >
              <div className="flex h-16 items-center justify-between border-b border-stone px-5">
                <span className="font-display text-xl text-ink">Cléopâtre</span>
                <button onClick={() => setMenuOpen(false)} aria-label="Fermer" className="flex h-11 w-11 items-center justify-center"><CloseIcon /></button>
              </div>
              <nav className="flex-1 overflow-y-auto px-5 py-6">
                <ul className="space-y-1">
                  {universes.map((u) => (
                    <li key={u.id}>
                      <details className="group">
                        <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between text-[15px] text-ink">
                          {u.name} <ChevronDownIcon size={16} className="transition-transform duration-500 group-open:rotate-180" />
                        </summary>
                        <ul className="mb-3 ml-3 border-l border-stone pl-4">
                          <li><Link href={`/univers/${u.slug}`} className="block py-2.5 text-sm text-champagne-2">Tout {u.name}</Link></li>
                          {u.children.map((c) => <li key={c.id}><Link href={`/categorie/${c.slug}`} className="block py-2.5 text-sm text-charcoal">{c.name}</Link></li>)}
                        </ul>
                      </details>
                    </li>
                  ))}
                </ul>
                <div className="mt-6 space-y-1 border-t border-stone pt-6">
                  {[["/promotions", "Offres"], ["/marques", "Marques"], ["/journal", "Journal"], ["/boutiques", "Nos boutiques"], ["/aide", "Aide"], [user ? "/compte/favoris" : "/connexion", "Favoris"]].map(([h, l]) => (
                    <Link key={h} href={h} className="block min-h-12 py-3 text-[15px] text-charcoal">{l}</Link>
                  ))}
                </div>
              </nav>
              <div className="border-t border-stone p-5">
                {user ? <Link href="/compte" className="btn-secondary w-full">Mon compte</Link> : <Link href="/connexion" className="btn-primary w-full">Se connecter</Link>}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
