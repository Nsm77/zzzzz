"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { ArrowRightIcon, CartIcon, ChevronDownIcon, ChevronRightIcon, CloseIcon, HeartIcon, LogoMark, MenuIcon, SearchIcon, UserIcon } from "@/components/icons";
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
          className="absolute -right-1 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center bg-champagne px-1 text-[9px] font-bold tabular-nums text-ink"
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
    const onScroll = () => setScrolled(window.scrollY > 8);
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
  const leave = () => { closeTimer.current = setTimeout(() => setMega(null), 160); };
  const active = universes.find((u) => u.id === mega);

  return (
    <>
      {/* Announcement — maison, not banner */}
      <div className="relative z-50 bg-noir text-center">
        <p className="container-lux flex min-h-9 items-center justify-center gap-6 overflow-hidden text-[10px] font-medium uppercase tracking-[0.22em] text-paper/75">
          <span className="hidden sm:inline text-champagne-3">Livraison offerte dès 99&nbsp;DT</span>
          <span aria-hidden="true" className="hidden sm:inline text-paper/25">·</span>
          <span>Conseil pharmaceutique à Ezzahra &amp; Hammam-Lif</span>
          <span aria-hidden="true" className="hidden sm:inline text-paper/25">·</span>
          <span className="hidden sm:inline">Paiement à la livraison</span>
        </p>
      </div>

      <header
        className={`sticky top-0 z-40 border-b transition-all duration-500 ${scrolled || mega !== null ? "border-stone bg-paper/92 shadow-whisper backdrop-blur-xl" : "border-transparent bg-paper"}`}
        onMouseLeave={leave}
      >
        <div className="container-lux flex h-16 items-center justify-between gap-4 lg:h-[72px]">
          {/* Mobile left */}
          <div className="flex items-center gap-1 lg:hidden">
            <button onClick={() => setMenuOpen(true)} aria-label="Ouvrir le menu" aria-expanded={menuOpen} className="flex h-11 w-11 items-center justify-center text-ink transition-colors hover:text-champagne-2"><MenuIcon /></button>
            <button onClick={() => setSearchOpen(true)} aria-label="Rechercher" className="flex h-11 w-11 items-center justify-center text-ink transition-colors hover:text-champagne-2"><SearchIcon /></button>
          </div>

          {/* Wordmark */}
          <Link href="/" className="group flex items-center gap-3 text-ink" aria-label="Cléopâtre — Espace Santé Beauté, accueil">
            <LogoMark size={30} className="text-champagne-2 transition-colors duration-500 group-hover:text-ink" />
            <span className="flex flex-col leading-none">
              <span className="font-display text-[23px] font-medium tracking-[0.015em]">Cléopâtre</span>
              <span className="mt-1 text-[8px] font-bold uppercase tracking-[0.34em] text-muted">Espace Santé Beauté</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-8 xl:gap-9 lg:flex" aria-label="Navigation principale">
            {universes.map((u, i) => (
              <div key={u.id} onMouseEnter={() => enter(u.id)} onFocus={() => enter(u.id)} className="relative">
                <Link
                  href={`/univers/${u.slug}`}
                  className={`flex h-[72px] items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] transition-colors duration-300 ${mega === u.id ? "text-champagne-2" : "text-charcoal hover:text-ink"}`}
                  aria-expanded={mega === u.id}
                  aria-haspopup="true"
                >
                  <span className="font-display text-xs italic text-muted-2">{String(i + 1).padStart(2, "0")}</span>
                  {u.name}
                  <ChevronDownIcon size={11} className={`transition-transform duration-500 ${mega === u.id ? "rotate-180" : ""}`} />
                </Link>
              </div>
            ))}
            <Link href="/promotions" onMouseEnter={() => setMega(null)} className="text-[11px] font-semibold uppercase tracking-[0.2em] text-champagne-2 transition-colors hover:text-ink">Offres</Link>
            <Link href="/journal" onMouseEnter={() => setMega(null)} className="text-[11px] font-semibold uppercase tracking-[0.2em] text-charcoal transition-colors hover:text-ink">Journal</Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-0.5">
            <button onClick={() => setSearchOpen(true)} aria-label="Rechercher (⌘K)" className="hidden h-11 items-center gap-2.5 px-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-charcoal transition-colors hover:text-ink lg:flex">
              <SearchIcon size={17} /> Rechercher
            </button>
            <div className="relative" onMouseEnter={() => { setMega(null); if (user) setAcct(true); }} onMouseLeave={() => setAcct(false)}>
              <Link href={user ? "/compte" : "/connexion"} aria-label={user ? "Mon compte" : "Se connecter"} className="flex h-11 w-11 items-center justify-center text-ink transition-colors hover:text-champagne-2" onFocus={() => user && setAcct(true)}>
                <UserIcon />
              </Link>
              <AnimatePresence>
                {acct && user && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE_LUXE } }} exit={{ opacity: 0, transition: tweenExit }} className="absolute right-0 top-full w-64 border border-stone bg-cream p-3 shadow-float">
                    <p className="border-b border-stone px-3 pb-3 text-xs text-muted">Bonjour, <span className="font-medium text-ink">{user.firstName} {user.lastName}</span></p>
                    <div className="py-1">
                      {[[user.role === "admin" || user.role === "support" ? "/admin" : "/compte", "Mon espace"], ["/compte/commandes", "Mes commandes"], ["/compte/favoris", "Mes favoris"], ["/compte/profil", "Profil & adresses"]].map(([h, l]) => (
                        <Link key={h} href={h} className="block px-3 py-2.5 text-sm text-charcoal transition-colors hover:bg-paper hover:text-ink">{l}</Link>
                      ))}
                    </div>
                    {(user.role === "admin" || user.role === "support") && <Link href="/admin" className="block border-t border-stone px-3 py-2.5 text-sm text-champagne-2">Administration</Link>}
                    <form action={logoutAction}><button className="block w-full px-3 py-2.5 text-left text-sm text-muted transition-colors hover:bg-paper hover:text-ink">Se déconnecter</button></form>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <Link href={user ? "/compte/favoris" : "/connexion?next=/compte/favoris"} aria-label="Favoris" className="relative hidden h-11 w-11 items-center justify-center text-ink transition-colors hover:text-champagne-2 sm:flex">
              <HeartIcon /><Badge n={wishlistCount} />
            </Link>
            <button onClick={open} aria-label={`Panier, ${count} article${count > 1 ? "s" : ""}`} className="relative flex h-11 w-11 items-center justify-center text-ink transition-colors hover:text-champagne-2">
              <CartIcon /><Badge n={count} />
            </button>
          </div>
        </div>

        {/* Mega menu */}
        <AnimatePresence>
          {active && (
            <motion.div
              key={active.id}
              initial={reduce ? false : { opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE_LUXE } }}
              exit={{ opacity: 0, transition: tweenExit }}
              onMouseEnter={() => enter(active.id)}
              className="absolute inset-x-0 top-full hidden border-b border-stone bg-paper/97 shadow-soft backdrop-blur-xl lg:block"
            >
              <div className="container-lux grid grid-cols-12 gap-12 py-12">
                {/* Editorial column */}
                <div className="col-span-4 border-r border-stone pr-12">
                  <p className="eyebrow mb-4">{active.children.length} catégories · univers n°{universes.findIndex((u) => u.id === active.id) + 1}</p>
                  <h3 className="font-display text-display-sm italic text-ink">{active.name}</h3>
                  <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted">{active.description}</p>
                  <Link href={`/univers/${active.slug}`} className="btn-secondary mt-8">
                    Explorer l&apos;univers <ArrowRightIcon size={14} />
                  </Link>
                </div>
                {/* Categories */}
                <motion.nav initial="hidden" animate="show" variants={{ hidden: {}, show: { transition: { staggerChildren: 0.045, delayChildren: 0.08 } } }} aria-label={`Catégories ${active.name}`} className="col-span-5 grid grid-cols-2 content-start gap-x-10 gap-y-1">
                  {active.children.map((c, i) => (
                    <motion.div key={c.id} variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE_LUXE } } }}>
                      <Link href={`/categorie/${c.slug}`} className="group flex items-baseline gap-3 py-2.5">
                        <span className="font-display text-xs italic text-champagne-2">{String(i + 1).padStart(2, "0")}</span>
                        <span className="link-underline text-[15px] text-charcoal group-hover:text-ink">{c.name}</span>
                      </Link>
                    </motion.div>
                  ))}
                </motion.nav>
                {/* Maison column */}
                <div className="col-span-3">
                  <p className="eyebrow mb-4">La maison</p>
                  <ul className="space-y-1 text-sm">
                    {[["/promotions", "Offres du moment"], ["/journal", "Le Journal — conseils"], ["/marques", "Nos marques"], ["/besoin/peau-sensible", "Par besoin"], ["/boutiques", "Nos boutiques"]].map(([h, l]) => (
                      <li key={h}><Link href={h} onMouseEnter={() => setMega(null)} className="block py-2 text-charcoal transition-colors hover:text-ink">{l}</Link></li>
                    ))}
                  </ul>
                  <p className="mt-6 border-t border-stone pt-4 text-xs leading-relaxed text-muted">Conseil pharmaceutique gratuit<br />71 450 210 · Ezzahra</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.button aria-label="Fermer le menu" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }} onClick={() => setMenuOpen(false)} className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-sm lg:hidden" />
            <motion.aside
              role="dialog" aria-modal="true" aria-label="Menu principal"
              initial={reduce ? false : { x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 190, damping: 32 }}
              className="fixed inset-y-0 left-0 z-[60] flex w-[88vw] max-w-md flex-col bg-paper shadow-drawer lg:hidden"
            >
              <div className="flex h-16 items-center justify-between border-b border-stone px-5">
                <span className="font-display text-[22px] text-ink">Cléopâtre</span>
                <button onClick={() => setMenuOpen(false)} aria-label="Fermer le menu" className="flex h-11 w-11 items-center justify-center text-ink"><CloseIcon /></button>
              </div>
              <div className="flex-1 overflow-y-auto px-6 py-6">
                <ul className="space-y-0.5">
                  {universes.map((u, i) => (
                    <li key={u.id}>
                      <details className="group border-b border-stone/70">
                        <summary className="flex min-h-13 cursor-pointer list-none items-center justify-between py-3.5 text-[17px] text-ink">
                          <span><span className="mr-3 font-display text-sm italic text-champagne-2">{String(i + 1).padStart(2, "0")}</span>{u.name}</span>
                          <ChevronDownIcon size={17} className="text-muted transition-transform duration-500 group-open:rotate-180" />
                        </summary>
                        <ul className="mb-4 space-y-0.5">
                          <li><Link href={`/univers/${u.slug}`} onClick={() => setMenuOpen(false)} className="flex min-h-11 items-center justify-between pl-9 text-[15px] font-medium text-champagne-2">Tout {u.name} <ArrowRightIcon size={13} /></Link></li>
                          {u.children.map((c) => <li key={c.id}><Link href={`/categorie/${c.slug}`} onClick={() => setMenuOpen(false)} className="block min-h-11 pl-9 text-[15px] text-charcoal">{c.name}</Link></li>)}
                        </ul>
                      </details>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 grid grid-cols-2 gap-x-4">
                  {([
                    { href: user ? "/compte" : "/connexion", label: "Mon compte", icon: UserIcon },
                    { href: user ? "/compte/favoris" : "/connexion?next=/compte/favoris", label: "Favoris", icon: HeartIcon },
                  ]).map(({ href, label, icon: Icon }) => (
                    <Link key={label} href={href} onClick={() => setMenuOpen(false)} className="flex min-h-13 items-center gap-3 border border-stone px-4 text-[12px] font-bold uppercase tracking-[0.1em] text-ink">
                      <Icon size={16} /> {label}
                    </Link>
                  ))}
                </div>
                <div className="mt-8 space-y-0.5 border-t border-stone pt-6">
                  <p className="eyebrow mb-3">Découvrir</p>
                  {[["/promotions", "Offres du moment"], ["/marques", "Marques"], ["/journal", "Journal"], ["/boutiques", "Nos boutiques"], ["/aide", "Aide & FAQ"]].map(([h, l]) => (
                    <Link key={h} href={h} onClick={() => setMenuOpen(false)} className="flex min-h-11 items-center justify-between text-[15px] text-charcoal"><span>{l}</span><ChevronRightIcon size={14} className="text-muted" /></Link>
                  ))}
                </div>
              </div>
              <div className="border-t border-stone p-5">
                {user
                  ? <Link href="/compte" onClick={() => setMenuOpen(false)} className="btn-secondary w-full">Mon espace client</Link>
                  : <Link href="/connexion" onClick={() => setMenuOpen(false)} className="btn-primary w-full">Se connecter</Link>}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
