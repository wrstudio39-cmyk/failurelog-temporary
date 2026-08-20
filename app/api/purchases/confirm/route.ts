import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe";
import { FEATURES } from "@/lib/config";

export async function POST(req: Request) {
  if (!FEATURES.payments) {
    return NextResponse.json({ error: "Payments are not enabled" }, { status: 503 });
  }
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { purchaseId } = await req.json().catch(() => ({}));
  const { data: purchase } = await supabase.from("purchases").select("id,buyer_id,lifecycle_status,stripe_payment_intent_id").eq("id", purchaseId).single();
  if (!purchase || purchase.buyer_id !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (purchase.lifecycle_status !== "buyer_verification") return NextResponse.json({ error: "Handoff is not awaiting confirmation" }, { status: 409 });
  const now = new Date().toISOString();
  if (purchase.stripe_payment_intent_id) {
    try { await getStripe().paymentIntents.capture(purchase.stripe_payment_intent_id); } catch (e) { return NextResponse.json({ error: e instanceof Error ? e.message : "Funds could not be released" }, { status: 409 }); }
  }
  const { error } = await supabase.from("purchases").update({ lifecycle_status: "released", status: "completed", buyer_confirmed_at: now, released_at: now }).eq("id", purchaseId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  await supabase.from("asset_delivery_events").insert({ purchase_id: purchaseId, actor_id: user.id, event: "buyer_confirmed", note: "Buyer confirmed the asset handoff." });
  return NextResponse.json({ ok: true });
}
