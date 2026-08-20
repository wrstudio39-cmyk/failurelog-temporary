import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import AdminShell, { type AdminData } from "./admin-shell";
import { DEMO_PREMIUM_REQUESTS } from "@/lib/demo-data";

const demo: AdminData = {
  connected: false,
  stats: { gmv: 184920, commissions: 18492, pendingPayouts: 12640, buyers: 842, sellers: 217, liveListings: 164, reviewQueue: 12, disputes: 7 },
  moderation: [
    { id:"MOD-1048", title:"QuietCart", seller:"Mina K.", risk:"high", reason:"Revenue evidence conflicts with screenshot metadata", age:"18m", value:1200 },
    { id:"MOD-1047", title:"Mailroom OS", seller:"Arjun P.", risk:"medium", reason:"Post-mortem missing source-of-truth metrics", age:"42m", value:650 },
    { id:"MOD-1042", title:"StackNote", seller:"Lena R.", risk:"low", reason:"GitHub verification pending", age:"2h", value:390 },
    { id:"MOD-1039", title:"CartPilot", seller:"Noah B.", risk:"medium", reason:"Asset handoff checklist incomplete", age:"3h", value:2400 },
  ],
  disputes: [
    { id:"DSP-208", title:"Unverified transfer", listing:"Relayboard", buyer:"B. Shah", seller:"D. Cole", status:"awaiting_seller", age:"31m", amount:480 },
    { id:"DSP-204", title:"Incomplete asset handoff", listing:"Clipstack", buyer:"R. Ahmed", seller:"M. Chen", status:"evidence_review", age:"2h", amount:220 },
    { id:"DSP-198", title:"Repository access", listing:"InvoiceKit", buyer:"J. Lee", seller:"S. Patel", status:"buyer_response", age:"5h", amount:350 },
  ],
  payouts: [
    { id:"PYO-991", seller:"Devon Okafor", amount:4860, fee:540, status:"ready", age:"12m" },
    { id:"PYO-987", seller:"Priya Nair", amount:2310, fee:257, status:"processing", age:"38m" },
    { id:"PYO-981", seller:"Amara Chen", amount:1180, fee:131, status:"blocked", age:"1h" },
  ],
  funnel: [
    { stage:"Idea signals", value: 12640, delta: "+14%", note:"searches, saves, dead-product patterns" },
    { stage:"Seller drafts", value: 1840, delta: "+9%", note:"case files started" },
    { stage:"Submitted", value: 622, delta: "+6%", note:"ready for archive desk" },
    { stage:"Approved", value: 438, delta: "+11%", note:"trust + content gates passed" },
    { stage:"Sold", value: 164, delta: "+18%", note:"completed transfers" },
    { stage:"Second life", value: 71, delta: "+27%", note:"buyers who shipped an outcome" },
  ],
  signals: [
    "Three listings are repeatedly viewed but never saved. Test clearer failure labels before changing price.",
    "Browser-extension projects convert 1.7× better after verified repo access is visible above the fold.",
    "Disputes cluster around asset handoff, not payment. Turn the handoff checklist into a mandatory release gate.",
  ],
  premiumRequests: DEMO_PREMIUM_REQUESTS.filter((r) => r.status === "pending_review").map((r) => ({
    id: r.id,
    name: r.requester_name ?? "Unknown",
    role: r.requester_role,
    amount: r.amount,
    note: r.note,
    age: "live",
  })),
};

// TEMP PREVIEW MODE — remove this block once real Supabase auth is wired up.
const PREVIEW_MODE = true;

export default async function AdminPage() {
  if (PREVIEW_MODE) return <AdminShell data={demo} />;

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (profile?.role !== "admin") redirect("/dashboard");

  const admin = createAdminClient();
  if (!admin) return <AdminShell data={demo} />;

  const [listings, purchases, payouts, profiles, disputes, premiumRequests] = await Promise.all([
    admin.from("listings").select("id,title,status,price,created_at,seller_id").order("created_at", { ascending: false }).limit(500),
    admin.from("purchases").select("id,amount,status,lifecycle_status,created_at,listing_id").order("created_at", { ascending: false }).limit(500),
    admin.from("seller_payouts").select("id,amount,platform_fee,status,created_at,seller_id").order("created_at", { ascending: false }).limit(100),
    admin.from("profiles").select("id,name,role").limit(1000),
    admin.from("disputes").select("id,reason,status,amount,created_at,listing_id,buyer_id,seller_id").order("created_at", { ascending: false }).limit(100),
    admin.from("premium_badge_requests").select("id,requester_id,requester_role,amount,note,created_at").eq("status", "pending_review").order("created_at", { ascending: true }).limit(50),
  ]);

  if (listings.error || purchases.error || payouts.error || profiles.error || disputes.error) return <AdminShell data={demo} />;

  const sellerMap = new Map((profiles.data ?? []).map(p => [p.id, p.name]));
  const live = (listings.data ?? []).filter(x => x.status === "published").length;
  const review = (listings.data ?? []).filter(x => x.status === "pending_review").length;
  const gmv = (purchases.data ?? []).filter(x => x.status === "completed").reduce((a,x) => a + Number(x.amount || 0), 0);
  const commissions = (payouts.data ?? []).reduce((a,x) => a + Number(x.platform_fee || 0), 0);
  const pending = (payouts.data ?? []).filter(x => x.status !== "paid").reduce((a,x) => a + Number(x.amount || 0), 0);

  const data: AdminData = {
    connected: true,
    stats: { gmv, commissions, pendingPayouts: pending, buyers: (profiles.data ?? []).filter(x=>x.role === "buyer").length, sellers: (profiles.data ?? []).filter(x=>x.role === "seller").length, liveListings: live, reviewQueue: review, disputes: (disputes.data ?? []).filter(x=>!['resolved','refunded'].includes(x.status)).length },
    moderation: (listings.data ?? []).filter(x=>x.status === "pending_review").slice(0,8).map((x,i)=>({ id:`MOD-${String(1100-i)}`, title:x.title, seller:sellerMap.get(x.seller_id) ?? "Unknown seller", risk:i===0?"high":i<3?"medium":"low", reason:"Manual review required before publishing", age:`${i+1}h`, value:Number(x.price||0) })),
    disputes: (disputes.data ?? []).filter(x=>!['resolved','refunded'].includes(x.status)).slice(0,8).map((x,i)=>({ id:x.id, title:x.reason, listing:x.listing_id, buyer:x.buyer_id, seller:x.seller_id, status:x.status, age:`${i+1}h`, amount:Number(x.amount||0) })),
    payouts: (payouts.data ?? []).slice(0,8).map(x=>({ id:x.id, seller:sellerMap.get(x.seller_id) ?? "Unknown seller", amount:Number(x.amount||0), fee:Number(x.platform_fee||0), status:x.status, age:"live" })),
    funnel: demo.funnel,
    signals: demo.signals,
    premiumRequests: (premiumRequests.error ? [] : premiumRequests.data ?? []).map((r) => ({
      id: r.id,
      name: sellerMap.get(r.requester_id) ?? "Unknown user",
      role: r.requester_role as "buyer" | "seller",
      amount: Number(r.amount || 10),
      note: r.note,
      age: "live",
    })),
  };
  return <AdminShell data={data} />;
}
