-- FailureLog premium badge program migration.
-- Run after docs/schema.sql, docs/admin-schema.sql, and docs/completion-v3.sql.
--
-- Frontend reference: components/premium/premium-badge-banner.tsx,
-- components/ui/premium-badge.tsx, app/api/premium-badge/route.ts,
-- app/api/admin/action/route.ts (entityType "premium_request"),
-- app/admin/admin-shell.tsx ("premium" tab).

alter table profiles add column if not exists is_premium boolean not null default false;
alter table profiles add column if not exists premium_since timestamptz;

create table if not exists premium_badge_requests (
  id text primary key default ('pbr_' || substr(md5(random()::text), 1, 10)),
  requester_id uuid not null references profiles(id) on delete cascade,
  requester_role text not null check (requester_role in ('buyer', 'seller')),
  amount numeric not null default 10,
  status text not null default 'pending_review', -- pending_payment | pending_review | approved | rejected
  note text,
  rejection_reason text,
  stripe_payment_intent_id text,
  created_at timestamptz default now(),
  decided_at timestamptz
);

create index if not exists premium_badge_requests_status_idx on premium_badge_requests(status);
create index if not exists premium_badge_requests_requester_idx on premium_badge_requests(requester_id);

alter table premium_badge_requests enable row level security;

-- Requesters can see and create their own requests.
create policy if not exists premium_badge_requests_select_own
  on premium_badge_requests for select
  using (auth.uid() = requester_id);

create policy if not exists premium_badge_requests_insert_own
  on premium_badge_requests for insert
  with check (auth.uid() = requester_id);

-- Admin reads/writes go through the service-role client in
-- app/api/admin/action/route.ts, which bypasses RLS — no admin policy
-- needed here, matching the pattern used for listings/disputes.
