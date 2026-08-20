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
  const { purchaseId, reason } = await req.json().catch(() => ({}));
  const { data: purchase } = await supabase.from("purchases").select("id,listing_id,buyer_id,seller_id,amount,lifecycle_status,stripe_payment_intent_id").eq("id", purchaseId).single();
  if (!purchase || (purchase.buyer_id !== user.id && purchase.seller_id !== user.id)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (!["funds_held","seller_delivery_required","buyer_verification"].includes(purchase.lifecycle_status)) return NextResponse.json({ error: "This purchase cannot be disputed now" }, { status: 409 });
  const now = new Date().toISOString();
  if (purchase.stripe_payment_intent_id && purchase.lifecycle_status !== "released") { try { await getStripe().paymentIntents.cancel(purchase.stripe_payment_intent_id); } catch {} }
  await supabase.from("purchases").update({ lifecycle_status: "disputed", disputed_at: now }).eq("id", purchaseId);
  const { data: dispute, error } = await supabase.from("disputes").insert({ purchase_id: purchase.id, listing_id: purchase.listing_id, buyer_id: purchase.buyer_id, seller_id: purchase.seller_id, reason: reason || "Asset handoff disputed", status: "open", amount: purchase.amount }).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  await supabase.from("asset_delivery_events").insert({ purchase_id: purchaseId, actor_id: user.id, event: "buyer_disputed", note: reason || "Purchase dispute opened." });
  return NextResponse.json({ dispute });
}
