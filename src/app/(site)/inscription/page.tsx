import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { RegisterForm } from "@/components/account/auth-forms";
export const metadata: Metadata = { title: "Créer un compte", robots: { index: false } };
export default async function InscriptionPage() {
  if (await getCurrentUser()) redirect("/compte");
  return (<div className="container-lux flex min-h-[70vh] items-center justify-center py-14"><div className="w-full max-w-md"><p className="eyebrow mb-4 text-center">Nouveau client</p><h1 className="mb-10 text-center font-display text-display-md text-ink">Créer un compte</h1><RegisterForm /></div></div>);
}
