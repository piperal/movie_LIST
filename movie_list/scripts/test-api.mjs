const BASE = "http://localhost:3000/api";
let passed = 0;
let failed = 0;

async function call(method, path, body) {
  const res = await fetch(BASE + path, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text.slice(0, 200); // server returned HTML (compile or runtime error)
  }
  return { status: res.status, data };
}

function check(name, ok) {
  ok ? passed++ : failed++;
  console.log(ok ? "PASS" : "FAIL", "-", name);
}

let r;

r = await call("GET", "/stats");
check("stats -> 200", r.status === 200);
const before = r.data;

// validation
r = await call("POST", "/movies", { movie_name: "", movie_status: "watched" });
check("empty movie_name -> 400", r.status === 400);
r = await call("POST", "/movies", { movie_name: "X", movie_status: "abc" });
check("bad movie_status -> 400", r.status === 400);

// create
r = await call("POST", "/movies", { movie_name: "TEST Inception", movie_status: "want_to_watch" });
check("create -> 201", r.status === 201 && r.data.movie_status === "want_to_watch");
const id = r.data?.id;
r = await call("POST", "/movies", { movie_name: "TEST Dune", movie_status: "watching" });
const id2 = r.data?.id;

// update
r = await call("PATCH", `/movies/${id}`, { movie_status: "bad" });
check("PATCH bad status -> 400", r.status === 400);
r = await call("PATCH", `/movies/${id}`, { movie_status: "watched" });
check("PATCH to watched -> 200", r.status === 200 && r.data.movie_status === "watched");
r = await call("PATCH", "/movies/abc", { movie_status: "watched" });
check("PATCH invalid id -> 404", r.status === 404);

// stats (relative to "before", because the data is shared)
r = await call("GET", "/stats");
check(
  "stats: +1 watched, +1 watching",
  r.status === 200 &&
    r.data.counts.watched === before.counts.watched + 1 &&
    r.data.counts.watching === before.counts.watching + 1 &&
    r.data.total === before.total + 2
);

// filter
r = await call("GET", "/movies?status=watched");
check("filter watched contains the test movie", r.status === 200 && r.data.some((m) => m.id === id));
r = await call("GET", "/movies?status=abc");


// delete
r = await call("DELETE", `/movies/${id}`);
check("DELETE -> 204", r.status === 204);
r = await call("DELETE", `/movies/${id}`);
check("DELETE again -> 404", r.status === 404);
await call("DELETE", `/movies/${id2}`);
r = await call("GET", "/movies");
check("deleted movies gone from list", r.data.every((m) => m.id !== id && m.id !== id2));

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);