-- FailureLog Admin Control Plane
-- Run after schema.sql. The service role must remain server-only.

create table if not exists moderation_cases (
  id text primary key default ('mod_' || substr(md5(random()::text), 1, 10)),
  listing_id text not null references listings(id) on delete cascade,
  reason text not null,
  risk_level text not null default 'medium',
  status text not null default 'open', -- open | approved | rejected | escalated
  reviewer_id uuid references profiles(id),
  notes text,
  created_at timestamptz default now(),
  resolved_at timestamptz
);

create table if not exists disputes (
  id text primary key default ('dsp_' || substr(md5(random()::text), 1, 10)),
  purchase_id text references purchases(id) on delete set null,
  listing_id text references listings(id) on delete set null,
  buyer_id uuid references profiles(id),
  seller_id uuid references profiles(id),
  reason text not null,
  status text not null default 'open', -- open | evidence_review | awaiting_buyer | awaiting_seller | resolved | refunded
  amount numeric default 0,
  evidence jsonb default '{}'::jsonb,
  resolution text,
  assigned_to uuid references profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  resolved_at timestamptz
);

create table if not exists admin_audit_log (
  id bigint generated always as identity primary key,
  admin_id uuid not null references profiles(id),
  action text not null,
  entity_type text not null,
  entity_id text,
  before_state jsonb,
  after_state jsonb,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create table if not exists idea_signals (
  id bigint generated always as identity primary key,
  source text not null, -- dispute | search | seller | buyer | moderation | analytics | admin
  signal text not null,
  evidence jsonb default '{}'::jsonb,
  score numeric default 0,
  status text not null default 'captured', -- captured | triaged | experiment | shipped | dismissed
  owner_id uuid references profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists moderation_cases_status_idx on moderation_cases(status, created_at desc);
create index if not exists disputes_status_idx on disputes(status, created_at desc);
create index if not exists admin_audit_log_created_idx on admin_audit_log(created_at desc);
create index if not exists idea_signals_score_idx on idea_signals(score desc, created_at desc);

alter table moderation_cases enable row level security;
alter table disputes enable row level security;
alter table admin_audit_log enable row level security;
alter table idea_signals enable row level security;

-- Admin-only access. The app verifies the admin role before using the service-role
-- connection for aggregate control-plane reads/writes. These policies are a second
-- line of defense for any future direct Supabase access.
create policy "Admins manage moderation cases" on moderation_cases for all
using (exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'))
with check (exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'));

create policy "Admins manage disputes" on disputes for all
using (exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'))
with check (exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'));

create policy "Admins read audit log" on admin_audit_log for select
using (exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'));

create policy "Admins create audit log" on admin_audit_log for insert
with check (exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'));

create policy "Admins manage idea signals" on idea_signals for all
using (exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'))
with check (exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'));
