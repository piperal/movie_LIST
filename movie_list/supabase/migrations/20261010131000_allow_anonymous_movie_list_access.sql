drop policy if exists "movie_list_anon_access" on public.movie_list;

create policy "movie_list_anon_access"
  on public.movie_list
  for all
  to anon
  using (true)
  with check (true);
