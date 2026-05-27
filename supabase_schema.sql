-- TrucoPro AR - Supabase/PostgreSQL schema base
-- Ejecutar en Supabase SQL Editor.
-- Esto prepara usuarios, mesas, partidas, torneos, ranking y reportes.

create extension if not exists "uuid-ossp";

create table if not exists public.profiles (
  id uuid primary key default uuid_generate_v4(),
  auth_user_id uuid unique,
  username text unique not null,
  avatar_url text,
  is_vip boolean default false,
  is_verified boolean default false,
  rating integer default 1000,
  wins integer default 0,
  losses integer default 0,
  created_at timestamptz default now()
);

create table if not exists public.tables (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  mode text not null check (mode in ('1v1','2v2')),
  points_to integer default 15,
  is_vip boolean default false,
  status text default 'open' check (status in ('open','playing','finished','cancelled')),
  created_by uuid references public.profiles(id),
  created_at timestamptz default now()
);

create table if not exists public.table_players (
  id uuid primary key default uuid_generate_v4(),
  table_id uuid references public.tables(id) on delete cascade,
  profile_id uuid references public.profiles(id),
  seat integer not null,
  team text default 'A',
  joined_at timestamptz default now(),
  unique(table_id, profile_id)
);

create table if not exists public.matches (
  id uuid primary key default uuid_generate_v4(),
  table_id uuid references public.tables(id),
  status text default 'playing' check (status in ('playing','finished','abandoned')),
  points_to integer default 15,
  score_a integer default 0,
  score_b integer default 0,
  winner_team text,
  started_at timestamptz default now(),
  ended_at timestamptz
);

create table if not exists public.match_events (
  id bigserial primary key,
  match_id uuid references public.matches(id) on delete cascade,
  profile_id uuid references public.profiles(id),
  event_type text not null,
  payload jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create table if not exists public.tournaments (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  entry_fee numeric default 0,
  prize_text text,
  max_players integer default 64,
  status text default 'scheduled' check (status in ('scheduled','open','running','finished','cancelled')),
  starts_at timestamptz,
  created_at timestamptz default now()
);

create table if not exists public.tournament_players (
  id uuid primary key default uuid_generate_v4(),
  tournament_id uuid references public.tournaments(id) on delete cascade,
  profile_id uuid references public.profiles(id),
  seed integer,
  created_at timestamptz default now(),
  unique(tournament_id, profile_id)
);

create table if not exists public.reports (
  id uuid primary key default uuid_generate_v4(),
  reporter_id uuid references public.profiles(id),
  reported_id uuid references public.profiles(id),
  match_id uuid references public.matches(id),
  reason text not null,
  status text default 'open' check (status in ('open','reviewing','resolved','dismissed')),
  created_at timestamptz default now()
);

create or replace view public.ranking as
select
  id,
  username,
  avatar_url,
  is_vip,
  is_verified,
  rating,
  wins,
  losses,
  case when wins + losses = 0 then 0 else round((wins::numeric / (wins + losses)) * 100, 2) end as win_rate
from public.profiles
order by rating desc, wins desc;
