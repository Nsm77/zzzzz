import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { articles } from "@/db/schema";
import { Breadcrumbs } from "@/components/ui/primitives";
import { Stagger, StaggerItem } from "@/components/motion/reveal";
import { formatDate } from "@/lib/utils";
export const metadata: Metadata = { title: "Journal", description: "Conseils de pharmaciens : routines, actifs, protection solaire, compléments." };
export const dynamic = "force-dynamic";
export default async function JournalPage() {
  const list = await db.select().from(articles).where(eq(articles.isPublished, true)).orderBy(desc(articles.publishedAt));
  return (
    <div className="container-lux py-10 lg:py-14">
      <Breadcrumbs items={[{ label: "Journal" }]} />
      <header className="mt-6 mb-12 max-w-2xl"><p className="eyebrow mb-4">Le Journal</p><h1 className="font-display text-display-lg text-ink">Comprendre avant d&apos;acheter</h1><p className="mt-4 text-[15px] text-muted">Des articles courts, écrits par nos pharmaciens, sans jargon ni promesses.</p></header>
      <Stagger className="grid gap-x-8 gap-y-14 md:grid-cols-2 lg:grid-cols-3">
        {list.map((a) => (
          <StaggerItem key={a.id}><Link href={`/journal/${a.slug}`} className="group block"><div className="relative aspect-[4/3] overflow-hidden bg-stone">{a.image && <Image src={a.image} alt="" fill sizes="(max-width:768px) 100vw, 33vw" className="object-cover transition-transform duration-[1400ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]" />}</div><p className="mt-5 text-[10px] uppercase tracking-[0.18em] text-muted">{a.tag} · {a.readMinutes} min · {formatDate(a.publishedAt)}</p><h2 className="mt-2 font-display text-display-sm text-ink">{a.title}</h2><p className="mt-2 line-clamp-3 text-sm text-muted">{a.excerpt}</p></Link></StaggerItem>
        ))}
      </Stagger>
    </div>
  );
}
