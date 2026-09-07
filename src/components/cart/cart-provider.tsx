"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type CartLine = { productId: number; slug: string; name: string; brandName: string | null; image: string | null; priceMillimes: number; quantity: number; stock: number; volume: string | null };
type CartState = { lines: CartLine[]; giftWrap: boolean; note: string; promoCode: string };
type Ctx = CartState & {
  isOpen: boolean; open: () => void; close: () => void;
  add: (line: Omit<CartLine, "quantity">, qty?: number) => void;
  setQty: (productId: number, qty: number) => void;
  remove: (productId: number) => void;
  clear: () => void;
  setGiftWrap: (v: boolean) => void; setNote: (v: string) => void; setPromoCode: (v: string) => void;
  count: number; subtotal: number; hydrated: boolean;
  recentlyViewed: number[]; pushRecentlyViewed: (id: number) => void;
};
const KEY = "cleo.cart.v1";
const RV_KEY = "cleo.rv.v1";
const CartCtx = createContext<Ctx | null>(null);
export function useCart() {
  const c = useContext(CartCtx);
  if (!c) throw new Error("useCart outside provider");
  return c;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CartState>({ lines: [], giftWrap: false, note: "", promoCode: "" });
  const [isOpen, setOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [recentlyViewed, setRV] = useState<number[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setState((s) => ({ ...s, ...JSON.parse(raw) }));
      const rv = localStorage.getItem(RV_KEY);
      if (rv) setRV(JSON.parse(rv));
    } catch {}
    setHydrated(true);
  }, []);
  useEffect(() => { if (hydrated) localStorage.setItem(KEY, JSON.stringify(state)); }, [state, hydrated]);
  useEffect(() => { if (hydrated) localStorage.setItem(RV_KEY, JSON.stringify(recentlyViewed)); }, [recentlyViewed, hydrated]);

  const add = useCallback((line: Omit<CartLine, "quantity">, qty = 1) => {
    setState((s) => {
      const ex = s.lines.find((l) => l.productId === line.productId);
      const max = Math.max(1, Math.min(20, line.stock));
      if (ex) return { ...s, lines: s.lines.map((l) => (l.productId === line.productId ? { ...l, quantity: Math.min(max, l.quantity + qty), stock: line.stock, priceMillimes: line.priceMillimes } : l)) };
      return { ...s, lines: [...s.lines, { ...line, quantity: Math.min(max, qty) }] };
    });
  }, []);
  const setQty = useCallback((productId: number, qty: number) => {
    setState((s) => ({ ...s, lines: qty <= 0 ? s.lines.filter((l) => l.productId !== productId) : s.lines.map((l) => (l.productId === productId ? { ...l, quantity: Math.min(Math.max(1, Math.min(20, l.stock)), qty) } : l)) }));
  }, []);
  const remove = useCallback((productId: number) => setState((s) => ({ ...s, lines: s.lines.filter((l) => l.productId !== productId) })), []);
  const clear = useCallback(() => setState({ lines: [], giftWrap: false, note: "", promoCode: "" }), []);
  const pushRecentlyViewed = useCallback((id: number) => setRV((r) => [id, ...r.filter((x) => x !== id)].slice(0, 8)), []);

  const count = state.lines.reduce((a, l) => a + l.quantity, 0);
  const subtotal = state.lines.reduce((a, l) => a + l.priceMillimes * l.quantity, 0);

  const value = useMemo<Ctx>(() => ({
    ...state, isOpen, open: () => setOpen(true), close: () => setOpen(false), add, setQty, remove, clear,
    setGiftWrap: (giftWrap) => setState((s) => ({ ...s, giftWrap })), setNote: (note) => setState((s) => ({ ...s, note })), setPromoCode: (promoCode) => setState((s) => ({ ...s, promoCode })),
    count, subtotal, hydrated, recentlyViewed, pushRecentlyViewed,
  }), [state, isOpen, add, setQty, remove, clear, count, subtotal, hydrated, recentlyViewed, pushRecentlyViewed]);

  return <CartCtx.Provider value={value}>{children}</CartCtx.Provider>;
}
