import { Suspense } from "react";
import { ArrowUpRight, Search } from "lucide-react";
import { FilterBar } from "@/components/marketplace/filter-bar";
import { ProjectCard } from "@/components/marketplace/project-card";
import { getPublishedListings } from "@/lib/listings";

export default async function MarketplacePage({ searchParams }: { searchParams: { q?: string; model?: string; category?: string; tech?: string; maxPrice?: string } }) {
  const all = await getPublishedListings();
  const filtered = all.filter((l) => {
    if (searchParams.q) { const q = searchParams.q.toLowerCase(); if (!`${l.title} ${l.tagline} ${l.tech_tags.join(" ")}`.toLowerCase().includes(q)) return false; }
    if (searchParams.model && l.business_model !== searchParams.model) return false;
    if (searchParams.category && l.category !== searchParams.category) return false;
    if (searchParams.tech && !l.tech_tags.includes(searchParams.tech)) return false;
    if (searchParams.maxPrice && l.price > Number(searchParams.maxPrice)) return false;
    return true;
  });

  return <div className="mx-auto max-w-7xl px-5 py-12 lg:px-8 lg:py-16">
    <div className="border-b border-hairline pb-10">
      <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        <div><div className="field-label mb-3">FailureLog / marketplace</div><h1 className="display-lg max-w-3xl">Find a project<br /><span className="signal-word">worth restarting.</span></h1></div>
        <div className="max-w-sm"><p className="font-body text-base leading-7 text-ink-soft">Browse abandoned products with the context most marketplaces leave out: what happened, what it earned, and what you actually receive.</p></div>
      </div>
      <div className="mt-10 grid gap-px border border-hairline bg-hairline sm:grid-cols-3">
        <div className="bg-paper p-4"><div className="micro-kicker">Archive count</div><div className="mt-2 font-display text-2xl font-bold">{all.length}</div></div>
        <div className="bg-paper p-4"><div className="micro-kicker">Showing now</div><div className="mt-2 font-display text-2xl font-bold">{filtered.length}</div></div>
        <div className="bg-paper p-4"><div className="micro-kicker">Sort philosophy</div><div className="mt-2 flex items-center gap-2 font-display text-sm font-semibold">Context over hype <ArrowUpRight size={14}/></div></div>
      </div>
    </div>

    <div className="mt-10 grid gap-10 lg:grid-cols-[240px_1fr]">
      <Suspense><FilterBar /></Suspense>
      <section>
        <div className="mb-6 flex items-center justify-between"><div className="micro-kicker">{filtered.length} case files match your lens</div><span className="hidden items-center gap-2 font-mono text-[9px] uppercase tracking-[.1em] text-ink-soft sm:flex"><Search size={12}/> Search + filter</span></div>
        {filtered.length === 0 ? <div className="doc-card p-12 text-center"><div className="field-label">Archive gap</div><h2 className="mt-3 font-display text-2xl font-bold">Nothing matches that lens.</h2><p className="mx-auto mt-3 max-w-md font-body text-sm leading-6 text-ink-soft">Try widening the stack, category, or price. The point of an archive is what you discover between the obvious answers.</p></div> : <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{filtered.map((listing) => <ProjectCard key={listing.id} listing={listing} />)}</div>}
      </section>
    </div>
  </div>;
}
