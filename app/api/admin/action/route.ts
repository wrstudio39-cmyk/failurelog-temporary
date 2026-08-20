import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getStripe } from "@/lib/stripe";
import { FEATURES } from "@/lib/config";

export async function POST(req: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (profile?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const { action, entityType, entityId, payload } = body as { action?: string; entityType?: string; entityId?: string; payload?: Record<string, unknown> };
  if (!action || !entityType || !entityId) return NextResponse.json({ error: "Missing action fields" }, { status: 400 });

  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ ok: true, demo: true });

  let table = "";
  let update: Record<string, unknown> = {};
  if (entityType === "listing" && ["approve", "reject"].includes(action)) {
    table = "listings";
    update = action === "approve"
      ? { status: "published", published_at: new Date().toISOString() }
      : { status: "rejected", rejection_reason: payload?.reason ?? "Rejected by admin review" };
  } else if (entityType === "dispute" && ["resolve", "refund"].includes(action)) {
    table = "disputes";
    update = { status: action === "refund" ? "refunded" : "resolved", resolution: payload?.resolution ?? action, resolved_at: new Date().toISOString(), updated_at: new Date().toISOString() };
  } else if (entityType === "payout" && action === "release") {
    table = "seller_payouts";
    update = { status: "processing" };
  } else if (entityType === "premium_request" && ["approve", "reject"].includes(action)) {
    table = "premium_badge_requests";
    update = action === "approve"
      ? { status: "approved", decided_at: new Date().toISOString() }
      : { status: "rejected", rejection_reason: payload?.reason ?? "Did not meet the premium bar", decided_at: new Date().toISOString() };
  } else {
    return NextResponse.json({ error: "Unsupported admin action" }, { status: 400 });
  }

  const { data: before } = await admin.from(table).select("*").eq("id", entityId).maybeSingle();
  const { error } = await admin.from(table).update(update).eq("id", entityId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const { data: after } = await admin.from(table).select("*").eq("id", entityId).maybeSingle();
  if (entityType === "dispute" && after?.purchase_id) {
    const { data: purchase } = await admin.from("purchases").select("stripe_payment_intent_id,status").eq("id", after.purchase_id).single();
    if (FEATURES.payments && purchase?.stripe_payment_intent_id) {
      try { if (action === "resolve") await getStripe().paymentIntents.capture(purchase.stripe_payment_intent_id); else if (action === "refund") { try { await getStripe().paymentIntents.cancel(purchase.stripe_payment_intent_id); } catch { await getStripe().refunds.create({ payment_intent: purchase.stripe_payment_intent_id }); } } } catch (e) { return NextResponse.json({ error: e instanceof Error ? e.message : "Payment settlement failed" }, { status: 409 }); }
    }
    await admin.from("purchases").update({ lifecycle_status: action === "refund" ? "refunded" : "released", status: action === "refund" ? "refunded" : "completed", released_at: action === "resolve" ? new Date().toISOString() : null }).eq("id", after.purchase_id);
    await admin.from("asset_delivery_events").insert({ purchase_id: after.purchase_id, actor_id: user.id, event: action === "refund" ? "admin_refunded" : "admin_released", note: payload?.resolution ?? action });
  }
  if (entityType === "premium_request" && action === "approve" && after?.requester_id) {
    await admin.from("profiles").update({ is_premium: true, premium_since: new Date().toISOString() }).eq("id", after.requester_id as string);
  }
  let moderationWarning: string | null = null;
  if (entityType === "listing" && (action === "approve" || action === "reject")) {
    const modResult = await admin.from("moderation_cases").upsert({ listing_id: entityId, reason: payload?.reason ?? "Manual review", risk_level: payload?.riskLevel ?? "medium", status: action === "approve" ? "approved" : "rejected", reviewer_id: user.id, notes: payload?.notes ?? null, resolved_at: new Date().toISOString() }, { onConflict: "listing_id" });
    if (modResult.error) moderationWarning = modResult.error.message;
  }
  await admin.from("admin_audit_log").insert({ admin_id: user.id, action, entity_type: entityType, entity_id: entityId, before_state: before, after_state: after, metadata: payload ?? {} });
  return NextResponse.json({ ok: true, entity: after, ...(moderationWarning ? { warning: moderationWarning } : {}) });
}
