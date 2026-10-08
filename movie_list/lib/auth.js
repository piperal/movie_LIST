// TODO: replace with real auth once the Supabase part is ready.
export function getUserId(request) {
  return request.headers.get("x-user-id");
}