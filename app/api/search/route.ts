import { NextResponse } from "next/server";
import { getPublishedListings } from "@/lib/listings";
import { getBusinessModelLabel } from "@/lib/config";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") ?? "").trim().toLowerCase();
  const all = await getPublishedListings();

  if (!q) {
    return NextResponse.json({
      results: all.slice(0, 5).map(toResult),
      query: q,
    });
  }

  const terms = q.split(/\s+/).filter(Boolean);
  const scored = all
    .map((l) => {
      const haystack = `${l.title} ${l.tagline} ${l.category} ${getBusinessModelLabel(l.business_model)} ${l.tech_tags.join(" ")}`.toLowerCase();
      let score = 0;
      for (const term of terms) {
        if (l.title.toLowerCase().startsWith(term)) score += 5;
        else if (l.title.toLowerCase().includes(term)) score += 3;
        else if (haystack.includes(term)) score += 1;
        else return null;
      }
      return { listing: l, score };
    })
    .filter((x): x is { listing: typeof all[number]; score: number } => x !== null)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8)
    .map((x) => toResult(x.listing));

  return NextResponse.json({ results: scored, query: q });
}

function toResult(l: Awaited<ReturnType<typeof getPublishedListings>>[number]) {
  return {
    id: l.id,
    slug: l.slug,
    title: l.title,
    tagline: l.tagline,
    price: l.price,
    category: l.category,
    businessModel: getBusinessModelLabel(l.business_model),
    techTags: l.tech_tags.slice(0, 3),
  };
}
