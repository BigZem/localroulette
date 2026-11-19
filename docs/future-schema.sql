-- Future PostgreSQL/Supabase design only. No database is deployed in the MVP.
create table activities (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  provider_id text not null,
  title text not null,
  description text,
  category text not null,
  latitude double precision not null,
  longitude double precision not null,
  town text,
  address text,
  starts_at timestamptz,
  ends_at timestamptz,
  opening_hours text,
  last_admission_at time,
  price_pence integer,
  official_url text,
  source_url text,
  last_verified_at timestamptz,
  updated_at timestamptz not null default now(),
  unique (provider, provider_id)
);
create index activities_location_idx on activities (latitude, longitude);
create index activities_start_idx on activities (starts_at);

create table user_favourites (
  user_id uuid not null,
  activity_id uuid not null references activities(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, activity_id)
);
create table daily_entitlements (
  user_id uuid not null,
  uk_day date not null,
  spins_used integer not null default 0 check (spins_used >= 0),
  plan text not null default 'free',
  primary key (user_id, uk_day)
);
create table partner_offers (
  id uuid primary key default gen_random_uuid(),
  activity_id uuid not null references activities(id) on delete cascade,
  affiliate_url text not null,
  disclosure text not null,
  starts_at timestamptz,
  ends_at timestamptz,
  approved_at timestamptz,
  check (length(disclosure) > 0)
);
-- Partner offers are displayed separately and never alter wheel selection.
