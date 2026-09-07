"use client";
import Link from "next/link";
import { useActionState } from "react";
import { LogoMark, MailIcon, PhoneIcon, ShieldIcon, TruckIcon, CashIcon, CardIcon, BankIcon } from "@/components/icons";
import { subscribeNewsletterAction } from "@/actions/shop";
import type { Store } from "@/db/schema";

export function Footer({ universes, stores }: { universes: { slug: string; name: string }[]; stores: Store[] }) {
  const [state, action, pending] = useActionState(subscribeNewsletterAction, null);
  return (
    <footer className="border-t border-stone bg-paper-2">
      <div className="container-lux grid gap-12 py-16 lg:grid-cols-12 lg:py-20">
        <div className="lg:col-span-4">
          <div className="flex items-center gap-3 text-ink"><LogoMark size={30} /><span className="font-display text-2xl">Cléopâtre</span></div>
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-muted">Parapharmacie premium à Ezzahra et Hammam-Lif. Des produits authentiques, sélectionnés et conseillés par nos pharmaciens, livrés partout en Tunisie.</p>
          <form action={action} className="mt-8 max-w-sm">
            <label htmlFor="nl" className="eyebrow mb-3 block">Le Journal, chaque mois</label>
            <div className="flex">
              <input id="nl" name="email" type="email" required placeholder="Votre e-mail" className="field border-r-0" />
              <button disabled={pending} className="btn-primary shrink-0 px-5" aria-label="S'inscrire"><MailIcon size={16} /></button>
            </div>
            {state && <p className={`mt-2 text-xs ${state.ok ? "text-success" : "text-error"}`} role="status">{state.ok ? state.message : state.error}</p>}
          </form>
        </div>
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-8">
          <div>
            <p className="eyebrow mb-4">Univers</p>
            <ul className="space-y-2.5 text-sm">{universes.map((u) => <li key={u.slug}><Link href={`/univers/${u.slug}`} className="text-charcoal hover:text-ink">{u.name}</Link></li>)}<li><Link href="/marques" className="text-charcoal hover:text-ink">Toutes les marques</Link></li></ul>
          </div>
          <div>
            <p className="eyebrow mb-4">Services</p>
            <ul className="space-y-2.5 text-sm">{[["/livraison", "Livraison & retours"], ["/suivi", "Suivre ma commande"], ["/aide", "Aide & FAQ"], ["/compte", "Mon compte"], ["/journal", "Journal"], ["/cgv", "CGV"], ["/confidentialite", "Confidentialité"]].map(([h, l]) => <li key={h}><Link href={h} className="text-charcoal hover:text-ink">{l}</Link></li>)}</ul>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <p className="eyebrow mb-4">Nos boutiques</p>
            <ul className="space-y-5 text-sm">
              {stores.map((s) => (
                <li key={s.id}>
                  <p className="text-ink">{s.name}</p>
                  <p className="text-muted">{s.address}</p>
                  <p className="text-xs text-muted-2">{s.hours}</p>
                  <a href={`tel:+216${s.phone}`} className="mt-1.5 inline-flex min-h-11 items-center gap-2 text-charcoal hover:text-ink"><PhoneIcon size={14} className="text-champagne-2" /> {s.phone.replace(/(\d{2})(\d{3})(\d{3})/, "$1 $2 $3")}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      <div className="border-t border-stone">
        <div className="container-lux flex flex-col gap-5 py-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <span className="flex items-center gap-1.5"><ShieldIcon size={14} /> Produits authentiques</span>
            <span className="flex items-center gap-1.5"><TruckIcon size={14} /> Livraison 24–72 h</span>
            <span className="flex items-center gap-1.5"><CashIcon size={14} /> Paiement à la livraison</span>
            <span className="flex items-center gap-1.5"><BankIcon size={14} /> Virement</span>
            <span className="flex items-center gap-1.5"><CardIcon size={14} /> Carte (bientôt)</span>
          </div>
          <p>© {new Date().getFullYear()} Cléopâtre — Espace Santé Beauté. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
}
