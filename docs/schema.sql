-- ============================================================
-- FailureLog — Supabase schema
-- Run in Supabase: Project → SQL Editor → New query
-- Ported from the WALEED template's schema; reshaped around the
-- Creator → Project → Post-Mortem → Admin Review → Listing → Buyer model.
-- ============================================================

-- Extra profile info (Supabase Auth already stores email/password in auth.users)
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  role text not null default 'buyer', -- 'buyer' | 'seller' | 'admin'
  avatar_url text,
  bio text,
  github_username text,
  created_at timestamptz default now()
);

create table listings (
  id text primary key default ('lst_' || substr(md5(random()::text), 1, 10)),
  slug text unique not null,
  title text not null,
  tagline text,
  business_model text not null,        -- saas | mobile_app | domain | browser_extension | api_service | content_site | other
  category text not null,              -- must match slugs in lib/config.ts CATEGORIES
  price numeric not null default 0,
  tech_tags text[] default '{}',
  seller_id uuid references profiles(id) on delete cascade,
  status text not null default 'draft', -- draft | pending_review | published | rejected | sold
  rejection_reason text,
  created_at timestamptz default now(),
  published_at timestamptz
);

-- One-to-one structured post-mortem per listing
create table post_mortems (
  listing_id text primary key references listings(id) on delete cascade,
  why_abandoned text not null,
  what_went_wrong text not null,
  distribution_notes text,
  target_market_notes text,
  technical_notes text,
  lessons_learned text not null
);

-- One-to-one seller-reported metrics per listing
create table project_metrics (
  listing_id text primary key references listings(id) on delete cascade,
  monthly_traffic bigint,
  total_users bigint,
  lifetime_revenue numeric,
  mrr_at_shutdown numeric,
  months_active integer
);

create table project_media (
  id bigint generated always as identity primary key,
  listing_id text references listings(id) on delete cascade,
  url text not null,
  alt text,
  is_cover boolean default false,
  sort_order integer default 0
);

create table project_assets (
  id bigint generated always as identity primary key,
  listing_id text references listings(id) on delete cascade,
  label text not null,       -- e.g. "Full source code", "Domain transfer", "Figma files"
  included boolean default true
);

create table purchases (
  id text primary key default ('pur_' || substr(md5(random()::text), 1, 10)),
  listing_id text references listings(id),
  buyer_id uuid references profiles(id),
  seller_id uuid references profiles(id),
  amount numeric not null,
  stripe_payment_intent_id text,
  status text default 'pending', -- pending | completed | refunded
  created_at timestamptz default now()
);

-- ============================================================
-- Storage buckets (create in Supabase: Storage → New bucket)
--   listing-assets   (private — code ZIPs, docs, the actual deliverable)
--   listing-media    (public  — screenshots/previews)
--   avatars          (public  — profile pictures)
-- ============================================================

-- ============================================================
-- Row Level Security
-- ============================================================
alter table profiles enable row level security;
alter table listings enable row level security;
alter table post_mortems enable row level security;
alter table project_metrics enable row level security;
alter table project_media enable row level security;
alter table project_assets enable row level security;
alter table purchases enable row level security;

create policy "Public read profiles" on profiles for select using (true);
create policy "Users manage own profile" on profiles for update using (auth.uid() = id);

-- Listings: public can only see published ones; sellers see + manage their own; admins see all.
create policy "Public read published listings" on listings for select
  using (status = 'published' or auth.uid() = seller_id);
create policy "Sellers manage own listings" on listings for all
  using (auth.uid() = seller_id);

create policy "Read post-mortems of visible listings" on post_mortems for select
  using (exists (select 1 from listings l where l.id = listing_id and (l.status = 'published' or l.seller_id = auth.uid())));
create policy "Sellers manage own post-mortems" on post_mortems for all
  using (exists (select 1 from listings l where l.id = listing_id and l.seller_id = auth.uid()));

create policy "Read metrics of visible listings" on project_metrics for select
  using (exists (select 1 from listings l where l.id = listing_id and (l.status = 'published' or l.seller_id = auth.uid())));
create policy "Sellers manage own metrics" on project_metrics for all
  using (exists (select 1 from listings l where l.id = listing_id and l.seller_id = auth.uid()));

create policy "Read media of visible listings" on project_media for select
  using (exists (select 1 from listings l where l.id = listing_id and (l.status = 'published' or l.seller_id = auth.uid())));
create policy "Sellers manage own media" on project_media for all
  using (exists (select 1 from listings l where l.id = listing_id and l.seller_id = auth.uid()));

create policy "Read assets of visible listings" on project_assets for select
  using (exists (select 1 from listings l where l.id = listing_id and (l.status = 'published' or l.seller_id = auth.uid())));
create policy "Sellers manage own assets" on project_assets for all
  using (exists (select 1 from listings l where l.id = listing_id and l.seller_id = auth.uid()));

create policy "Users see own purchases" on purchases for select
  using (auth.uid() = buyer_id or auth.uid() = seller_id);
create policy "Buyers create purchases" on purchases for insert
  with check (auth.uid() = buyer_id);

-- Admin override: a profile with role = 'admin' can see/manage everything.
-- (Requires a SECURITY DEFINER helper in production; add via a follow-up migration
--  once the admin role-check function is in place — do not skip RLS by using
--  the service_role key from client code.)

-- ============================================================
-- Phase 2 extension — integration-ready schema
-- These tables are additive and can remain dormant until the
-- corresponding feature flag is enabled.
-- ============================================================

alter table profiles add column if not exists stripe_connect_account_id text;
alter table profiles add column if not exists stripe_connect_onboarding_complete boolean default false;
alter table listings add column if not exists github_repo_url text;

create table if not exists project_verifications (
  listing_id text primary key references listings(id) on delete cascade,
  github_status text not null default 'unverified',
  github_repo_url text,
  github_verified_at timestamptz,
  stripe_status text not null default 'unverified',
  stripe_verified_at timestamptz,
  verified_revenue numeric,
  verification_notes text,
  updated_at timestamptz default now()
);

create table if not exists seller_payouts (
  id text primary key default ('pyo_' || substr(md5(random()::text), 1, 10)),
  purchase_id text unique references purchases(id) on delete cascade,
  seller_id uuid references profiles(id) on delete cascade,
  stripe_account_id text,
  amount numeric not null,
  platform_fee numeric not null default 0,
  currency text not null default 'usd',
  status text not null default 'pending',
  stripe_transfer_id text,
  created_at timestamptz default now()
);

create table if not exists conversations (
  id text primary key default ('cnv_' || substr(md5(random()::text), 1, 10)),
  listing_id text references listings(id) on delete set null,
  buyer_id uuid references profiles(id) on delete cascade,
  seller_id uuid references profiles(id) on delete cascade,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(listing_id, buyer_id, seller_id)
);

create table if not exists messages (
  id bigint generated always as identity primary key,
  conversation_id text references conversations(id) on delete cascade,
  sender_id uuid references profiles(id) on delete cascade,
  body text not null,
  created_at timestamptz default now(),
  read_at timestamptz
);

create table if not exists newsletter_subscriptions (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  status text not null default 'subscribed',
  source text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table project_verifications enable row level security;
alter table seller_payouts enable row level security;
alter table conversations enable row level security;
alter table messages enable row level security;
alter table newsletter_subscriptions enable row level security;

create policy "Users read verification for visible listings" on project_verifications for select
  using (exists (select 1 from listings l where l.id = listing_id and (l.status = 'published' or l.seller_id = auth.uid())));
create policy "Sellers manage own verification" on project_verifications for all
  using (exists (select 1 from listings l where l.id = listing_id and l.seller_id = auth.uid()));

create policy "Sellers read own payouts" on seller_payouts for select
  using (auth.uid() = seller_id);

create policy "Conversation participants read" on conversations for select
  using (auth.uid() = buyer_id or auth.uid() = seller_id);
create policy "Conversation participants create" on conversations for insert
  with check (auth.uid() = buyer_id or auth.uid() = seller_id);
create policy "Conversation participants update" on conversations for update
  using (auth.uid() = buyer_id or auth.uid() = seller_id);

create policy "Conversation participants read messages" on messages for select
  using (exists (select 1 from conversations c where c.id = conversation_id and (c.buyer_id = auth.uid() or c.seller_id = auth.uid())));
create policy "Conversation participants send messages" on messages for insert
  with check (auth.uid() = sender_id and exists (select 1 from conversations c where c.id = conversation_id and (c.buyer_id = auth.uid() or c.seller_id = auth.uid())));
create policy "Recipients can mark messages read" on messages for update
  using (exists (select 1 from conversations c where c.id = conversation_id and (c.buyer_id = auth.uid() or c.seller_id = auth.uid())));

-- Newsletter subscriptions are written through a server-side route/provider integration.
-- No public direct read policy is created.
