import type { Listing, PremiumBadgeRequest } from "@/types";

export const DEMO_LISTINGS: Listing[] = [
  {
    id: "lst_001",
    slug: "pingpad",
    title: "PingPad",
    tagline: "A Slack-first standup bot that nobody wanted to talk to.",
    business_model: "saas",
    category: "productivity",
    price: 1200,
    tech_tags: ["Next.js", "TypeScript", "Supabase", "Stripe"],
    seller_id: "usr_amara",
    seller: { id: "usr_amara", name: "Amara Chen", role: "seller", is_premium: true, created_at: "" },
    status: "published",
    created_at: "2026-06-02T00:00:00Z",
    published_at: "2026-06-10T00:00:00Z",
    metrics: {
      monthly_traffic: 4200,
      total_users: 380,
      lifetime_revenue: 1140,
      mrr_at_shutdown: 40,
      months_active: 11,
    },
    post_mortem: {
      why_abandoned:
        "Standups moved to async docs faster than the market for bots could form. Growth flatlined at 40 MRR for four months.",
      what_went_wrong:
        "Built the integration before validating that teams wanted a bot inside Slack rather than a doc. Distribution relied entirely on the Slack App Directory, which buried us under bigger incumbents.",
      distribution_notes: "No content or outbound motion — 100% App Directory dependent.",
      target_market_notes: "Targeted 5-20 person teams who, in practice, already had a habit that worked.",
      technical_notes: "Solid Next.js/Supabase base, webhook handling for Slack events is clean and reusable.",
      lessons_learned:
        "Talk to 20 teams before writing the OAuth flow. A working bot is not a distribution channel.",
    },
    assets: [
      { label: "Full Next.js + Supabase source", included: true },
      { label: "Slack app manifest & OAuth setup", included: true },
      { label: "Stripe billing integration", included: true },
      { label: "Domain transfer", included: false },
    ],
    media: [],
  },
  {
    id: "lst_002",
    slug: "receiptly",
    title: "Receiptly",
    tagline: "OCR receipt scanning for freelancers. Great tech, zero retention.",
    business_model: "mobile_app",
    category: "finance",
    price: 2600,
    tech_tags: ["React Native", "Python", "PostgreSQL"],
    seller_id: "usr_devon",
    seller: { id: "usr_devon", name: "Devon Okafor", role: "seller", created_at: "" },
    status: "published",
    created_at: "2026-05-14T00:00:00Z",
    published_at: "2026-05-20T00:00:00Z",
    metrics: {
      monthly_traffic: 900,
      total_users: 1150,
      lifetime_revenue: 3800,
      mrr_at_shutdown: 0,
      months_active: 14,
    },
    post_mortem: {
      why_abandoned: "90% of users churned inside 30 days once the free OCR quota ran out.",
      what_went_wrong:
        "Priced on volume before understanding that freelancers file receipts in bursts, not steadily — the pricing model fought the usage pattern.",
      target_market_notes: "Freelancers, but tax season concentrated all demand into 6 weeks a year.",
      technical_notes: "Custom OCR pipeline is genuinely fast and accurate — the hard part is done.",
      lessons_learned: "Match the pricing model to the actual usage rhythm, not the average.",
    },
    assets: [
      { label: "React Native app (iOS + Android)", included: true },
      { label: "OCR pipeline (Python)", included: true },
      { label: "1,150 anonymized usage records", included: true },
    ],
    media: [],
  },
  {
    id: "lst_003",
    slug: "loopcast",
    title: "Loopcast",
    tagline: "Podcast-to-newsletter automation. Killed by API cost spirals.",
    business_model: "api_service",
    category: "ai-ml",
    price: 900,
    tech_tags: ["Node.js", "Python", "AWS"],
    seller_id: "usr_priya",
    seller: { id: "usr_priya", name: "Priya Nair", role: "seller", created_at: "" },
    status: "published",
    created_at: "2026-07-01T00:00:00Z",
    published_at: "2026-07-05T00:00:00Z",
    metrics: {
      monthly_traffic: 1500,
      total_users: 210,
      lifetime_revenue: 640,
      mrr_at_shutdown: 15,
      months_active: 6,
    },
    post_mortem: {
      why_abandoned: "Transcription + summarization API costs scaled faster than willingness to pay.",
      what_went_wrong:
        "Unit economics never worked at the $9/mo price point once episodes ran over 60 minutes.",
      technical_notes: "Pipeline architecture (queue-based, AWS Lambda) is reusable for other audio-processing products.",
      lessons_learned: "Model unit economics against the p90 use case, not the average one, before setting a price.",
    },
    assets: [
      { label: "Full pipeline source (AWS Lambda)", included: true },
      { label: "210 user waitlist (opted-in, anonymized)", included: true },
    ],
    media: [],
  },
];

export function getDemoListingBySlug(slug: string) {
  return DEMO_LISTINGS.find((l) => l.slug === slug) ?? null;
}

/* ---------- Premium badge requests (demo/preview data) ---------- */
export const DEMO_PREMIUM_REQUESTS: PremiumBadgeRequest[] = [
  {
    id: "pbr_1042",
    requester_id: "usr_devon",
    requester_role: "seller",
    requester_name: "Devon Okafor",
    amount: 10,
    status: "pending_review",
    note: "12 completed sales, wants the badge on his seller profile.",
    created_at: "2026-08-18T09:20:00Z",
  },
  {
    id: "pbr_1041",
    requester_id: "usr_rahim",
    requester_role: "buyer",
    requester_name: "Rahim Ahmed",
    amount: 10,
    status: "pending_review",
    note: "Frequent acquirer — wants faster seller trust on offers.",
    created_at: "2026-08-18T07:05:00Z",
  },
  {
    id: "pbr_1038",
    requester_id: "usr_amara",
    requester_role: "seller",
    requester_name: "Amara Chen",
    amount: 10,
    status: "approved",
    created_at: "2026-08-11T12:00:00Z",
    decided_at: "2026-08-12T10:00:00Z",
  },
];
