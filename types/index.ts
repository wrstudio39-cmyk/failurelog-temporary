export type ListingStatus = "draft" | "pending_review" | "published" | "rejected" | "sold";

export type BusinessModel = "saas" | "mobile_app" | "domain" | "browser_extension" | "api_service" | "content_site" | "other";

export interface Profile {
  id: string;
  name: string;
  role: "buyer" | "seller" | "admin";
  avatar_url?: string | null;
  bio?: string | null;
  github_username?: string | null;
  stripe_connect_account_id?: string | null;
  stripe_connect_onboarding_complete?: boolean;
  is_premium?: boolean;
  premium_since?: string | null;
  created_at: string;
}

/* ---------- Premium badge program ----------
   Buyers and sellers can request a paid "Premium" badge ($10 flat).
   The request is queued for admin approval before the badge appears
   anywhere in the product (profile, listings, dashboard). */
export type PremiumBadgeStatus = "none" | "pending_payment" | "pending_review" | "approved" | "rejected";

export interface PremiumBadgeRequest {
  id: string;
  requester_id: string;
  requester_role: "buyer" | "seller";
  requester_name?: string;
  amount: number; // in whole currency units, e.g. 10
  status: PremiumBadgeStatus;
  note?: string | null;
  rejection_reason?: string | null;
  created_at: string;
  decided_at?: string | null;
}

export interface TechTag {
  slug: string;
  name: string;
}

export interface ProjectMetrics {
  monthly_traffic?: number | null;
  total_users?: number | null;
  lifetime_revenue?: number | null;
  mrr_at_shutdown?: number | null;
  months_active?: number | null;
}

export interface PostMortem {
  why_abandoned: string;        // markdown
  what_went_wrong: string;      // markdown
  distribution_notes?: string;  // markdown
  target_market_notes?: string; // markdown
  technical_notes?: string;     // markdown
  lessons_learned: string;      // markdown
}

export interface ProjectAsset {
  id?: number;
  label: string;
  included: boolean;
  asset_type?: string | null;
  storage_path?: string | null;
  file_size?: number | null;
  released_at?: string | null;
}

export interface ProjectMedia {
  url: string;
  alt: string;
  is_cover: boolean;
}

export interface Listing {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  business_model: BusinessModel;
  category: string;
  price: number;
  tech_tags: string[];
  metrics: ProjectMetrics;
  post_mortem: PostMortem;
  assets: ProjectAsset[];
  media: ProjectMedia[];
  seller_id: string;
  seller?: Profile;
  status: ListingStatus;
  rejection_reason?: string | null;
  created_at: string;
  published_at?: string | null;
  github_repo_url?: string | null;
  verification?: ProjectVerification | null;
}

export interface Purchase {
  id: string;
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  amount: number;
  stripe_payment_intent_id?: string | null;
  status: "pending" | "completed" | "refunded";
  created_at: string;
}

export type VerificationStatus = "unverified" | "pending" | "verified" | "failed";

export interface ProjectVerification {
  listing_id: string;
  github_status: VerificationStatus;
  github_repo_url?: string | null;
  github_verified_at?: string | null;
  stripe_status: VerificationStatus;
  stripe_verified_at?: string | null;
  verified_revenue?: number | null;
  verification_notes?: string | null;
}

export interface Conversation {
  id: string;
  listing_id?: string | null;
  buyer_id: string;
  seller_id: string;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  created_at: string;
  read_at?: string | null;
}

export interface SellerPayout {
  id: string;
  purchase_id: string;
  seller_id: string;
  stripe_account_id?: string | null;
  amount: number;
  platform_fee: number;
  currency: string;
  status: "pending" | "processing" | "paid" | "failed";
  stripe_transfer_id?: string | null;
  created_at: string;
}

export interface NewsletterSubscription {
  id: string;
  email: string;
  status: "subscribed" | "unsubscribed";
  source?: string | null;
  created_at: string;
  updated_at: string;
}
