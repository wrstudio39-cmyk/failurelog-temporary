import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(req: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const url = new URL(req.url);
  const assetId = String(url.searchParams.get("assetId") || "");
  if (!assetId) return NextResponse.json({ error: "Missing assetId" }, { status: 400 });
  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: "Storage unavailable" }, { status: 501 });
  const { data: asset } = await admin.from("project_assets").select("id,listing_id,storage_path").eq("id", assetId).single();
  if (!asset?.storage_path) return NextResponse.json({ error: "Asset not found" }, { status: 404 });
  const { data: listing } = await admin.from("listings").select("seller_id").eq("id", asset.listing_id).single();
  if (listing?.seller_id === user.id) {
    const signed = await admin.storage.from("listing-assets").createSignedUrl(asset.storage_path, 120);
    return signed.error ? NextResponse.json({ error: signed.error.message }, { status: 500 }) : NextResponse.redirect(signed.data.signedUrl);
  }
  const { data: purchase } = await admin.from("purchases").select("id,lifecycle_status").eq("listing_id", asset.listing_id).eq("buyer_id", user.id).in("lifecycle_status", ["released","completed"]).order("created_at", { ascending: false }).limit(1).maybeSingle();
  if (!purchase) return NextResponse.json({ error: "Asset is locked until the handoff is released" }, { status: 403 });
  const signed = await admin.storage.from("listing-assets").createSignedUrl(asset.storage_path, 120);
  return signed.error ? NextResponse.json({ error: signed.error.message }, { status: 500 }) : NextResponse.redirect(signed.data.signedUrl);
}
