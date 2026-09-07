import Link from "next/link";
import { SearchIcon } from "@/components/icons";
import { Reveal } from "@/components/motion/reveal";
export default function NotFound() {
  return (
    <div className="container-lux flex min-h-[70vh] flex-col items-center justify-center text-center">
      <Reveal><span className="mx-auto flex h-14 w-14 items-center justify-center border border-stone text-muted"><SearchIcon size={22} /></span><p className="eyebrow mt-8 mb-4">404</p><h1 className="font-display text-display-md text-ink">Cette page n&apos;existe pas</h1><p className="mt-3 max-w-sm text-sm text-muted">Le lien est peut-être ancien, ou le produit n&apos;est plus référencé.</p><div className="mt-8 flex justify-center gap-3"><Link href="/boutique" className="btn-primary">Voir la boutique</Link><Link href="/" className="btn-secondary">Accueil</Link></div></Reveal>
    </div>
  );
}
