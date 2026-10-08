# Reel Log API

Route handlers live in `app/api/movies/`. JSON in, JSON out. Errors are always `{ "error": "message" }`.

| method | path               | body                                              | success              |
|--------|--------------------|---------------------------------------------------|----------------------|
| GET    | `/api/movies`      | none                                              | `200` array of Movie |
| POST   | `/api/movies`      | `{ title, year?, status? }`                       | `201` created Movie  |
| PATCH  | `/api/movies/:id`  | any subset of `title, year, status, rating, notes`| `200` updated Movie  |
| DELETE | `/api/movies/:id`  | none                                              | `204`                |

Errors: `400` invalid JSON, `404` unknown id, `422` validation, `500` server error.

Movie: `{ id: string, title: string (1-120), year: integer 1888-2100 | null,
status: "want" | "watching" | "watched", rating: integer 0-5, notes: string (max 5000), createdAt: ISO-8601 }`
