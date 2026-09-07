import Link from "next/link";
import type { ReactNode } from "react";
import { ChevronRightIcon, MinusIcon, PlusIcon } from "@/components/icons";
import { cn } from "@/lib/utils";

export function SectionHeading({ eyebrow, title, description, action, align = "left", className }: { eyebrow?: string; title: string; description?: string; action?: { href: string; label: string }; align?: "left" | "center"; className?: string }) {
  return (
    <div className={cn("flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between", align === "center" && "sm:flex-col sm:items-center sm:text-center", className)}>
      <div className="max-w-2xl">
        {eyebrow && <p className="eyebrow mb-4">{eyebrow}</p>}
        <h2 className="font-display text-display-md text-ink">{title}</h2>
        {description && <p className="mt-3 text-[15px] leading-relaxed text-muted">{description}</p>}
      </div>
      {action && (
        <Link href={action.href} className="btn-ghost shrink-0">
          {action.label} <ChevronRightIcon size={14} />
        </Link>
      )}
    </div>
  );
}

export function Breadcrumbs({ items }: { items: { href?: string; label: string }[] }) {
  return (
    <nav aria-label="Fil d'Ariane" className="text-xs text-muted">
      <ol className="flex flex-wrap items-center gap-1.5">
        <li><Link href="/" className="hover:text-ink">Accueil</Link></li>
        {items.map((it, i) => (
          <li key={i} className="flex items-center gap-1.5">
            <ChevronRightIcon size={12} className="text-sand-2" />
            {it.href ? <Link href={it.href} className="hover:text-ink">{it.label}</Link> : <span className="text-ink" aria-current="page">{it.label}</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function EmptyState({ icon, title, description, action }: { icon: ReactNode; title: string; description?: string; action?: { href: string; label: string } }) {
  return (
    <div className="flex flex-col items-center justify-center border border-dashed border-stone-2 px-6 py-20 text-center">
      <div className="mb-5 flex h-14 w-14 items-center justify-center border border-stone text-muted">{icon}</div>
      <h3 className="font-display text-display-sm text-ink">{title}</h3>
      {description && <p className="mt-2 max-w-sm text-sm text-muted">{description}</p>}
      {action && <Link href={action.href} className="btn-secondary mt-8">{action.label}</Link>}
    </div>
  );
}

export function Badge({ children, tone = "neutral", className }: { children: ReactNode; tone?: "neutral" | "accent" | "success" | "warning" | "error" | "ink"; className?: string }) {
  const tones = {
    neutral: "bg-stone text-charcoal", accent: "bg-champagne-soft text-champagne-2", success: "bg-success-soft text-success",
    warning: "bg-warning-soft text-warning", error: "bg-error-soft text-error", ink: "bg-ink text-paper",
  };
  return <span className={cn("inline-flex items-center px-2 py-1 text-[10px] font-medium uppercase tracking-[0.16em]", tones[tone], className)}>{children}</span>;
}

export function QtyStepper({ value, onChange, max = 20, min = 1, size = "md" }: { value: number; onChange: (v: number) => void; max?: number; min?: number; size?: "sm" | "md" }) {
  const h = size === "sm" ? "h-10" : "h-12";
  const w = size === "sm" ? "w-10" : "w-12";
  return (
    <div className={cn("inline-flex items-center border border-stone-2 bg-cream", h)} role="group" aria-label="Quantité">
      <button type="button" onClick={() => onChange(value - 1)} disabled={value <= min} aria-label="Diminuer" className={cn("flex items-center justify-center text-ink disabled:opacity-30", w, h)}><MinusIcon size={14} /></button>
      <span className="min-w-8 text-center text-sm tabular-nums" aria-live="polite">{value}</span>
      <button type="button" onClick={() => onChange(value + 1)} disabled={value >= max} aria-label="Augmenter" className={cn("flex items-center justify-center text-ink disabled:opacity-30", w, h)}><PlusIcon size={14} /></button>
    </div>
  );
}

export function Steps({ steps, current }: { steps: string[]; current: number }) {
  return (
    <ol className="flex items-center gap-2" aria-label="Étapes">
      {steps.map((s, i) => {
        const done = i < current, active = i === current;
        return (
          <li key={s} className="flex flex-1 items-center gap-2">
            <span className={cn("flex h-7 w-7 shrink-0 items-center justify-center border text-[11px] tabular-nums transition-colors duration-500", done ? "border-ink bg-ink text-paper" : active ? "border-champagne text-ink" : "border-stone-2 text-muted-2")} aria-current={active ? "step" : undefined}>{i + 1}</span>
            <span className={cn("hidden text-xs uppercase tracking-[0.14em] sm:block", active ? "text-ink" : "text-muted-2")}>{s}</span>
            {i < steps.length - 1 && <span className={cn("h-px flex-1 transition-colors duration-700", done ? "bg-ink" : "bg-stone")} />}
          </li>
        );
      })}
    </ol>
  );
}

export function Field({ label, error, children, hint, htmlFor }: { label: string; error?: string; children: ReactNode; hint?: string; htmlFor?: string }) {
  return (
    <label className="block" htmlFor={htmlFor}>
      <span className="mb-1.5 block text-xs uppercase tracking-[0.14em] text-muted">{label}</span>
      {children}
      {hint && !error && <span className="mt-1 block text-xs text-muted-2">{hint}</span>}
      {error && <span className="mt-1 block text-xs text-error" role="alert">{error}</span>}
    </label>
  );
}

export function ProductGridSkeleton({ n = 8 }: { n?: number }) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: n }).map((_, i) => (
        <div key={i}>
          <div className="skeleton aspect-[4/5]" />
          <div className="skeleton mt-4 h-3 w-1/3" />
          <div className="skeleton mt-2 h-4 w-3/4" />
          <div className="skeleton mt-3 h-4 w-1/4" />
        </div>
      ))}
    </div>
  );
}
