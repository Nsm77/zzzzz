import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/ui/primitives";
import { ContactForm } from "@/components/shell/contact-form";
export const metadata: Metadata = { title: "Aide & FAQ", description: "Questions fréquentes : livraison, paiement, retours, authenticité." };
const FAQ = [
  ["Quels sont les délais de livraison ?", "24 à 48 h sur le Grand Tunis, 48 à 72 h ailleurs en Tunisie. Les commandes passées avant 14 h partent le jour même (hors dimanche)."],
  ["Quels moyens de paiement acceptez-vous ?", "Le paiement à la livraison (espèces), le virement bancaire et prochainement la carte bancaire. Les cartes cadeaux Cléopâtre sont acceptées en ligne et en boutique."],
  ["Les produits sont-ils authentiques ?", "Oui. Nous nous approvisionnons exclusivement auprès des laboratoires et distributeurs officiels en Tunisie. Chaque produit porte son numéro de lot et sa date de péremption."],
  ["Puis-je retirer ma commande en boutique ?", "Oui, choisissez « Click & Collect » lors de la commande. Elle sera prête sous 2 h à Ezzahra ou Hammam-Lif, sans frais."],
  ["Comment retourner un produit ?", "Vous disposez de 7 jours après réception pour demander un retour depuis votre compte, pour tout produit non ouvert. Nous vous recontactons sous 48 h."],
  ["Puis-je annuler ma commande ?", "Oui, tant qu'elle n'est pas en préparation, directement depuis « Mes commandes ». Les articles sont remis en stock immédiatement."],
];
export default function AidePage() {
  const ld = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: FAQ.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) };
  return (
    <div className="container-lux py-10 lg:py-14">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <Breadcrumbs items={[{ label: "Aide" }]} />
      <header className="mt-6 mb-12 max-w-2xl"><p className="eyebrow mb-4">Aide & FAQ</p><h1 className="font-display text-display-lg text-ink">Nous sommes là</h1><p className="mt-4 text-[15px] text-muted">Les réponses aux questions les plus fréquentes. Et si vous ne trouvez pas, écrivez-nous.</p></header>
      <div className="grid gap-16 lg:grid-cols-12">
        <div className="lg:col-span-7"><div className="divide-y divide-stone border-y border-stone">{FAQ.map(([q, a]) => <details key={q} className="group py-4"><summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-6 text-[15px] text-ink">{q}<span className="text-xl text-muted transition-transform duration-500 group-open:rotate-45">+</span></summary><p className="pb-2 pt-1 text-sm leading-relaxed text-charcoal">{a}</p></details>)}</div></div>
        <div className="lg:col-span-5"><ContactForm /></div>
      </div>
    </div>
  );
}
