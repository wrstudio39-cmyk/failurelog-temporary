import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { PREMIUM_BADGE } from "@/lib/config";

/* ----------------------------------------------------------------
   Premium badge program.

   Flow: buyer or seller requests the badge (flat $10) -> payment is
   captured -> request sits in `premium_badge_requests` as
   "pending_review" -> admin approves/rejects from the control room
   (see /api/admin/action, entityType "premium_request") -> on
   approval `profiles.is_premium` is set true.

   This route only manages the request record. Payment capture is
   expected to happen the same way /api/checkout does today (Stripe
   PaymentIntent/Checkout Session) — left for the backend pass. Until
   then POSTing here creates a "pending_review" request directly so
   the frontend admin queue and dashboards have something real to
   operate on end-to-end.
   ---------------------------------------------------------------- */

export async function GET() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("premium_badge_requests")
    .select("*")
    .eq("requester_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) return NextResponse.json({ status: "none" });
  return NextResponse.json({ request: data ?? null, status: data?.status ?? "none" });
}

export async function POST(req: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase.from("profiles").select("role,is_premium").eq("id", user.id).maybeSingle();
  if (profile?.is_premium) return NextResponse.json({ error: "Already premium" }, { status: 400 });

  const body = await req.json().catch(() => ({}));
  const note = typeof body.note === "string" ? body.note.slice(0, 400) : null;
  const role = profile?.role === "seller" ? "seller" : "buyer";

  const { data, error } = await supabase
    .from("premium_badge_requests")
    .insert({
      requester_id: user.id,
      requester_role: role,
      amount: PREMIUM_BADGE.price,
      status: "pending_review",
      note,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ request: data });
}
