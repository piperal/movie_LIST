# Reel Log

A movie watchlist powered by Supabase.
Add films, track what you are watching, rate and annotate movies, search and filter your
list, and export it as JSON.

## Run it

Requires Node.js 20.9 or newer and a Supabase project with a `public.movie_list` table.

1. In the Supabase SQL Editor, run [`supabase/migrations/20261010130000_add_movie_tracker_fields.sql`](./supabase/migrations/20261010130000_add_movie_tracker_fields.sql) and [`supabase/migrations/20261010131000_allow_anonymous_movie_list_access.sql`](./supabase/migrations/20261010131000_allow_anonymous_movie_list_access.sql). The existing table should have `id`, `movie_name`, `release_year`, and `movie_status` columns.
2. Create `movie_list/.env.local` from [`.env.example`](./.env.example) and set `SUPABASE_URL` and `SUPABASE_ANON_KEY` from your Supabase project.
3. Install dependencies and start the app:

```bash
cd movie_list
npm install
npm run dev -- --webpack
```

Open [http://localhost:3000](http://localhost:3000).

## Demo ideas

- Add a movie and set its status.
- Filter to **Watching** or **Watched**, then search or change the sort order.
- Change a movie's status, rate it with the stars, or add notes.
- Export the list with **Export JSON**.

## Data and production

The Next.js API reads and writes the Supabase `public.movie_list` table. The anonymous
access policy is intended only for a private/local demo: anyone who can reach the app or
its API can read, add, edit, and delete entries in the shared list. Do not deploy it
publicly with this policy. Keep `.env.local` private and never expose a service-role key.
