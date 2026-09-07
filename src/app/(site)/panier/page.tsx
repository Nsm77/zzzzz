import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/ui/primitives";
import { CartPage } from "@/components/checkout/cart-page";
export const metadata: Metadata = { title: "Panier", robots: { index: false } };
export default function PanierPage() {
  return (<div className="container-lux py-10 lg:py-14"><Breadcrumbs items={[{ label: "Panier" }]} /><h1 className="mt-6 mb-10 font-display text-display-lg text-ink">Votre panier</h1><CartPage /></div>);
}
