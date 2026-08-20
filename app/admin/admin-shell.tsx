"use client";
import { useMemo, useState } from "react";
import {
  Activity, ArrowUpRight, Banknote, Check, CheckCircle2,
  ChevronRight, CircleDollarSign, Gauge, Gem,
  Lightbulb, LockKeyhole, MoreHorizontal, Pause, Play, RefreshCw, Search, ShieldAlert,
  ShieldCheck, Sparkles, UserRound, Users, WalletCards, X, Zap, type LucideIcon
} from "lucide-react";

export type AdminData = {
  connected: boolean;
  stats: { gmv:number; commissions:number; pendingPayouts:number; buyers:number; sellers:number; liveListings:number; reviewQueue:number; disputes:number };
  moderation: {id:string; title:string; seller:string; risk:string; reason:string; age:string; value:number}[];
  disputes: {id:string; title:string; listing:string; buyer:string; seller:string; status:string; age:string; amount:number}[];
  payouts: {id:string; seller:string; amount:number; fee:number; status:string; age:string}[];
  funnel: {stage:string; value:number; delta:string; note:string}[];
  signals: string[];
  premiumRequests: {id:string; name:string; role:"buyer"|"seller"; amount:number; note?:string|null; age:string}[];
};

const money=(n:number)=>new Intl.NumberFormat("en-US",{style:"currency",currency:"USD",maximumFractionDigits:0}).format(n);
const riskClass=(r:string)=>r==="high"?"border-brick/40 bg-brick/5 text-brick":r==="medium"?"border-warning/40 bg-warning/5 text-warning":"border-signal/40 bg-signal/5 text-signal";

export default function AdminShell({data}: {data:AdminData}) {
  const [tab,setTab]=useState("overview");
  const [query,setQuery]=useState("");
  const [toast,setToast]=useState("");
  const [paused,setPaused]=useState(false);
  const [moderation,setModeration]=useState(data.moderation);
  const [disputes,setDisputes]=useState(data.disputes);
  const [payouts,setPayouts]=useState(data.payouts);
  const [premiumRequests,setPremiumRequests]=useState(data.premiumRequests);
  const [idea,setIdea]=useState("");

  const notify=(text:string)=>{setToast(text);setTimeout(()=>setToast(""),2200)};
  const action=async (body:Record<string,unknown>)=>{ if(!data.connected) return true; const r=await fetch("/api/admin/action",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(body)}); if(!r.ok){notify("Admin action failed. Check the audit log / permissions."); return false;} return true; };
  const filtered=useMemo(()=>moderation.filter(x=>`${x.title} ${x.seller} ${x.reason}`.toLowerCase().includes(query.toLowerCase())),[moderation,query]);
  const approve=async (id:string)=>{if(await action({action:"approve",entityType:"listing",entityId:id})){setModeration(x=>x.filter(i=>i.id!==id));notify("Listing approved and queued for publication.")}};
  const reject=async (id:string)=>{if(await action({action:"reject",entityType:"listing",entityId:id,payload:{reason:"Failed manual moderation gate"}})){setModeration(x=>x.filter(i=>i.id!==id));notify("Listing rejected. Seller notification prepared.")}};
  const resolve=async (id:string)=>{if(await action({action:"resolve",entityType:"dispute",entityId:id,payload:{resolution:"Resolved by admin"}})){setDisputes(x=>x.filter(i=>i.id!==id));notify("Dispute moved to resolved ledger.")}};
  const payout=async (id:string)=>{if(await action({action:"release",entityType:"payout",entityId:id})){setPayouts(x=>x.map(i=>i.id===id?{...i,status:"processing"}:i));notify("Payout released to processing.")}};
  const approvePremium=async (id:string,name:string)=>{if(await action({action:"approve",entityType:"premium_request",entityId:id})){setPremiumRequests(x=>x.filter(i=>i.id!==id));notify(`${name} is now marked Premium.`)}};
  const rejectPremium=async (id:string)=>{if(await action({action:"reject",entityType:"premium_request",entityId:id,payload:{reason:"Did not meet the premium bar"}})){setPremiumRequests(x=>x.filter(i=>i.id!==id));notify("Premium request declined.")}};

  const nav=[
    ["overview","Command center",Gauge], ["moderation","Archive desk",ShieldCheck], ["disputes","Disputes",ShieldAlert],
    ["premium","Premium requests",Gem], ["finance","Money rail",CircleDollarSign], ["funnel","Idea funnel",Lightbulb], ["people","People",Users]
  ] as const;
  return <div className="min-h-[calc(100vh-73px)] bg-[var(--surface-0)]">
    <div className="mx-auto max-w-[1600px] px-4 py-5 lg:px-7 lg:py-7">
      <div className="grid gap-5 lg:grid-cols-[230px_1fr]">
        <aside className="doc-card h-fit p-3 lg:sticky lg:top-24">
          <div className="px-3 py-3"><div className="field-label flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-brick animate-pulse"/> Admin / root</div><div className="mt-2 font-display text-lg font-bold">Control plane</div></div>
          <div className="space-y-1">{nav.map(([id,label,I])=><button key={id} onClick={()=>setTab(id)} className={`flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm transition-all ${tab===id?"bg-ink text-paper shadow-card":"text-ink-soft hover:bg-paper-dim hover:text-ink"}`}><I size={15}/><span>{label}</span>{id==="moderation"&&<span className="ml-auto rounded-full bg-warning/15 px-1.5 py-0.5 font-mono text-[9px] text-warning">{moderation.length}</span>}{id==="disputes"&&<span className="ml-auto rounded-full bg-brick/15 px-1.5 py-0.5 font-mono text-[9px] text-brick">{disputes.length}</span>}{id==="premium"&&premiumRequests.length>0&&<span className="ml-auto rounded-full bg-primary/15 px-1.5 py-0.5 font-mono text-[9px] text-primary">{premiumRequests.length}</span>}</button>)}</div>
          <div className="mt-4 border-t border-hairline pt-4"><button onClick={()=>{setPaused(!paused);notify(paused?"Marketplace intake resumed.":"Marketplace intake paused.")}} className={`flex w-full items-center gap-3 rounded-md border px-3 py-2.5 text-left text-xs ${paused?"border-warning/40 text-warning":"border-hairline text-ink-soft"}`}>{paused?<Play size={14}/>:<Pause size={14}/>} {paused?"Resume marketplace":"Pause marketplace"}</button></div>
        </aside>

        <main className="min-w-0">
          <header className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div><div className="field-label flex items-center gap-2"><LockKeyhole size={12}/> privileged workspace · {data.connected?"live data":"demo mode"}</div><h1 className="display-lg mt-2">The platform, under a microscope.</h1><p className="mt-2 max-w-3xl text-sm leading-6 text-ink-soft">Moderate supply, protect transfers, watch the money rail, and turn every strange pattern into the next product idea.</p></div>
            <div className="flex flex-wrap gap-2"><div className="relative"><Search className="absolute left-3 top-2.5 text-ink-soft" size={15}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search the control plane" className="h-10 w-64 rounded-md border border-hairline bg-[var(--surface-1)] pl-9 pr-3 text-sm outline-none focus:border-primary"/></div><button className="btn-secondary" onClick={()=>notify("Control-plane data refreshed.")}><RefreshCw size={15}/> Refresh</button></div>
          </header>

          {tab==="overview"&&<Overview data={data} moderation={moderation} disputes={disputes} payouts={payouts} premiumRequests={premiumRequests} setTab={setTab}/>} 
          {tab==="moderation"&&<Moderation rows={filtered} approve={approve} reject={reject} notify={notify}/>} 
          {tab==="disputes"&&<Disputes rows={disputes} resolve={resolve} notify={notify}/>} 
          {tab==="premium"&&<Premium rows={premiumRequests} approve={approvePremium} reject={rejectPremium}/>} 
          {tab==="finance"&&<Finance data={data} payouts={payouts} payout={payout} notify={notify}/>} 
          {tab==="funnel"&&<Funnel data={data} idea={idea} setIdea={setIdea} notify={notify}/>} 
          {tab==="people"&&<People data={data} notify={notify}/>} 
        </main>
      </div>
    </div>
    {toast&&<div className="fixed bottom-5 right-5 z-[80] flex items-center gap-2 rounded-md border border-hairline bg-[var(--surface-1)] px-4 py-3 text-sm shadow-dialog"><CheckCircle2 size={15} className="text-signal"/>{toast}</div>}
  </div>
}

function Overview({data,moderation,disputes,payouts,premiumRequests,setTab}:{data:AdminData;moderation:AdminData["moderation"];disputes:AdminData["disputes"];payouts:AdminData["payouts"];premiumRequests:AdminData["premiumRequests"];setTab:(x:string)=>void}){
  const cards: [string, string, string, LucideIcon, string][] = [
    ["Platform GMV",money(data.stats.gmv),"completed transactions",CircleDollarSign,"+18.4%"],
    ["Commission captured",money(data.stats.commissions),"platform take",Banknote,"+12.1%"],
    ["Payout exposure",money(data.stats.pendingPayouts),"not yet settled",WalletCards,"watch"],
    ["Trust queue",String(data.stats.reviewQueue).padStart(2,"0"),"manual reviews",ShieldCheck,"live"],
    ["Open disputes",String(data.stats.disputes).padStart(2,"0"),"buyer / seller cases",ShieldAlert,"priority"],
  ];
  const radar: [string, number, string, LucideIcon, string][] = [
    ["Archive desk",moderation.length,"listings cannot publish themselves",ShieldCheck,"moderation"],
    ["Dispute desk",disputes.length,"handoffs need evidence",ShieldAlert,"disputes"],
    ["Premium desk",premiumRequests.length,"badge requests await a decision",Gem,"premium"],
    ["Money rail",payouts.filter(x=>x.status!=="paid").length,"payouts need settlement",WalletCards,"finance"]
  ];
  return <>
    <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">{cards.map(([a,b,c,Icon,d])=><div key={a} className="doc-card p-5"><div className="flex justify-between"><Icon size={16} className="text-primary"/><span className="font-mono text-[9px] text-ink-soft">{d}</span></div><div className="mt-7 font-display text-2xl font-bold">{b}</div><div className="micro-kicker mt-1">{a}</div><div className="mt-3 text-xs text-ink-soft">{c}</div></div>)}</section>
    <div className="mt-5 grid gap-5 xl:grid-cols-[1.3fr_.7fr]">
      <section className="doc-card p-5"><div className="flex items-center justify-between"><div><div className="field-label">Operations radar</div><h2 className="mt-1 font-display text-xl font-bold">What needs a human today</h2></div><Activity size={18} className="text-primary"/></div><div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{radar.map(([t,n,d,Icon,id])=><button onClick={()=>setTab(id)} key={t} className="rounded-md border border-hairline p-4 text-left transition-all hover:-translate-y-0.5 hover:border-primary"><div className="flex justify-between"><Icon size={16} className="text-ink-soft"/><ChevronRight size={15} className="text-ink-soft"/></div><div className="mt-6 font-display text-3xl font-bold">{n}</div><div className="micro-kicker mt-1">{t}</div><p className="mt-2 text-xs leading-5 text-ink-soft">{d}</p></button>)}</div></section>
      <section className="doc-card p-5"><div className="field-label">Idea engine</div><h2 className="mt-1 font-display text-xl font-bold">Patterns worth shipping</h2><div className="mt-4 space-y-3">{data.signals.map((s,i)=><div key={i} className="flex gap-3 border-t border-hairline pt-3"><span className="font-mono text-[9px] text-primary">0{i+1}</span><p className="text-sm leading-6">{s}</p></div>)}</div><button onClick={()=>setTab("funnel")} className="btn-primary mt-5 w-full"><Sparkles size={15}/> Open idea funnel</button></section>
    </div>
  </>
}

function Moderation({rows,approve,reject,notify}:{rows:AdminData["moderation"];approve:(id:string)=>void;reject:(id:string)=>void;notify:(s:string)=>void}){return <section className="doc-card overflow-hidden"><div className="border-b border-hairline p-5"><div className="field-label">Content moderation pipeline</div><div className="mt-1 flex items-center justify-between"><h2 className="font-display text-xl font-bold">Nothing publishes without a decision.</h2><span className="case-stamp case-stamp--pending">{rows.length} queued</span></div></div><div className="divide-y divide-hairline">{rows.map(r=><div key={r.id} className="p-5 transition-colors hover:bg-paper-dim"><div className="grid gap-4 lg:grid-cols-[1fr_220px_auto] lg:items-center"><div><div className="flex flex-wrap items-center gap-2"><span className="font-mono text-[10px] text-ink-soft">{r.id}</span><span className={`rounded-full border px-2 py-0.5 font-mono text-[9px] uppercase ${riskClass(r.risk)}`}>{r.risk} risk</span><span className="font-mono text-[9px] text-ink-soft">{r.age}</span></div><h3 className="mt-2 font-display text-lg font-bold">{r.title}</h3><p className="mt-1 text-sm text-ink-soft">{r.seller} · {r.reason}</p></div><div className="rounded-md border border-hairline bg-paper-dim p-3"><div className="micro-kicker">Listing value</div><div className="mt-1 font-display text-lg font-bold">{money(r.value)}</div><div className="mt-1 text-[11px] text-ink-soft">risk-adjusted review</div></div><div className="flex gap-2 lg:justify-end"><button onClick={()=>approve(r.id)} className="btn-secondary text-signal"><Check size={14}/> Approve</button><button onClick={()=>reject(r.id)} className="btn-secondary text-brick"><X size={14}/> Reject</button><button onClick={()=>notify(`Opened evidence packet for ${r.title}.`)} className="btn-secondary px-3"><MoreHorizontal size={15}/></button></div></div></div>)}</div>{rows.length===0&&<div className="p-12 text-center text-sm text-ink-soft">Queue clear. The archive desk can breathe.</div>}</section>}

function Disputes({rows,resolve,notify}:{rows:AdminData["disputes"];resolve:(id:string)=>void;notify:(s:string)=>void}){return <section className="doc-card overflow-hidden"><div className="border-b border-hairline p-5"><div className="field-label">Transfer integrity</div><h2 className="mt-1 font-display text-xl font-bold">Dispute handling system</h2><p className="mt-2 text-sm text-ink-soft">Treat every dispute as an evidence packet: payment, repository access, asset checklist, timestamps, and both parties' claims.</p></div><div className="divide-y divide-hairline">{rows.map(r=><div key={r.id} className="p-5"><div className="grid gap-4 xl:grid-cols-[1fr_210px_230px_auto] xl:items-center"><div><div className="font-mono text-[10px] text-ink-soft">{r.id} · {r.age}</div><h3 className="mt-1 font-display text-lg font-bold">{r.title}</h3><p className="mt-1 text-sm text-ink-soft">{r.listing} · buyer {r.buyer} · seller {r.seller}</p></div><div><div className="micro-kicker">Escrow value</div><div className="mt-1 font-display text-xl font-bold">{money(r.amount)}</div></div><div><span className="case-stamp case-stamp--pending">{r.status.replaceAll("_"," ")}</span><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-paper-dim"><div className="h-full w-2/3 bg-warning"/></div><div className="mt-1 text-[10px] text-ink-soft">evidence completeness 66%</div></div><div className="flex gap-2 xl:justify-end"><button onClick={()=>notify(`Evidence packet opened for ${r.id}.`)} className="btn-secondary">Inspect</button><button onClick={()=>resolve(r.id)} className="btn-primary"><CheckCircle2 size={14}/> Resolve</button></div></div></div>)}</div></section>}

function Premium({rows,approve,reject}:{rows:AdminData["premiumRequests"];approve:(id:string,name:string)=>void;reject:(id:string)=>void}){
  return <section className="doc-card overflow-hidden">
    <div className="border-b border-hairline p-5">
      <div className="field-label">Trust program</div>
      <div className="mt-1 flex items-center justify-between"><h2 className="font-display text-xl font-bold">Premium badge requests.</h2><span className="case-stamp case-stamp--pending">{rows.length} queued</span></div>
      <p className="mt-2 max-w-2xl text-sm text-ink-soft">Buyers and sellers pay a flat $10 to request the Premium mark. Approve only accounts with real activity behind them — the badge is worth nothing if everyone has it.</p>
    </div>
    <div className="divide-y divide-hairline">
      {rows.map(r=>
        <div key={r.id} className="grid gap-4 p-5 lg:grid-cols-[1fr_140px_auto] lg:items-center">
          <div>
            <div className="flex flex-wrap items-center gap-2"><span className="font-mono text-[10px] text-ink-soft">{r.id}</span><span className="rounded-full border border-hairline px-2 py-0.5 font-mono text-[9px] uppercase text-ink-soft">{r.role}</span><span className="font-mono text-[9px] text-ink-soft">{r.age}</span></div>
            <h3 className="mt-2 font-display text-lg font-bold">{r.name}</h3>
            {r.note && <p className="mt-1 text-sm text-ink-soft">{r.note}</p>}
          </div>
          <div className="rounded-md border border-hairline bg-paper-dim p-3"><div className="micro-kicker">Payment</div><div className="mt-1 font-display text-lg font-bold">${r.amount}</div></div>
          <div className="flex gap-2 lg:justify-end">
            <button onClick={()=>approve(r.id,r.name)} className="btn-secondary text-signal"><Check size={14}/> Approve</button>
            <button onClick={()=>reject(r.id)} className="btn-secondary text-brick"><X size={14}/> Reject</button>
          </div>
        </div>
      )}
    </div>
    {rows.length===0&&<div className="p-12 text-center text-sm text-ink-soft">No pending premium requests. Every badge in the archive has been earned.</div>}
  </section>;
}

function Finance({data,payouts,payout,notify}:{data:AdminData;payouts:AdminData["payouts"];payout:(id:string)=>void;notify:(s:string)=>void}){return <div className="space-y-5"><section className="grid gap-3 md:grid-cols-3"><div className="doc-card p-5"><div className="micro-kicker">Take rate</div><div className="mt-2 font-display text-3xl font-bold">10.0%</div><p className="mt-2 text-xs text-ink-soft">Configured platform commission</p></div><div className="doc-card p-5"><div className="micro-kicker">Commission leakage</div><div className="mt-2 font-display text-3xl font-bold">0.8%</div><p className="mt-2 text-xs text-ink-soft">estimated disputes / refunds / reversals</p></div><div className="doc-card p-5"><div className="micro-kicker">Payout SLA</div><div className="mt-2 font-display text-3xl font-bold">3h 18m</div><p className="mt-2 text-xs text-ink-soft">median from completed sale to release</p></div></section><section className="doc-card overflow-hidden"><div className="border-b border-hairline p-5"><div className="field-label">Payout ledger</div><h2 className="mt-1 font-display text-xl font-bold">Every dollar has a state.</h2></div><div className="divide-y divide-hairline">{payouts.map(p=><div key={p.id} className="grid gap-3 p-5 md:grid-cols-[1fr_160px_130px_150px_auto] md:items-center"><div><div className="font-mono text-[10px] text-ink-soft">{p.id} · {p.age}</div><div className="mt-1 font-semibold">{p.seller}</div></div><div><div className="micro-kicker">Seller receives</div><div className="mt-1 font-display font-bold">{money(p.amount)}</div></div><div><div className="micro-kicker">Fee</div><div className="mt-1 font-mono text-xs">{money(p.fee)}</div></div><div><span className="case-stamp case-stamp--pending">{p.status}</span></div><div className="flex justify-end gap-2"><button onClick={()=>notify(`Opened Stripe / transfer evidence for ${p.id}.`)} className="btn-secondary px-3"><MoreHorizontal size={15}/></button><button disabled={p.status==="processing"} onClick={()=>payout(p.id)} className="btn-primary">Release</button></div></div>)}</div></section></div>}

function Funnel({data,idea,setIdea,notify}:{data:AdminData;idea:string;setIdea:(s:string)=>void;notify:(s:string)=>void}){return <div className="space-y-5"><section className="doc-card p-5"><div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between"><div><div className="field-label">Compounding idea funnel</div><h2 className="mt-1 font-display text-xl font-bold">Turn platform exhaust into product direction.</h2><p className="mt-2 max-w-3xl text-sm text-ink-soft">Do not ask “what feature should we build?” Start with repeated friction, quantify it, connect it to money or trust, then promote the strongest signal into a test.</p></div><button className="btn-primary" onClick={()=>notify("New idea signal captured.")}><Zap size={15}/> Capture signal</button></div><div className="mt-6 grid gap-2 lg:grid-cols-6">{data.funnel.map((f,i)=><div key={f.stage} className="relative rounded-md border border-hairline bg-paper-dim p-4"><div className="font-mono text-[9px] text-primary">0{i+1}</div><div className="mt-5 font-display text-2xl font-bold">{f.value.toLocaleString()}</div><div className="micro-kicker mt-1">{f.stage}</div><div className="mt-3 flex items-center gap-1 font-mono text-[9px] text-signal"><ArrowUpRight size={11}/>{f.delta}</div><p className="mt-2 text-[11px] leading-5 text-ink-soft">{f.note}</p>{i<data.funnel.length-1&&<ChevronRight className="absolute -right-3 top-1/2 hidden text-ink-soft lg:block" size={15}/>}</div>)}</div></section><div className="grid gap-5 lg:grid-cols-[1fr_.8fr]"><section className="doc-card p-5"><div className="field-label">Signal capture</div><h3 className="mt-1 font-display text-lg font-bold">Feed the funnel</h3><textarea value={idea} onChange={e=>setIdea(e.target.value)} placeholder="Example: buyers keep asking for a verified handoff receipt after purchase..." className="mt-4 min-h-28 w-full rounded-md border border-hairline bg-paper-dim p-3 text-sm outline-none focus:border-primary"/><div className="mt-3 flex justify-end"><button onClick={()=>{if(idea.trim()){notify("Signal promoted to discovery backlog.");setIdea("")}}} className="btn-primary"><Lightbulb size={15}/> Promote signal</button></div></section><section className="doc-card p-5"><div className="field-label">Next experiments</div><div className="mt-4 space-y-3">{data.signals.map((s,i)=><div key={i} className="rounded-md border border-hairline p-3"><div className="flex items-center justify-between"><span className="font-mono text-[9px] text-primary">TEST-{18-i}</span><span className="case-stamp case-stamp--pending">queued</span></div><p className="mt-2 text-sm leading-5">{s}</p></div>)}</div></section></div></div>}

function People({data,notify}:{data:AdminData;notify:(s:string)=>void}){return <div className="grid gap-5 md:grid-cols-2"><section className="doc-card p-5"><div className="flex justify-between"><Users size={17}/><span className="font-mono text-[10px] text-ink-soft">LIVE</span></div><div className="mt-7 font-display text-4xl font-bold">{data.stats.sellers}</div><div className="micro-kicker mt-1">active sellers</div><p className="mt-3 text-sm text-ink-soft">Monitor supply quality, review volume, payout health, and seller trust signals.</p><button onClick={()=>notify("Seller directory opened.")} className="btn-secondary mt-5 w-full">Open seller directory <ChevronRight size={14}/></button></section><section className="doc-card p-5"><div className="flex justify-between"><UserRound size={17}/><span className="font-mono text-[10px] text-ink-soft">LIVE</span></div><div className="mt-7 font-display text-4xl font-bold">{data.stats.buyers}</div><div className="micro-kicker mt-1">buyers</div><p className="mt-3 text-sm text-ink-soft">Watch buyer activation, saved projects, disputes, and second-life outcomes.</p><button onClick={()=>notify("Buyer directory opened.")} className="btn-secondary mt-5 w-full">Open buyer directory <ChevronRight size={14}/></button></section></div>}
