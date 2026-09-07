"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { WarningIcon } from "@/components/icons";
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="container-lux flex min-h-[70vh] flex-col items-center justify-center text-center">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}>
        <span className="mx-auto flex h-14 w-14 items-center justify-center border border-stone text-muted"><WarningIcon size={22} /></span>
        <p className="eyebrow mt-8 mb-4">Erreur</p><h1 className="font-display text-display-md text-ink">Un imprévu est survenu</h1><p className="mt-3 max-w-sm text-sm text-muted">Nous en avons été informés. Vous pouvez réessayer ou revenir à l&apos;accueil.</p>
        <div className="mt-8 flex justify-center gap-3"><button onClick={reset} className="btn-primary">Réessayer</button><Link href="/" className="btn-secondary">Accueil</Link></div>
      </motion.div>
    </div>
  );
}
