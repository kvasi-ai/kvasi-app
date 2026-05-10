// Server-only Supabase client using the SECRET service-role key (bypasses RLS).
// Use sparingly — only for server components / API routes that need full access.
//
// Hardening: we decode the JWT and reject anything that isn't a service_role key
// at startup. The most common deploy bug is pasting the anon key into
// SUPABASE_SERVICE_ROLE_KEY by mistake — silent failure mode is that RLS still
// applies on every "admin" insert. We turn that into a clear, loud 500 instead.
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

let cached: ReturnType<typeof createClient<Database>> | null = null;

function decodeJwtRole(jwt: string): string | null {
  const parts = jwt.split(".");
  if (parts.length !== 3) return null;
  try {
    // base64url → base64 → utf8 → json
    const b64 = parts[1].replace(/-/g, "+").replace(/_/g, "/").padEnd(parts[1].length + ((4 - (parts[1].length % 4)) % 4), "=");
    const json = Buffer.from(b64, "base64").toString("utf8");
    const payload = JSON.parse(json) as { role?: string };
    return payload.role ?? null;
  } catch {
    return null;
  }
}

export function admin() {
  if (cached) return cached;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL is not set");
  }
  if (!key) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set — admin client cannot bypass RLS");
  }

  const role = decodeJwtRole(key);
  if (role !== "service_role") {
    throw new Error(
      `SUPABASE_SERVICE_ROLE_KEY is not a service-role JWT (decoded role: ${role ?? "unparseable"}). ` +
        `If you pasted the anon key by mistake, all "admin" writes will hit RLS and fail. ` +
        `Get the service_role key from Supabase Dashboard → Project Settings → API.`,
    );
  }

  cached = createClient<Database>(url, key, { auth: { persistSession: false } });
  return cached;
}
