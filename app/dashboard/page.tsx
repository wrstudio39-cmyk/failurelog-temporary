"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowUpRight, BarChart3, CheckCircle2, ChevronRight,
  CircleDollarSign, Clock3, FileText, Handshake, Inbox, Layers3,
  MessageSquare, Plus, RefreshCw, Search, ShieldCheck, Sparkles,
  WalletCards, X, Gauge
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { PremiumBadgeBanner } from "@/components/premium/premium-badge-banner";

type Role = "seller" | "buyer";

type Listing = {
  id: string; title: string; slug: string; status: string; price: number;
  created_at: string; published_at?: string | null; category?: string;
  tagline?: string; seller_id?: string;
};
type Sale = { id: string; amount: number; status: string; created_at: string; listing_id: string };
type Payout = { id: string; amount: number; platform_fee: number; status: string; created_at: string };
type Purchase = { id: string; amount: number; status: string; lifecycle_status: string; created_at: string; listing_id: string; listing?: { title: string; slug: string } | null };
type Offer = { id: string; amount: number; status: string; created_at: string; listing_id: string; listing?: { title: string; slug: string } | null };

function money(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n || 0);
}
function statusClass(status: string) {
  if (status === "published") return "case-stamp--verified";
  if (status === "pending_review") return "case-stamp--pending";
  if (status === "sold") return "case-stamp--sold";
  return "";
}
function Status({ status }: { status: string }) {
  const label = status.replace("_", " ");
  return <span className={`case-stamp ${statusClass(status)}`}>{status === "published" && <CheckCircle2 size={11} />} {label}</span>;
}
function OfferStatus({ status }: { status: string }) {
  const cls = status === "accepted" ? "case-stamp--verified" : status === "declined" ? "" : "case-stamp--pending";
  return <span className={`case-stamp ${cls}`}>{status}</span>;
}

export default function DashboardPage() {
  const router = useRouter();
  const [checkedAuth, setCheckedAuth] = useState(false);
  const [listings, setListings] = useState<Listing[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [buyerOffers, setBuyerOffers] = useState<Offer[]>([]);
  const [name, setName] = useState("there");
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<"7d" | "30d" | "all">("30d");
  const [notice, setNotice] = useState(true);
  const [role, setRole] = useState<Role>("seller");

  useEffect(() => {
    let mounted = true;
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        if (mounted) { setCheckedAuth(true); router.replace("/login"); }
        return;
      }
      if (mounted) setCheckedAuth(true);

      const [profileRes, listingRes, saleRes, payoutRes, purchaseRes, offerRes] = await Promise.all([
        supabase.from("profiles").select("name,role").eq("id", user.id).maybeSingle(),
        supabase.from("listings").select("id,title,slug,status,price,created_at,published_at,category,tagline").eq("seller_id", user.id).order("created_at", { ascending: false }),
        supabase.from("purchases").select("id,amount,status,created_at,listing_id").eq("seller_id", user.id).order("created_at", { ascending: false }).limit(30),
        supabase.from("seller_payouts").select("id,amount,platform_fee,status,created_at").eq("seller_id", user.id).order("created_at", { ascending: false }).limit(30),
        supabase.from("purchases").select("id,amount,status,lifecycle_status,created_at,listing_id,listing:listings(title,slug)").eq("buyer_id", user.id).order("created_at", { ascending: false }).limit(30),
        supabase.from("offers").select("id,amount,status,created_at,listing_id,listing:listings(title,slug)").eq("buyer_id", user.id).order("created_at", { ascending: false }).limit(30),
      ]);
      if (!mounted) return;
      if (profileRes.data?.name) setName(profileRes.data.name.split(" ")[0]);
      if (profileRes.data?.role === "buyer") setRole("buyer");
      if (!listingRes.error && listingRes.data) setListings(listingRes.data as Listing[]);
      if (!saleRes.error && saleRes.data) setSales(saleRes.data as Sale[]);
      if (!payoutRes.error && payoutRes.data) setPayouts(payoutRes.data as Payout[]);
      if (!purchaseRes.error && purchaseRes.data) setPurchases(purchaseRes.data as unknown as Purchase[]);
      if (!offerRes.error && offerRes.data) setBuyerOffers(offerRes.data as unknown as Offer[]);
      setLoading(false);
    }
    load();
    return () => { mounted = false; };
  }, [router]);

  const published = listings.filter(x => x.status === "published");
  const review = listings.filter(x => x.status === "pending_review");
  const drafts = listings.filter(x => x.status === "draft");
  const gross = sales.filter(x => x.status === "completed").reduce((a, x) => a + Number(x.amount || 0), 0);
  const fees = payouts.reduce((a, x) => a + Number(x.platform_fee || 0), 0);
  const net = Math.max(0, gross - fees);
  const pendingPayout = payouts.filter(x => x.status !== "paid").reduce((a, x) => a + Number(x.amount || 0), 0);
  const chart = useMemo(() => {
    const buckets = Array.from({ length: 12 }, () => 0);
    const now = Date.now();
    sales.filter(x => x.status === "completed").forEach((sale) => {
      const age = Math.max(0, Math.min(11, Math.floor((now - new Date(sale.created_at).getTime()) / (1000 * 60 * 60 * 24 * 30))));
      buckets[11 - age] += Number(sale.amount || 0);
    });
    return buckets;
  }, [sales]);
  const max = Math.max(...chart, 1);

  const timeline = [
    ...review.map(x => ({ kind: "Review", title: x.title, text: "Case file is waiting for the archive desk.", date: x.created_at, icon: ShieldCheck })),
    ...sales.filter(x => x.status === "completed").slice(0, 4).map(x => ({ kind: "Sale", title: "A case file changed hands", text: `${money(Number(x.amount))} transaction completed.`, date: x.created_at, icon: CircleDollarSign })),
    ...drafts.slice(0, 2).map(x => ({ kind: "Draft", title: x.title, text: "Draft is waiting for your next pass.", date: x.created_at, icon: FileText })),
  ].sort((a, b) => +new Date(b.date) - +new Date(a.date)).slice(0, 6);

  if (!checkedAuth) {
    return <div className="flex min-h-[calc(100vh-73px)] items-center justify-center font-mono text-xs text-ink-soft">Loading…</div>;
  }

  return (
    <div className="min-h-[calc(100vh-73px)]">
      <div className="border-b border-hairline bg-paper-dim/40">
        <div className="mx-auto flex max-w-[1480px] flex-wrap items-center justify-between gap-2 px-5 py-2 lg:px-8">
          <div className="flex flex-wrap items-center gap-1">
            {[["/dashboard", "Control room"], ["/sell", "New case file"], ["/offers", "Offers"]].map(([href, label]) => (
              <Link key={href} href={href} className="rounded px-3 py-2 font-mono text-[9px] uppercase tracking-[.1em] text-ink-soft transition hover:bg-paper hover:text-ink">{label}</Link>
            ))}
          </div>
          <div className="flex items-center gap-1 rounded-md border border-hairline bg-paper p-1" role="tablist" aria-label="Dashboard role">
            {(["seller", "buyer"] as const).map((r) => (
              <button key={r} type="button" role="tab" aria-selected={role === r} onClick={() => setRole(r)}
                className={`rounded px-3 py-1.5 font-mono text-[9px] uppercase tracking-[.1em] transition-colors duration-fast ${role === r ? "bg-ink text-paper" : "text-ink-soft hover:text-ink"}`}>
                Viewing as {r}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-[1480px] px-5 py-7 lg:px-8 lg:py-10">
        <header className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="field-label flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-signal animate-pulse" /> {role === "seller" ? "Seller control room" : "Buyer control room"} / live</div>
            <h1 className="display-lg mt-3">Good to see you, {name}.</h1>
            <p className="mt-3 max-w-2xl font-body text-sm leading-6 text-ink-soft">
              {role === "seller" ? "One screen for the health of your archive: what is earning, what needs a decision, and what is quietly collecting dust." : "One screen for what you own and what you're negotiating."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {role === "seller" ? (
              <Link href="/sell" className="btn-primary"><Plus size={15} /> New case file</Link>
            ) : (
              <>
                <Link href="/offers" className="btn-secondary"><Handshake size={15} /> My offers</Link>
                <Link href="/marketplace" className="btn-primary"><Search size={15} /> Find a project</Link>
              </>
            )}
          </div>
        </header>

        <div className="mb-6"><PremiumBadgeBanner role={role} /></div>

        {role === "buyer" && <BuyerDashboard purchases={purchases} offers={buyerOffers} loading={loading} />}

        {role === "seller" && <>
          {notice && (published.length > 0 || review.length > 0 || drafts.length > 0) && (
            <div className="mb-6 flex items-center gap-3 rounded-md border border-primary/20 bg-primary/5 px-4 py-3 text-sm">
              <Sparkles size={16} className="text-primary shrink-0" />
              <span><b>Seller signal:</b> {review.length ? `${review.length} case file${review.length > 1 ? "s are" : " is"} in review.` : "Your review queue is clear."} {drafts.length ? `You also have ${drafts.length} draft${drafts.length > 1 ? "s" : ""} worth finishing.` : ""}</span>
              <button onClick={() => setNotice(false)} className="ml-auto text-ink-soft hover:text-ink"><X size={15} /></button>
            </div>
          )}

          <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            {[
              { label: "Archive value", value: money(published.reduce((a, x) => a + x.price, 0)), sub: `${published.length} live listings`, icon: Layers3, accent: true },
              { label: "Gross captured", value: money(gross), sub: `${sales.filter(x => x.status === "completed").length} completed sales`, icon: CircleDollarSign },
              { label: "Ready to withdraw", value: money(pendingPayout), sub: "after current platform fees", icon: WalletCards },
              { label: "In review", value: String(review.length).padStart(2, "0"), sub: "archive desk queue", icon: ShieldCheck },
              { label: "Unfinished", value: String(drafts.length).padStart(2, "0"), sub: "draft case files", icon: Clock3 },
            ].map((k, i) => { const I = k.icon; return (
              <div key={k.label} className={`doc-card p-5 ${k.accent ? "border-primary/30" : ""}`}>
                <div className="flex items-center justify-between"><I size={16} className={k.accent ? "text-primary" : "text-ink-soft"} /><span className="font-mono text-[9px] text-ink-soft">0{i + 1}</span></div>
                <div className="mt-8 font-display text-2xl font-bold tracking-[-.04em]">{loading ? "…" : k.value}</div>
                <div className="micro-kicker mt-1">{k.label}</div>
                <div className="mt-3 font-mono text-[10px] text-ink-soft">{k.sub}</div>
              </div>
            ); })}
          </section>

          <div className="mt-6 grid gap-6 xl:grid-cols-[1.65fr_.75fr]">
            <section className="doc-card overflow-hidden">
              <div className="flex flex-col gap-4 border-b border-hairline p-5 sm:flex-row sm:items-center sm:justify-between">
                <div><div className="field-label">Commercial pulse</div><h2 className="mt-1 font-display text-xl font-bold">Revenue velocity</h2></div>
                <div className="flex gap-1 rounded-md border border-hairline p-1">
                  {(["7d", "30d", "all"] as const).map(p => <button key={p} type="button" aria-pressed={period === p} onClick={() => setPeriod(p)} className={`rounded px-3 py-1.5 font-mono text-[10px] uppercase transition-colors duration-fast ${period === p ? "bg-ink text-paper" : "text-ink-soft hover:text-ink"}`}>{p}</button>)}
                </div>
              </div>
              <div className="grid gap-5 p-5 lg:grid-cols-[1fr_180px]">
                <div className="min-h-[220px]">
                  <div className="flex items-end gap-1.5 h-[190px] border-b border-l border-hairline px-3 pt-4">
                    {chart.map((v, i) => <div key={i} className="group relative flex-1 h-full flex items-end"><div className="w-full rounded-t-sm bg-primary/75 transition-all duration-500 group-hover:bg-primary" style={{ height: `${v / max * 100}%` }} /><span className="absolute -top-5 left-1/2 -translate-x-1/2 hidden font-mono text-[9px] group-hover:block">{v}</span></div>)}
                  </div>
                  <div className="mt-2 flex justify-between pl-3 font-mono text-[9px] text-ink-soft"><span>01</span><span>06</span><span>12</span></div>
                </div>
                <div className="border-l border-hairline pl-5">
                  <div className="micro-kicker">Net position</div>
                  <div className="mt-2 font-display text-3xl font-bold">{money(net)}</div>
                  <div className="mt-8 border-t border-hairline pt-4"><div className="micro-kicker">Fees absorbed</div><div className="mt-1 font-display text-lg font-bold">{money(fees)}</div></div>
                  <button className="btn-ghost mt-5 px-0"><BarChart3 size={14} /> Open ledger <ChevronRight size={13} /></button>
                </div>
              </div>
            </section>

            <section className="doc-card overflow-hidden">
              <div className="flex items-center justify-between border-b border-hairline p-5">
                <div><div className="field-label">Archive inventory</div><h2 className="mt-1 font-display text-xl font-bold">Case files in motion</h2></div>
                <Link href="/sell" className="btn-ghost"><Plus size={14} /> Add</Link>
              </div>
              <div className="divide-y divide-hairline">
                {listings.slice(0, 6).map((item, i) => <div key={item.id} className="group flex flex-col gap-4 p-5 transition-colors hover:bg-paper-dim/30 sm:flex-row sm:items-center">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-hairline bg-paper-dim font-mono text-[10px]">{String(i + 1).padStart(2, "0")}</div>
                  <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="font-display font-semibold">{item.title}</h3><Status status={item.status} /></div><p className="mt-1 truncate font-body text-xs text-ink-soft">{item.tagline || "No tagline yet."}</p></div>
                  <div className="hidden text-right sm:block"><div className="font-display font-bold">{money(Number(item.price))}</div></div>
                  <Link href={`/projects/${item.slug}`} className="card-arrow shrink-0"><ArrowUpRight size={15} /></Link>
                </div>)}
              </div>
              {!listings.length && !loading && <div className="p-10 text-center font-body text-sm text-ink-soft">Your archive is empty. Start with the project you stopped shipping.</div>}
            </section>
          </div>

          <section className="mt-6 doc-card overflow-hidden">
            <div className="flex items-center justify-between border-b border-hairline p-5">
              <div><div className="field-label">Decision feed</div><h2 className="mt-1 font-display text-xl font-bold">What changed</h2></div>
              <button className="btn-ghost" title="Refresh"><RefreshCw size={14} /></button>
            </div>
            <div className="p-5">
              {timeline.length ? <div className="space-y-0">
                {timeline.map((item, i) => { const I = item.icon; return <div key={`${item.title}-${i}`} className="relative flex gap-4 pb-6 last:pb-0">
                  {i < timeline.length - 1 && <div className="absolute left-[15px] top-8 h-[calc(100%-20px)] w-px bg-hairline" />}
                  <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-hairline bg-paper"><I size={13} /></div>
                  <div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-3"><span className="font-display text-sm font-semibold">{item.title}</span><span className="font-mono text-[9px] uppercase text-ink-soft">{new Date(item.date).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span></div><p className="mt-1 font-body text-xs leading-5 text-ink-soft">{item.text}</p></div>
                </div>; })}
              </div> : <div className="py-8 text-center"><Inbox className="mx-auto text-ink-soft" size={22} /><p className="mt-3 font-body text-sm text-ink-soft">No movement yet.</p></div>}
            </div>
          </section>
        </>}

        <footer className="mt-10 flex flex-col gap-3 border-t border-hairline pt-5 text-[10px] font-mono uppercase tracking-[.08em] text-ink-soft sm:flex-row sm:justify-between">
          <span>FailureLog / {role} control room</span><span>{loading ? "Syncing…" : "Last synced just now"}{role === "seller" ? ` · ${period} view` : ""}</span>
        </footer>
      </div>
    </div>
  );
}

/* ---------- Buyer dashboard (real data) ---------- */

function BuyerDashboard({ purchases, offers, loading }: { purchases: Purchase[]; offers: Offer[]; loading: boolean }) {
  const totalSpent = purchases.filter(p => p.status === "completed").reduce((a, x) => a + Number(x.amount || 0), 0);
  const activeOffers = offers.filter(o => o.status === "sent").length;

  return (
    <>
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {[
          { label: "Projects acquired", value: String(purchases.filter(p => p.status === "completed").length).padStart(2, "0"), sub: "in your library", icon: Layers3, accent: true },
          { label: "Total invested", value: money(totalSpent), sub: "lifetime acquisitions", icon: CircleDollarSign },
          { label: "Active offers", value: String(activeOffers).padStart(2, "0"), sub: "awaiting a seller reply", icon: Handshake },
        ].map((k, i) => { const I = k.icon; return (
          <div key={k.label} className={`doc-card p-5 ${k.accent ? "border-primary/30" : ""}`}>
            <div className="flex items-center justify-between"><I size={16} className={k.accent ? "text-primary" : "text-ink-soft"} /><span className="font-mono text-[9px] text-ink-soft">0{i + 1}</span></div>
            <div className="mt-8 font-display text-2xl font-bold tracking-[-.04em]">{loading ? "…" : k.value}</div>
            <div className="micro-kicker mt-1">{k.label}</div>
            <div className="mt-3 font-mono text-[10px] text-ink-soft">{k.sub}</div>
          </div>
        ); })}
      </section>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_.8fr]">
        <section className="doc-card overflow-hidden">
          <div className="flex items-center justify-between border-b border-hairline p-5">
            <div><div className="field-label">Your library</div><h2 className="mt-1 font-display text-xl font-bold">Projects you&apos;ve acquired</h2></div>
            <Link href="/marketplace" className="btn-ghost"><Search size={14} /> Find more</Link>
          </div>
          {purchases.length ? (
            <div className="divide-y divide-hairline">
              {purchases.map((item) => (
                <div key={item.id} className="flex flex-col gap-4 p-5 transition-colors hover:bg-paper-dim/30 sm:flex-row sm:items-center">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-hairline bg-paper-dim"><Gauge size={16} /></div>
                  <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="font-display font-semibold">{item.listing?.title ?? "Untitled"}</h3><span className="case-stamp case-stamp--verified">{item.lifecycle_status.replace(/_/g, " ")}</span></div><p className="mt-1 font-mono text-[10px] uppercase text-ink-soft">Acquired {new Date(item.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}</p></div>
                  <div className="hidden text-right sm:block"><div className="font-display font-bold">{money(Number(item.amount))}</div></div>
                  {item.listing?.slug && <Link href={`/projects/${item.listing.slug}`} className="card-arrow shrink-0"><ArrowUpRight size={15} /></Link>}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <Layers3 className="mx-auto text-ink-soft" size={22} />
              <div className="mt-4 font-display text-lg font-bold">{loading ? "Loading…" : "Nothing acquired yet."}</div>
              {!loading && <>
                <p className="mx-auto mt-2 max-w-sm font-body text-sm text-ink-soft">When you acquire a case file, its assets and handoff status will live here.</p>
                <Link href="/marketplace" className="btn-primary mt-5">Browse the archive</Link>
              </>}
            </div>
          )}
        </section>

        <section className="doc-card overflow-hidden">
          <div className="flex items-center justify-between border-b border-hairline p-5">
            <div><div className="field-label">Deal desk</div><h2 className="mt-1 font-display text-xl font-bold">Offers you&apos;ve sent</h2></div>
            <Link href="/offers" className="btn-ghost px-0"><MessageSquare size={14} /></Link>
          </div>
          {offers.length ? (
            <div className="divide-y divide-hairline">
              {offers.map((o) => (
                <div key={o.id} className="p-5">
                  <div className="flex items-center justify-between gap-3"><span className="font-display text-sm font-semibold">{o.listing?.title ?? "Untitled"}</span><OfferStatus status={o.status} /></div>
                  <div className="mt-1 flex items-center justify-between font-mono text-[10px] text-ink-soft"><span>{money(Number(o.amount))} offered</span><span>{new Date(o.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-10 text-center">
              <Handshake className="mx-auto text-ink-soft" size={22} />
              <p className="mt-3 font-body text-sm text-ink-soft">{loading ? "Loading…" : "No negotiations yet."}</p>
            </div>
          )}
        </section>
      </div>
    </>
  );
}
