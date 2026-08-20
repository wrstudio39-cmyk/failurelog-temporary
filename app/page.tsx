import Link from "next/link";
import { ArrowDownRight, ArrowUpRight, BookOpen, CircleDollarSign, Gem, ShieldCheck } from "lucide-react";
import { ProjectCard } from "@/components/marketplace/project-card";
import { getPublishedListings } from "@/lib/listings";
import { PREMIUM_BADGE } from "@/lib/config";

export default async function HomePage() {
  const listings = await getPublishedListings();
  const featured = listings.slice(0, 3);

  return (
    <div className="overflow-hidden">
      <section className="hero-grid border-b border-hairline">
        <div className="mx-auto grid max-w-7xl gap-14 px-5 py-16 lg:grid-cols-[1.1fr_.9fr] lg:px-8 lg:py-24">
          <div className="hero-rule pt-5">
            <div className="mb-7 flex items-center gap-3">
              <span className="case-stamp case-stamp--abandoned">Open archive</span>
              <span className="micro-kicker">A marketplace for useful failures</span>
            </div>
            <h1 className="display-xl max-w-5xl">
              Don&apos;t just buy<br />
              <span className="signal-word">the code.</span><br />
              Buy the lesson.
            </h1>
            <p className="lede mt-8 max-w-xl">
              Abandoned products, real numbers, honest post-mortems, and the assets to start again — in one searchable archive.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/marketplace" className="btn-primary group">Explore the archive <ArrowUpRight size={15} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" /></Link>
              <Link href="/sell" className="btn-secondary">Sell what you stopped</Link>
            </div>
            <div className="mt-12 flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-hairline pt-5">
              <span className="micro-kicker">Built for indie hackers</span>
              <span className="micro-kicker">Post-mortems required</span>
              <span className="micro-kicker">Admin reviewed</span>
            </div>
          </div>

          <div className="flex items-center lg:justify-end">
            <div className="hero-case w-full max-w-[520px] rotate-[1.2deg]">
              <div className="hero-case-top">
                <span className="micro-kicker">Case file / FL-001</span>
                <span className="case-stamp case-stamp--abandoned">Abandoned</span>
              </div>
              <div className="p-6 sm:p-8">
                <div className="micro-kicker">What the archive preserves</div>
                <div className="mt-4 font-display text-4xl font-bold leading-[.98] tracking-[-.05em]">The parts of a startup nobody puts on the landing page.</div>
                <div className="mt-7 grid grid-cols-2 gap-3">
                  {[
                    ["01", "What was built"],
                    ["02", "Why it stopped"],
                    ["03", "What it cost"],
                    ["04", "What you get"],
                  ].map(([n, t]) => (
                    <div key={n} className="border border-hairline bg-paper/60 p-4">
                      <div className="font-mono text-[10px] text-amber">{n}</div>
                      <div className="mt-8 font-display text-sm font-semibold">{t}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 flex items-center justify-between border-t border-hairline pt-5">
                  <span className="font-mono text-[10px] uppercase tracking-[.1em] text-ink-soft">Transparency is the product</span>
                  <ArrowDownRight size={18} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-hairline bg-paper-dim/40">
        <div className="mx-auto grid max-w-7xl gap-0 px-5 lg:grid-cols-3 lg:px-8">
          <div className="border-b border-hairline py-8 lg:border-b-0 lg:border-r lg:pr-10"><BookOpen size={18} /><div className="mt-5 font-display text-lg font-bold">Read the failure first.</div><p className="mt-2 max-w-sm font-body text-sm leading-6 text-ink-soft">Every project carries the story behind the shutdown. No mystery box.</p></div>
          <div className="border-b border-hairline py-8 lg:border-b-0 lg:border-r lg:px-10"><CircleDollarSign size={18} /><div className="mt-5 font-display text-lg font-bold">Buy a head start.</div><p className="mt-2 max-w-sm font-body text-sm leading-6 text-ink-soft">Acquire working foundations instead of spending months recreating them.</p></div>
          <div className="py-8 lg:pl-10"><ShieldCheck size={18} /><div className="mt-5 font-display text-lg font-bold">Trust the archive.</div><p className="mt-2 max-w-sm font-body text-sm leading-6 text-ink-soft">Listings are reviewed before they become part of the public marketplace.</p></div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <div className="mb-10 flex flex-col gap-5 border-b border-hairline pb-7 sm:flex-row sm:items-end sm:justify-between">
          <div><div className="field-label mb-2">The archive</div><h2 className="display-lg">Recently logged.</h2></div>
          <Link href="/marketplace" className="btn-ghost group">Open all case files <ArrowUpRight size={14} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" /></Link>
        </div>
        <div className="grid gap-5 lg:grid-cols-3">{featured.map((listing) => <ProjectCard key={listing.id} listing={listing} />)}</div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-20 lg:px-8">
        <div className="premium-banner">
          <div className="flex items-center gap-4">
            <div className="premium-banner-icon"><Gem size={18} /></div>
            <div>
              <div className="micro-kicker">New / archive desk program</div>
              <div className="mt-1 font-display text-lg font-bold">Buyers and sellers can request the Premium badge — ${PREMIUM_BADGE.price}.</div>
              <p className="mt-1 max-w-xl font-body text-sm leading-6 text-ink-soft">{PREMIUM_BADGE.pitch} Requests are reviewed by hand from your dashboard.</p>
            </div>
          </div>
          <Link href="/dashboard" className="btn-primary shrink-0 self-start sm:self-auto">Request from your dashboard <ArrowUpRight size={15} /></Link>
        </div>
      </section>

      <section className="border-y border-hairline bg-[#0F172A] text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 lg:grid-cols-[1fr_auto] lg:items-end lg:px-8">
          <div><div className="field-label text-white/50">For the founder with a dead tab open</div><h2 className="mt-3 max-w-3xl font-display text-4xl font-bold leading-none tracking-[-.05em] sm:text-6xl">Your failed project still has a second act.</h2></div>
          <Link href="/sell" className="btn-primary group">Log your project <ArrowUpRight size={15} /></Link>
        </div>
      </section>
    </div>
  );
}
