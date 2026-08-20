import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { data, error } = await supabase.from("offers").select("*, listing:listings(title,slug,price), buyer:profiles!offers_buyer_id_fkey(name), seller:profiles!offers_seller_id_fkey(name)").or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`).order("updated_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ offers: data ?? [], viewerId: user.id });
}

export async function POST(req: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const listingId = String(body.listingId || "");
  const amount = Number(body.amount || 0);
  if (!listingId || !amount || amount < 1) return NextResponse.json({ error: "Listing and valid amount are required" }, { status: 400 });
  const { data: listing } = await supabase.from("listings").select("id,seller_id,status").eq("id", listingId).single();
  if (!listing || listing.status !== "published") return NextResponse.json({ error: "Listing unavailable" }, { status: 404 });
  if (listing.seller_id === user.id) return NextResponse.json({ error: "You cannot offer on your own listing" }, { status: 400 });
  const { data, error } = await supabase.from("offers").insert({ listing_id: listingId, buyer_id: user.id, seller_id: listing.seller_id, amount, message: body.message || null, status: "sent", expires_at: new Date(Date.now() + 72 * 3600 * 1000).toISOString() }).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  await supabase.from("offer_events").insert({ offer_id: data.id, actor_id: user.id, event: "sent", metadata: { amount } });
  return NextResponse.json({ offer: data });
}
