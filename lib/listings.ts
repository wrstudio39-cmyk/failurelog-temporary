import { createClient } from "@/lib/supabase/server";
import { DEMO_LISTINGS, getDemoListingBySlug } from "@/lib/demo-data";
import type { Listing } from "@/types";

const SUPABASE_CONFIGURED =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function getPublishedListings(): Promise<Listing[]> {
  if (!SUPABASE_CONFIGURED) return DEMO_LISTINGS;

  const supabase = createClient();
  const { data, error } = await supabase
    .from("listings")
    .select(
      "*, seller:profiles(*), post_mortem:post_mortems(*), metrics:project_metrics(*), media:project_media(*), assets:project_assets(id,label,included,asset_type,sort_order), verification:project_verifications(*)"
    )
    .eq("status", "published")
    .order("published_at", { ascending: false });

  if (error || !data) return DEMO_LISTINGS;
  return data as unknown as Listing[];
}

export async function getListingBySlug(slug: string): Promise<Listing | null> {
  if (!SUPABASE_CONFIGURED) return getDemoListingBySlug(slug);

  const supabase = createClient();
  const { data, error } = await supabase
    .from("listings")
    .select(
      "*, seller:profiles(*), post_mortem:post_mortems(*), metrics:project_metrics(*), media:project_media(*), assets:project_assets(id,label,included,asset_type,sort_order), verification:project_verifications(*)"
    )
    .eq("slug", slug)
    .single();

  if (error || !data) return getDemoListingBySlug(slug);
  return data as unknown as Listing;
}

export async function getPendingListings(): Promise<Listing[]> {
  if (!SUPABASE_CONFIGURED) return [];
  const supabase = createClient();
  const { data, error } = await supabase
    .from("listings")
    .select("*, seller:profiles(*), post_mortem:post_mortems(*)")
    .eq("status", "pending_review")
    .order("created_at", { ascending: true });
  if (error || !data) return [];
  return data as unknown as Listing[];
}
