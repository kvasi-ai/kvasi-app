// Client helper for server-mediated DB writes. Replaces direct supabase
// client.from(...).insert/update/delete because those are blocked by RLS
// (the app uses HMAC-cookie auth, not Supabase auth).

type Op = "insert" | "update" | "delete";

export async function dbWrite<T = unknown>(opts: {
  table: string;
  op: Op;
  values?: Record<string, unknown>;
  id?: string;
}): Promise<{ ok: true; row?: T } | never> {
  const res = await fetch("/api/secure/db", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(opts),
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? `${res.status} ${res.statusText}`);
  }
  return res.json();
}
