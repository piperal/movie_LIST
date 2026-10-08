// Browser-side wrapper around the REST API. Components never call fetch directly.
async function request(method, path, body) {
  const res = await fetch("/api" + path, {
    method,
    cache: "no-store",
    headers: { Accept: "application/json", ...(body ? { "Content-Type": "application/json" } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (res.status === 204) return null;
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error || `Request failed (${res.status})`);
  return data;
}

export const api = {
  list: () => request("GET", "/movies"),
  create: (data) => request("POST", "/movies", data),
  update: (id, patch) => request("PATCH", `/movies/${encodeURIComponent(id)}`, patch),
  remove: (id) => request("DELETE", `/movies/${encodeURIComponent(id)}`),
};
