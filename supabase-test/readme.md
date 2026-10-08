# Supabase Movie List

A small Node.js project that talks to a Supabase (Postgres) database and includes unit and integration tests using Node's built-in test runner.

## Requirements

- [Node.js](https://nodejs.org) v20.6 or newer (needed for `--env-file`)
- A free [Supabase](https://supabase.com) account

## Project structure

```
.
├── .env                         # your Supabase credentials (not committed)
├── index.js                     # quick script to read from the database
├── movies.js                    # database functions (getMovies, addMovie)
├── movies.test.js               # unit tests (fake client, no network)
├── movies.integration.test.js   # integration tests (real database)
└── package.json
```

## 1. Supabase setup

### Create the project

1. Sign in at supabase.com and click **New project**.
2. Choose a name, a strong database password (save it, it can't be viewed again), and the region closest to you.
3. Wait a minute or two for the project to provision.

### Create the table

Open **SQL Editor → New query**, paste the following, and click **Run**:

```sql
create table movie_list (
  id bigint generated always as identity primary key,
  title text not null,
  created_at timestamptz default now()
);
```

> Adjust the columns to match your real table. Use lowercase names with underscores rather than spaces.

### Enable Row Level Security (RLS)

Supabase exposes your tables through an API, so RLS must be on and policies must define who can do what:

```sql
alter table movie_list enable row level security;

create policy "Allow public read"
  on movie_list for select
  using (true);

-- Needed by the integration tests:
create policy "Allow public insert"
  on movie_list for insert
  with check (true);

create policy "Allow public delete"
  on movie_list for delete
  using (true);
```

> These policies let anyone with your anon key read, insert, and delete. That is fine for learning and testing. For a real app, restrict policies to authenticated users (for example `auth.uid() = user_id`).

### Get your credentials

Go to **Project Settings → API** and copy:

- **Project URL**, e.g. `https://abcdefghijklmnop.supabase.co`
- **anon (public) key**

Never use the `service_role` key in client code or commit it to git.

## 2. Local setup

```bash
npm install
```

If starting from scratch:

```bash
npm init -y
npm install @supabase/supabase-js
```

Add this to `package.json` to enable `import` syntax:

```json
"type": "module"
```

Create a `.env` file in the project root:

```
SUPABASE_URL=https://abcdefghijklmnop.supabase.co
SUPABASE_ANON_KEY=your-real-anon-key
```

Add `.env` to `.gitignore` so your keys are never committed:

```
.env
node_modules/
```

## 3. Running the app

```bash
node --env-file=.env index.js
```

Expected output when the table is empty:

```
{ data: [], error: null }
```

An empty array means everything is working; the table just has no rows yet. Add a row via **Table Editor → movie_list → Insert row** and run it again.

## 4. Tests

The project uses Node's built-in test runner (`node:test`), so no extra test framework is needed.

### Unit tests

`movies.test.js` uses a fake Supabase client, so it runs instantly, needs no network, and doesn't touch your database.

```bash
node --test movies.test.js
```

### Integration tests

`movies.integration.test.js` runs against your real Supabase project. It inserts a test row, reads it back, and deletes it afterwards. It requires the insert and delete policies above.

```bash
node --env-file=.env --test movies.integration.test.js
```

> For a real project, use a separate Supabase project for testing, not your production data.

### Run everything

```bash
node --env-file=.env --test "*.test.js"
```

Or add a script to `package.json`:

```json
"scripts": {
  "test": "node --env-file=.env --test \"*.test.js\""
}
```

Then run:

```bash
npm test
```

> Pass explicit test files or a glob. Running `node --test` with no arguments can pick up non-test files such as `index.js` in some Node versions and report them as failures.

## Troubleshooting

| Problem | Likely cause and fix |
| --- | --- |
| `relation "public.movie_list" does not exist` or `Could not find the table ... in the schema cache` | The table hasn't been created, or the name in your code doesn't match the database exactly. |
| `data: []` but rows exist in the dashboard | RLS is enabled but there is no `select` policy. Add the read policy. |
| `Invalid API key` | Re-copy the anon key from **Project Settings → API** and check `.env` for stray spaces or quotes. |
| `new row violates row-level security policy` | Missing insert policy for the table. |
| `Cannot use import statement outside a module` | Add `"type": "module"` to `package.json`. |
| `node: --env-file= is not allowed` or option not recognized | Upgrade Node to v20.6 or newer (`node --version`). |
| Tests fail at `index.js` 1:1 | The runner is executing `index.js`. Pass test files explicitly (see above) and make sure `"type": "module"` is set. |
| Integration test leaves rows behind | A delete policy is missing, so cleanup couldn't run. Add it, then remove the stray rows in the Table Editor. |
