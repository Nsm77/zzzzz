import type { ReactNode } from "react";
import { ORDER_STATUS_LABELS } from "@/lib/order-constants";
import type { OrderStatus } from "@/db/schema";
import { cn } from "@/lib/utils";
export function AdminPage({ title, sub, action, children }: { title: string; sub?: string; action?: ReactNode; children: ReactNode }) {
  return (<div><div className="mb-8 flex flex-wrap items-end justify-between gap-4"><div><h1 className="font-display text-display-sm">{title}</h1>{sub && <p className="mt-1 text-sm text-admin-muted">{sub}</p>}</div>{action}</div>{children}</div>);
}
export function Panel({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("border border-admin-border bg-admin-panel", className)}>{children}</div>;
}
export function Table({ head, children }: { head: string[]; children: ReactNode }) {
  return (<div className="overflow-x-auto border border-admin-border"><table className="w-full min-w-[640px] text-sm"><thead><tr className="border-b border-admin-border bg-admin-panel text-left text-[10px] uppercase tracking-[0.16em] text-admin-muted">{head.map((h) => <th key={h} className="px-4 py-3 font-medium">{h}</th>)}</tr></thead><tbody className="divide-y divide-admin-border">{children}</tbody></table></div>);
}
const tones: Record<OrderStatus, string> = { pending: "bg-warning-soft text-warning", confirmed: "bg-champagne-soft text-champagne-2", preparing: "bg-champagne-soft text-champagne-2", shipped: "bg-stone text-charcoal", delivered: "bg-success-soft text-success", cancelled: "bg-error-soft text-error", returned: "bg-error-soft text-error" };
export function StatusBadge({ s }: { s: OrderStatus }) {
  return <span className={cn("inline-flex px-2 py-1 text-[10px] uppercase tracking-[0.14em]", tones[s])}>{ORDER_STATUS_LABELS[s]}</span>;
}
export function KPI({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (<Panel className="p-5"><p className="text-[10px] uppercase tracking-[0.16em] text-admin-muted">{label}</p><p className="mt-2 font-display text-3xl">{value}</p>{sub && <p className="mt-1 text-xs text-admin-muted">{sub}</p>}</Panel>);
}
export const afield = "w-full min-h-11 border border-admin-border bg-admin-bg px-3 py-2 text-sm text-admin-text placeholder:text-admin-muted focus:border-champagne focus:outline-none";
export const abtn = "inline-flex min-h-11 items-center justify-center gap-2 border border-admin-text bg-admin-text px-4 text-[11px] uppercase tracking-[0.14em] text-admin-bg hover:bg-transparent hover:text-admin-text transition-colors disabled:opacity-40";
export const abtnGhost = "inline-flex min-h-11 items-center justify-center gap-2 border border-admin-border px-4 text-[11px] uppercase tracking-[0.14em] text-admin-text hover:border-admin-text transition-colors disabled:opacity-40";
export function AField({ label, children, error }: { label: string; children: ReactNode; error?: string }) {
  return <label className="block"><span className="mb-1.5 block text-[10px] uppercase tracking-[0.16em] text-admin-muted">{label}</span>{children}{error && <span className="mt-1 block text-xs text-error">{error}</span>}</label>;
}
