import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { FEATURES } from "@/lib/config";

export async function POST(req: Request) {
  if (!FEATURES.payments) {
    return NextResponse.json({ error: "Payments are not enabled" }, { status: 503 });
  }
  const signature = req.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!signature || !secret) return NextResponse.json({ error: "Webhook not configured" }, { status: 400 });
  const body = await req.text();
  try {
    const stripe = getStripe();
    const event = stripe.webhooks.constructEvent(body, signature, secret);
    const admin = createAdminClient();
    if (!admin) return NextResponse.json({ error: "Admin database unavailable" }, { status: 503 });
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const purchaseId = session.metadata?.purchaseId;
      if (purchaseId) {
        await admin.from("purchases").update({ status: "pending", lifecycle_status: "funds_held", held_at: new Date().toISOString(), stripe_payment_intent_id: String(session.payment_intent || "") }).eq("id", purchaseId);
      }
    }
    return NextResponse.json({ received: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Invalid webhook" }, { status: 400 });
  }
}
