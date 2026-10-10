"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { api } from "@/lib/api-client";
import styles from "./MovieTracker.module.css";

const LABELS = { want: "Want to watch", watching: "Watching", watched: "Watched" };
const SHORT = { want: "Next", watching: "Now", watched: "Seen" };
const TABS = [["all", "All"], ["watching", "Watching"], ["watched", "Watched"], ["want", "Want to watch"]];

const initials = (t) => t.trim().split(/\s+/).slice(0, 2).map((w) => w[0] || "").join("").toUpperCase();

export default function MovieTracker() {
  const [movies, setMovies] = useState([]);
  const [phase, setPhase] = useState("loading"); // loading | ready | error
  const [loadError, setLoadError] = useState("");
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("added");
  const [openNotes, setOpenNotes] = useState({});
  const [form, setForm] = useState({ title: "", year: "", status: "want" });
  const [toast, setToast] = useState("");
  const toastTimer = useRef(null);
  const noteTimers = useRef({});
  const titleInput = useRef(null);

  const load = useCallback(async () => {
    try {
      setMovies(await api.list());
      setPhase("ready");
    } catch (e) {
      setLoadError(e.message);
      setPhase("error");
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  function showError(e) {
    setToast(e.message || "Something went wrong");
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 4000);
  }

  async function addMovie(e) {
    e.preventDefault();
    const title = form.title.trim();
    if (!title) return;
    try {
      const movie = await api.create({ title, year: parseInt(form.year, 10) || null, status: form.status });
      setMovies((ms) => [...ms, movie]);
      setForm((f) => ({ ...f, title: "", year: "" }));
      titleInput.current?.focus();
    } catch (err) { showError(err); }
  }

  // Optimistic update; if the server rejects it, show why and re-sync from the server.
  function patch(id, fields, debounce = false) {
    setMovies((ms) => ms.map((m) => (m.id === id ? { ...m, ...fields } : m)));
    const send = async () => {
      try { await api.update(id, fields); } catch (err) { showError(err); load(); }
    };
    if (debounce) {
      clearTimeout(noteTimers.current[id]);
      noteTimers.current[id] = setTimeout(send, 500);
    } else send();
  }

  async function remove(movie) {
    if (!confirm(`Delete "${movie.title}"?`)) return;
    try {
      await api.remove(movie.id);
      setMovies((ms) => ms.filter((m) => m.id !== movie.id));
    } catch (err) { showError(err); }
  }

  function exportJson() {
    const blob = new Blob([JSON.stringify(movies, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "reel-log.json";
    a.click();
    URL.revokeObjectURL(a.href);
  }

  const counts = useMemo(() => {
    const c = { all: movies.length, want: 0, watching: 0, watched: 0 };
    let sum = 0, rated = 0;
    for (const m of movies) { c[m.status]++; if (m.rating) { sum += m.rating; rated++; } }
    return { ...c, avg: rated ? (sum / rated).toFixed(1) : "–" };
  }, [movies]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return movies
      .filter((m) => (filter === "all" || m.status === filter) && (!q || m.title.toLowerCase().includes(q)))
      .sort((a, b) => {
        if (sort === "title") return a.title.localeCompare(b.title);
        if (sort === "rating") return (b.rating || 0) - (a.rating || 0);
        if (sort === "year") return (b.year || 0) - (a.year || 0);
        return Date.parse(b.createdAt) - Date.parse(a.createdAt);
      });
  }, [movies, filter, query, sort]);

  return (
    <main className={styles.wrap}>
      <h1 className={styles.heading}>Reel Log</h1>
      <p className={styles.sub}>Keep track of what you&apos;ve watched, what you&apos;re watching, and what&apos;s next.</p>

      <section className={styles.stats} aria-label="Summary">
        {[[counts.watched, "Watched"], [counts.watching, "Watching"], [counts.want, "Want to watch"], [counts.avg, "Avg. rating"]].map(([v, l]) => (
          <div className={styles.stat} key={l}>
            <b className={styles.statValue}>{v}</b>
            <span className={styles.statLabel}>{l}</span>
          </div>
        ))}
      </section>

      <form className={styles.add} onSubmit={addMovie}>
        <input ref={titleInput} className={`${styles.field} ${styles.titleInput}`} placeholder="Movie title" aria-label="Movie title"
          required maxLength={120} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <input className={styles.field} type="number" placeholder="Year" aria-label="Release year" min={1888} max={2100}
          value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} />
        <select className={styles.field} aria-label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
          {Object.entries(LABELS).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
        </select>
        <button className={`${styles.btn} ${styles.addBtn}`} type="submit">Add movie</button>
      </form>

      <div className={styles.tools}>
        <div className={styles.tabs} role="group" aria-label="Filter by status">
          {TABS.map(([key, label]) => (
            <button key={key} className={`${styles.tab} ${filter === key ? styles.tabActive : ""}`}
              aria-pressed={filter === key} onClick={() => setFilter(key)}>
              {label} {counts[key]}
            </button>
          ))}
        </div>
        <div className={styles.right}>
          <input className={`${styles.field} ${styles.compact}`} type="search" placeholder="Search" aria-label="Search movies"
            value={query} onChange={(e) => setQuery(e.target.value)} />
          <select className={`${styles.field} ${styles.compact}`} aria-label="Sort" value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="added">Newest added</option>
            <option value="title">Title A–Z</option>
            <option value="rating">Top rated</option>
            <option value="year">Release year</option>
          </select>
        </div>
      </div>

      <ul className={styles.list}>
        {phase === "loading" && <li className={styles.empty}>Loading…</li>}
        {phase === "error" && (
          <li className={styles.empty}>
            <b className={styles.emptyTitle}>Couldn&apos;t load your movies</b>
            {loadError} <button className={styles.link} onClick={load}>Try again</button>
          </li>
        )}
        {phase === "ready" && visible.length === 0 && (
          <li className={styles.empty}>
            <b className={styles.emptyTitle}>{movies.length ? "No movies match" : "Your log is empty"}</b>
            {movies.length ? "Try another filter or search term." : "Add your first movie above to start tracking."}
          </li>
        )}
        {phase === "ready" && visible.map((m) => (
          <li className={styles.movie} key={m.id}>
            <div className={`${styles.stub} ${styles["stub_" + m.status]}`}>
              <span className={styles.initials}>{initials(m.title)}</span>
              <small className={styles.stubLabel}>{SHORT[m.status]}</small>
            </div>
            <div className={styles.body}>
              <div className={styles.top}>
                <h2 className={styles.title}>{m.title}{m.year ? <> <span className={styles.year}>{m.year}</span></> : null}</h2>
                <button className={`${styles.link} ${styles.danger}`} onClick={() => remove(m)} aria-label={`Delete ${m.title}`}>Delete</button>
              </div>
              <div className={styles.row}>
                <select className={`${styles.field} ${styles.statusSelect}`} aria-label={`Status for ${m.title}`}
                  value={m.status} onChange={(e) => patch(m.id, { status: e.target.value })}>
                  {Object.entries(LABELS).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
                </select>
                <div className={styles.stars} role="group" aria-label="Rating">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button key={n} className={`${styles.star} ${m.rating >= n ? styles.starOn : ""}`}
                      aria-label={`Rate ${n} of 5`} aria-pressed={m.rating >= n}
                      onClick={() => patch(m.id, { rating: m.rating === n ? 0 : n })}>★</button>
                  ))}
                </div>
                <button className={styles.link} onClick={() => setOpenNotes((o) => ({ ...o, [m.id]: !o[m.id] }))}>
                  {m.notes ? "Edit notes" : "Add notes"}
                </button>
              </div>
              {openNotes[m.id] ? (
                <textarea className={`${styles.field} ${styles.notes}`} autoFocus aria-label="Notes" maxLength={5000}
                  placeholder="Thoughts, where you stopped, who to watch it with…"
                  value={m.notes} onChange={(e) => patch(m.id, { notes: e.target.value }, true)} />
              ) : m.notes ? <p className={styles.notesText}>{m.notes}</p> : null}
            </div>
          </li>
        ))}
      </ul>

      <div className={styles.foot}>
        <span>Synced with the server.</span>
        <button className={styles.link} onClick={exportJson}>Export JSON</button>
      </div>
      {toast && <div className={styles.toast} role="status">{toast}</div>}
    </main>
  );
}
