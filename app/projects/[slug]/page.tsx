import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { StatusStamp } from "@/components/ui/status-stamp";
import { PremiumBadge } from "@/components/ui/premium-badge";
import { ArrowLeft, ArrowUpRight, Check, CircleDollarSign, Users, Activity, Clock3 } from "lucide-react";
import Link from "next/link";
import { getListingBySlug } from "@/lib/listings";
import { formatPrice, formatCompactNumber, getBusinessModelLabel } from "@/lib/config";
import OfferBox from "@/components/offers/offer-box";

export default async function ProjectDetailPage({ params }: { params: { slug: string } }) {
  const listing = await getListingBySlug(params.slug);
  if (!listing) notFound();

  const pm = listing.post_mortem;
  const metricRows: [string, string][] = [
    ["Monthly traffic (at peak)", formatCompactNumber(listing.metrics.monthly_traffic)],
    ["Total users", formatCompactNumber(listing.metrics.total_users)],
    ["Lifetime revenue", listing.metrics.lifetime_revenue != null ? `$${formatCompactNumber(listing.metrics.lifetime_revenue)}` : "—"],
    ["MRR at shutdown", listing.metrics.mrr_at_shutdown != null ? `$${listing.metrics.mrr_at_shutdown}` : "—"],
    ["Months active", listing.metrics.months_active != null ? String(listing.metrics.months_active) : "—"],
  ];

  const metricIcons = [Users, CircleDollarSign, Activity, CircleDollarSign, Clock3];

  return (
    <div className="mx-auto max-w-7xl px-5 py-10 lg:px-8 lg:py-14">
      <Link href="/marketplace" className="btn-ghost mb-8"><ArrowLeft size={14}/> Back to archive</Link>

      <header className="detail-hero">
        <div className="flex flex-wrap items-center gap-3">
          <span className="detail-index">Case file / {listing.id}</span>
          <span className="dot-sep" />
          <span className="detail-index">{getBusinessModelLabel(listing.business_model)}</span>
          <StatusStamp variant="abandoned" />
        </div>
        <div className="mt-6 grid gap-10 lg:grid-cols-[1fr_300px] lg:items-end">
          <div>
            <h1 className="display-lg max-w-4xl">{listing.title}</h1>
            <p className="mt-5 max-w-2xl font-body text-xl leading-8 text-ink-soft">{listing.tagline}</p>
            <div className="mt-6 flex flex-wrap gap-1.5">{listing.tech_tags.map((tag) => <span key={tag} className="tech-chip">{tag}</span>)}{listing.verification?.github_status === "verified" && <span className="case-stamp case-stamp--verified">GitHub verified</span>}{listing.verification?.stripe_status === "verified" && <span className="case-stamp case-stamp--verified">Revenue verified</span>}</div>
          </div>
          <div className="border-l border-hairline pl-5">
            <div className="micro-kicker">Seller</div>
            <div className="mt-2 flex items-center gap-2 font-display text-lg font-bold">
              {listing.seller?.name ?? "Unknown seller"}
              {listing.seller?.is_premium && <PremiumBadge />}
            </div>
            <div className="mt-1 font-body text-sm text-ink-soft">Published case file</div>
          </div>
        </div>
      </header>

      <div className="mt-12 grid gap-14 lg:grid-cols-[minmax(0,1fr)_340px]">
        <main className="min-w-0">
          <section className="mb-12 border border-hairline bg-paper-dim/40 p-6 sm:p-8">
            <div className="flex items-center justify-between gap-5"><div><div className="field-label">The numbers before the story</div><h2 className="mt-2 font-display text-2xl font-bold tracking-[-.03em]">What actually happened</h2></div><span className="font-mono text-[9px] uppercase tracking-[.12em] text-ink-soft">Reported metrics</span></div>
            <div className="mt-7 grid gap-px border border-hairline bg-hairline sm:grid-cols-2 lg:grid-cols-5">
              {metricRows.map(([label, value], i) => { const Icon = metricIcons[i]; return <div key={label} className="bg-paper p-4"><Icon size={14}/><div className="mt-8 font-display text-xl font-bold tracking-[-.03em]">{value}</div><div className="mt-1 font-mono text-[8px] uppercase leading-4 tracking-[.1em] text-ink-soft">{label}</div></div>; })}
            </div>
          </section>

          <div className="space-y-10">
            <section className="story-block"><div className="field-label">01 / The failure</div><h2 className="story-title mt-2">Why it was abandoned</h2><div className="prose-post-mortem"><Markdown content={pm.why_abandoned} /></div></section>
            <section className="story-block"><div className="field-label">02 / The evidence</div><h2 className="story-title mt-2">What went wrong</h2><div className="prose-post-mortem"><Markdown content={pm.what_went_wrong} /></div></section>
            {pm.distribution_notes && <section className="story-block"><div className="field-label">03 / Distribution</div><h2 className="story-title mt-2">Where growth broke</h2><div className="prose-post-mortem"><Markdown content={pm.distribution_notes} /></div></section>}
            {pm.target_market_notes && <section className="story-block"><div className="field-label">04 / Market</div><h2 className="story-title mt-2">Who it was built for</h2><div className="prose-post-mortem"><Markdown content={pm.target_market_notes} /></div></section>}
            {pm.technical_notes && <section className="story-block"><div className="field-label">05 / Technical</div><h2 className="story-title mt-2">What still works</h2><div className="prose-post-mortem"><Markdown content={pm.technical_notes} /></div></section>}
            <section className="lesson-block"><div className="field-label text-[#8d631e] dark:text-[#e8c374]">06 / Keep this part</div><h2 className="mt-2 font-display text-2xl font-bold tracking-[-.03em]">Lessons learned</h2><div className="prose-post-mortem mt-4"><Markdown content={pm.lessons_learned} /></div></section>
            <section className="story-block"><div className="field-label">07 / Included</div><h2 className="story-title mt-2">What the buyer receives</h2><div className="grid gap-2 sm:grid-cols-2">{listing.assets.map((asset, i) => <div key={i} className="flex items-start gap-3 border border-hairline bg-paper/40 p-4"><span className={`mt-0.5 flex h-5 w-5 items-center justify-center ${asset.included ? "bg-signal text-white" : "bg-paper-dim text-ink-soft"}`}><Check size={12}/></span><span className={`font-body text-sm leading-5 ${asset.included ? "text-ink" : "text-ink-soft line-through"}`}>{asset.label}</span></div>)}</div></section>
          </div>
        </main>

        <aside>
          <div className="buy-panel lg:sticky lg:top-24 p-6 sm:p-7">
            <div className="field-label">Acquire this case</div>
            <div className="mt-3 font-display text-5xl font-bold tracking-[-.06em]">{formatPrice(listing.price)}</div>
            <p className="mt-3 font-body text-sm leading-6 text-white/65">One-time purchase. Asset transfer follows successful payment and the project&apos;s delivery terms.</p>
            <form action="/api/checkout" method="POST" className="mt-7"><input type="hidden" name="listingId" value={listing.id}/><button type="submit" className="btn-primary w-full">Buy this project <ArrowUpRight size={15}/></button></form>
            <OfferBox listingId={listing.id} price={Number(listing.price)} />
            <div className="mt-7 border-t border-white/15 pt-5"><div className="field-label">Included in the price</div><ul className="mt-4 space-y-3">{listing.assets.filter(a=>a.included).slice(0,4).map((a,i)=><li key={i} className="flex gap-2.5 font-body text-sm text-white/80"><Check size={15} className="mt-0.5 shrink-0 text-[#8fd0aa]"/>{a.label}</li>)}</ul></div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Markdown({ content }: { content: string }) {
  return (
    <div className="prose prose-sm max-w-none font-body prose-headings:font-display prose-a:text-amber">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
}
