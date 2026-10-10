# Reel Log

A movie watchlist you can run locally without an account, API key, or external database.
Add films, track what you are watching, rate and annotate movies, search and filter your
list, and export it as JSON.

## Run it

Requires Node.js 20.9 or newer.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The first visit creates a small
editable sample watchlist so the app is ready to demo immediately.

## Demo ideas

- Add a movie and set its status.
- Filter to **Watching** or **Watched**, then search or change the sort order.
- Change a movie's status, rate it with the stars, or add notes.
- Export the list with **Export JSON**.

## Data and production

The API is served by the Next.js app. Movie data is stored in `data/movies.json` and
survives restarts on a local machine. The first launch seeds sample entries only when
that file does not exist; after that, the list is yours to edit. Remove the file to
restore the demo list. Set `DATA_FILE` to choose a different data file.

This file-based store is for local demos and a single long-running server; it is not
suitable for serverless hosting. Use a persistent database before deploying there.
