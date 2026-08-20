import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { purchaseId, note } = await req.json().catch(() => ({}));
  const { data: purchase } = await supabase.from("purchases").select("id,seller_id,lifecycle_status").eq("id", purchaseId).single();
  if (!purchase || purchase.seller_id !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (!["funds_held","seller_delivery_required"].includes(purchase.lifecycle_status)) return NextResponse.json({ error: "Purchase is not awaiting seller delivery" }, { status: 409 });
  const now = new Date().toISOString();
  const { error } = await supabase.from("purchases").update({ lifecycle_status: "buyer_verification", delivered_at: now }).eq("id", purchaseId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  await supabase.from("asset_delivery_events").insert({ purchase_id: purchaseId, actor_id: user.id, event: "seller_delivered", note: note || "Seller marked the asset handoff ready for buyer verification." });
  return NextResponse.json({ ok: true });
}
