import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { FEATURES } from "@/lib/config";

export async function POST(req: NextRequest) {
  if (!FEATURES.payments) {
    return NextResponse.json(
      { error: "Checkout is not live yet — payments haven't been enabled for this project." },
      { status: 503 }
    );
  }
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(new URL("/login", req.url));
  const formData = await req.formData();
  const listingId = String(formData.get("listingId") || "");
  const { data: listing } = await supabase.from("listings").select("id,title,slug,price,seller_id,status").eq("id", listingId).eq("status", "published").single();
  if (!listing || listing.seller_id === user.id) return NextResponse.json({ error: "Listing unavailable" }, { status: 404 });
  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: "Payments require server Supabase configuration" }, { status: 501 });
  const { data: purchase, error } = await admin.from("purchases").insert({ listing_id: listing.id, buyer_id: user.id, seller_id: listing.seller_id, amount: listing.price, status: "pending", lifecycle_status: "payment_pending" }).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({ mode: "payment", payment_intent_data: { capture_method: "manual" }, line_items: [{ price_data: { currency: "usd", product_data: { name: `FailureLog: ${listing.title}` }, unit_amount: Math.round(Number(listing.price) * 100) }, quantity: 1 }], success_url: `${req.nextUrl.origin}/dashboard?purchase=${purchase.id}`, cancel_url: `${req.nextUrl.origin}/projects/${listing.slug || listing.id}`, metadata: { purchaseId: purchase.id, listingId: listing.id, buyerId: user.id, sellerId: listing.seller_id } });
    await admin.from("purchases").update({ hold_reference: session.id, escrow_provider: "stripe" }).eq("id", purchase.id);
    return NextResponse.redirect(session.url!, 303);
  } catch (error) {
    await admin.from("purchases").update({ lifecycle_status: "payment_failed" }).eq("id", purchase.id);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Checkout failed" }, { status: 500 });
  }
}
