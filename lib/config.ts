import type { BusinessModel } from "@/types";

export const SITE = {
  name: "FailureLog",
  tagline: "A marketplace for the projects that didn't make it — and the reasons why.",
  currency: "USD",
  currencySymbol: "$",
  platformFeePercent: 10,
};

/* Premium badge program — flat one-time fee, buyer or seller, admin-approved. */
export const PREMIUM_BADGE = {
  price: 10,
  label: "Premium",
  pitch: "A verified mark of a serious buyer or seller — reviewed and approved by the archive desk.",
};

export const BUSINESS_MODELS: { value: BusinessModel; label: string }[] = [
  { value: "saas", label: "SaaS" },
  { value: "mobile_app", label: "Mobile App" },
  { value: "domain", label: "Domain" },
  { value: "browser_extension", label: "Browser Extension" },
  { value: "api_service", label: "API / Service" },
  { value: "content_site", label: "Content Site" },
  { value: "other", label: "Other" },
];

export const CATEGORIES = [
  { slug: "productivity", name: "Productivity" },
  { slug: "developer-tools", name: "Developer Tools" },
  { slug: "ecommerce", name: "E-commerce" },
  { slug: "ai-ml", name: "AI / ML" },
  { slug: "marketing", name: "Marketing & Growth" },
  { slug: "finance", name: "Finance" },
  { slug: "social", name: "Social & Community" },
  { slug: "education", name: "Education" },
  { slug: "health", name: "Health & Fitness" },
  { slug: "other", name: "Other" },
];

/* Master tech-tag list — used in filters and the submission wizard */
export const TECH_TAGS: string[] = [
  "React", "Next.js", "Vue", "Svelte", "TypeScript", "JavaScript",
  "Node.js", "Python", "Django", "Flask", "Ruby on Rails", "Go", "Rust",
  "PostgreSQL", "MySQL", "MongoDB", "Supabase", "Firebase",
  "React Native", "Flutter", "Swift", "Kotlin",
  "Stripe", "AWS", "Vercel", "Docker",
];

export function getCategoryBySlug(slug: string) {
  return CATEGORIES.find((c) => c.slug === slug) ?? null;
}

export function getBusinessModelLabel(value: BusinessModel) {
  return BUSINESS_MODELS.find((b) => b.value === value)?.label ?? value;
}

export function formatPrice(amount: number) {
  return SITE.currencySymbol + amount.toLocaleString("en-US");
}

export function formatCompactNumber(n?: number | null) {
  if (n === null || n === undefined) return "—";
  return new Intl.NumberFormat("en-US", { notation: "compact" }).format(n);
}

/* Feature flags — Phase-2 / deferred features kept in code but hidden from nav & routes.
   Flip to true to re-enable without rebuilding the feature. */
export const FEATURES = {
  cart: false,
  wishlist: false,
  messaging: false,
  reviews: false,
  // Master switch for the entire checkout/escrow/Stripe path (app/api/checkout,
  // app/api/webhooks/stripe, app/api/purchases/confirm|dispute, and the
  // payment-capture branch inside app/api/admin/action). The client has said
  // explicitly not to touch payments yet — leave this false until a payment
  // provider is confirmed and real Stripe keys are in place. The code stays
  // in the repo, gated, so switching this on later doesn't require a rewrite.
  payments: false,
  stripeConnectPayouts: false,
  automatedVerification: false,
  newsletterAutomation: false,
};

export const PHASE2 = {
  stripeConnect: {
    enabled: FEATURES.stripeConnectPayouts,
    platformFeePercent: SITE.platformFeePercent,
  },
  verification: {
    enabled: FEATURES.automatedVerification,
  },
  messaging: {
    enabled: FEATURES.messaging,
  },
  newsletter: {
    enabled: FEATURES.newsletterAutomation,
  },
} as const;
