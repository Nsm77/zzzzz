"use client";
import { motion, useReducedMotion } from "framer-motion";
import { EASE_LUXE } from "@/lib/motion";

export function HeroText() {
  const reduce = useReducedMotion();
  const lines = ["La beauté", "se soigne", "avec justesse."];
  return (
    <div>
      <motion.p initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, ease: EASE_LUXE }} className="eyebrow mb-6">Parapharmacie premium · Tunisie</motion.p>
      <h1 className="font-display text-display-lg text-ink sm:text-display-xl">
        {lines.map((l, i) => (
          <span key={l} className="block overflow-hidden">
            <motion.span initial={reduce ? false : { y: "100%", opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 1.1, ease: EASE_LUXE, delay: 0.15 + i * 0.12 }} className={`block ${i === 2 ? "italic text-champagne-2" : ""}`} style={{ willChange: "transform, opacity" }}>{l}</motion.span>
          </span>
        ))}
      </h1>
      <motion.p initial={reduce ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease: EASE_LUXE, delay: 0.6 }} className="mt-7 max-w-md text-[15px] leading-relaxed text-muted sm:text-base">
        Dermo-cosmétique, solaire, compléments : une sélection resserrée de produits authentiques, conseillée par nos pharmaciens d&apos;Ezzahra et Hammam-Lif.
      </motion.p>
    </div>
  );
}
