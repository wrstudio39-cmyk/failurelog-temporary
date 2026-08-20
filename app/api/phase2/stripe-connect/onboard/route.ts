import { NextRequest, NextResponse } from "next/server";
import { FEATURES } from "@/lib/config";
import { createClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  if (!FEATURES.stripeConnectPayouts) return NextResponse.json({ error: "Feature disabled" }, { status: 404 });
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const stripe = getStripe();
    const body = await req.json().catch(() => ({}));
    const returnUrl = body.returnUrl || `${req.nextUrl.origin}/dashboard?stripe=complete`;
    const refreshUrl = body.refreshUrl || `${req.nextUrl.origin}/dashboard?stripe=refresh`;
    const { data: profile } = await supabase.from("profiles").select("stripe_connect_account_id").eq("id", user.id).single();
    let accountId = profile?.stripe_connect_account_id;
    if (!accountId) {
      const account = await stripe.accounts.create({ type: "express", email: user.email || undefined });
      accountId = account.id;
      await supabase.from("profiles").update({ stripe_connect_account_id: accountId }).eq("id", user.id);
    }
    const link = await stripe.accountLinks.create({ account: accountId, refresh_url: refreshUrl, return_url: returnUrl, type: "account_onboarding" });
    return NextResponse.json({ accountId, url: link.url });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Stripe Connect onboarding failed" }, { status: 400 });
  }
}
