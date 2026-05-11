// Server-only Supabase client using the SECRET service-role key (bypasses RLS).
// Use sparingly — only for server components / API routes that need full access.
//
// Validation strategy:
// - Supabase has two key formats: legacy JWTs (eyJ...) and new "API Keys 2.0"
//   (sb_secret_* / sb_publishable_*). We accept both.
// - For JWTs we decode the role claim and warn if it isn't service_role.
//   We *don't* throw, because key rotation should never crash the app.
// - For sb_secret_* we accept as-is and rely on the actual admin-write probe
//   (/api/health/admin-write) to validate end-to-end.
// - We DO throw if the env var is missing or empty — that's always wrong.
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

let cached: ReturnType<typeof createClient<Database>> | null = null;

export function decodeJwtRole(jwt: string): string | null {
  const parts = jwt.split(".");
  if (parts.length !== 3) return null;
  try {
    const b64 = parts[1].replace(/-/g, "+").replace(/_/g, "/").padEnd(parts[1].length + ((4 - (parts[1].length % 4)) % 4), "=");
    const json = Buffer.from(b64, "base64").toString("utf8");
    const payload = JSON.parse(json) as { role?: string };
    return payload.role ?? null;
  } catch {
    return null;
  }
}

export function keyShape(key: string | undefined): string {
  if (!key) return "missing";
  if (key.startsWith("sb_secret_")) return "sb_secret_ (new format)";
  if (key.startsWith("sb_publishable_")) return "sb_publishable_ (new format — WRONG for service role)";
  if (key.startsWith("eyJ")) {
    const role = decodeJwtRole(key);
    return `JWT (role=${role ?? "unparseable"})`;
  }
  return `unknown (starts with "${key.slice(0, 6)}…")`;
}

export function admin() {
  if (cached) return cached;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!url) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL is not set");
  }
  if (!key) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set — admin client cannot bypass RLS");
  }

  // Soft check: warn (don't throw) on obviously-wrong key shape.
  if (key.startsWith("sb_publishable_") || (key.startsWith("eyJ") && decodeJwtRole(key) === "anon")) {
    // eslint-disable-next-line no-console
    console.error(
      `[admin] SUPABASE_SERVICE_ROLE_KEY looks like an anon/publishable key (shape=${keyShape(key)}). ` +
        `RLS will block every write. Get the service_role / sb_secret_* key from Supabase Dashboard → Project Settings → API.`,
    );
  }

  cached = createClient<Database>(url, key, { auth: { persistSession: false } });
  return cached;
}
