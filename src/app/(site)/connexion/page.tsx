import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { LoginForm } from "@/components/account/auth-forms";
export const metadata: Metadata = { title: "Connexion", robots: { index: false } };
export default async function ConnexionPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  if (await getCurrentUser()) redirect(next && next.startsWith("/") ? next : "/compte");
  return (<div className="container-lux flex min-h-[70vh] items-center justify-center py-14"><div className="w-full max-w-md"><p className="eyebrow mb-4 text-center">Bienvenue</p><h1 className="mb-10 text-center font-display text-display-md text-ink">Se connecter</h1><LoginForm next={next} /></div></div>);
}
