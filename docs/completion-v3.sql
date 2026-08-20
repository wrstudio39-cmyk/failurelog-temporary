-- FailureLog completion migration: secure assets, offers, escrow lifecycle, rich post-mortems.
-- Run after docs/schema.sql and docs/admin-schema.sql.

alter table post_mortems add column if not exists failure_stage text;
alter table post_mortems add column if not exists failure_reasons text[] default '{}';
alter table post_mortems add column if not exists acquisition_channels text[] default '{}';
alter table post_mortems add column if not exists attempted_interventions text;
alter table project_assets add column if not exists storage_path text;
alter table project_assets add column if not exists asset_type text default 'other';
alter table project_assets add column if not exists file_size bigint;
alter table project_assets add column if not exists checksum text;
alter table project_assets add column if not exists uploaded_at timestamptz;
alter table project_assets add column if not exists released_at timestamptz;
alter table project_assets add column if not exists sort_order integer default 0;

create table if not exists offers (
  id text primary key default ('off_' || substr(md5(random()::text), 1, 10)),
  listing_id text not null references listings(id) on delete cascade,
  buyer_id uuid not null references profiles(id) on delete cascade,
  seller_id uuid not null references profiles(id) on delete cascade,
  conversation_id text references conversations(id) on delete set null,
  amount numeric not null check (amount >= 0),
  message text,
  status text not null default 'sent', -- sent | countered | accepted | declined | expired | withdrawn
  expires_at timestamptz,
  counter_amount numeric,
  counter_message text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table purchases add column if not exists lifecycle_status text not null default 'payment_pending';
alter table purchases add column if not exists held_at timestamptz;
alter table purchases add column if not exists delivered_at timestamptz;
alter table purchases add column if not exists buyer_confirmed_at timestamptz;
alter table purchases add column if not exists released_at timestamptz;
alter table purchases add column if not exists disputed_at timestamptz;
alter table purchases add column if not exists escrow_provider text default 'stripe';
alter table purchases add column if not exists hold_reference text;

create table if not exists asset_delivery_events (
  id bigint generated always as identity primary key,
  purchase_id text not null references purchases(id) on delete cascade,
  actor_id uuid not null references profiles(id),
  event text not null, -- seller_delivered | buyer_confirmed | buyer_disputed | admin_released | admin_refunded
  note text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create table if not exists offer_events (
  id bigint generated always as identity primary key,
  offer_id text not null references offers(id) on delete cascade,
  actor_id uuid not null references profiles(id),
  event text not null,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

alter table offers enable row level security;
alter table asset_delivery_events enable row level security;
alter table offer_events enable row level security;

create policy "Offer participants read" on offers for select using (auth.uid() = buyer_id or auth.uid() = seller_id);
create policy "Buyers create offers" on offers for insert with check (auth.uid() = buyer_id);
create policy "Offer participants update" on offers for update using (auth.uid() = buyer_id or auth.uid() = seller_id);
create policy "Purchase participants read delivery events" on asset_delivery_events for select using (exists (select 1 from purchases p where p.id = purchase_id and (p.buyer_id = auth.uid() or p.seller_id = auth.uid())));
create policy "Purchase participants create delivery events" on asset_delivery_events for insert with check (auth.uid() = actor_id and exists (select 1 from purchases p where p.id = purchase_id and (p.buyer_id = auth.uid() or p.seller_id = auth.uid())));
create policy "Offer participants read events" on offer_events for select using (exists (select 1 from offers o where o.id = offer_id and (o.buyer_id = auth.uid() or o.seller_id = auth.uid())));

create index if not exists offers_seller_status_idx on offers(seller_id,status,updated_at desc);
create index if not exists offers_buyer_status_idx on offers(buyer_id,status,updated_at desc);
create index if not exists purchases_lifecycle_idx on purchases(lifecycle_status,created_at desc);

-- Private asset bucket. Create it in Storage if it does not already exist:
-- insert into storage.buckets (id,name,public) values ('listing-assets', 'listing-assets', false) on conflict (id) do nothing;
-- Never expose listing-assets through public URLs. The app issues short-lived signed URLs after release.

-- Replace the old public asset-read policy. Asset metadata and storage paths are sensitive.
drop policy if exists "Read assets of visible listings" on project_assets;
create policy "Sellers read own private asset metadata" on project_assets for select
  using (exists (select 1 from listings l where l.id = listing_id and l.seller_id = auth.uid()));

-- Checkout uses Stripe manual capture. The authorization is held while the seller
-- delivers and the buyer verifies. Capture occurs only on buyer confirmation or
-- an admin resolution in favor of the seller; cancellation/refund occurs on a
-- dispute/refund path.
