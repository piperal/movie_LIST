alter table public.movie_list
  add column if not exists rating integer not null default 0,
  add column if not exists notes text not null default '',
  add column if not exists created_at timestamptz not null default now();
