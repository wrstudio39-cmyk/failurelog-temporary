import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const form = await req.formData();
  const listingId = String(form.get("listingId") || "");
  const file = form.get("file");
  if (!listingId || !(file instanceof File)) return NextResponse.json({ error: "listingId and file are required" }, { status: 400 });
  const { data: listing } = await supabase.from("listings").select("id,seller_id").eq("id", listingId).single();
  if (!listing || listing.seller_id !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: "Server storage is not configured" }, { status: 501 });
  const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `${user.id}/${listingId}/${crypto.randomUUID()}-${safe}`;
  const bytes = new Uint8Array(await file.arrayBuffer());
  const upload = await admin.storage.from("listing-assets").upload(path, bytes, { contentType: file.type || "application/octet-stream", upsert: false });
  if (upload.error) return NextResponse.json({ error: upload.error.message }, { status: 500 });
  const asset = await admin.from("project_assets").insert({ listing_id: listingId, label: file.name, included: true, storage_path: path, asset_type: file.type || "other", file_size: file.size, uploaded_at: new Date().toISOString() }).select().single();
  if (asset.error) {
    await admin.storage.from("listing-assets").remove([path]);
    return NextResponse.json({ error: asset.error.message }, { status: 500 });
  }
  return NextResponse.json({ asset: asset.data });
}
