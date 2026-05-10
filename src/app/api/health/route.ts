// Public health probe — returns commit SHA + boolean flags for required envs.
// Never returns env values. Lets you confirm which build is live and whether
// the env wiring is plausible without exposing secrets.
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function decodeRole(jwt: string | undefined): string | null {
  if (!jwt) return null;
  const parts = jwt.split(".");
  if (parts.length !== 3) return null;
  try {
    const b64 = parts[1].replace(/-/g, "+").replace(/_/g, "/").padEnd(parts[1].length + ((4 - (parts[1].length % 4)) % 4), "=");
    const payload = JSON.parse(Buffer.from(b64, "base64").toString("utf8")) as { role?: string };
    return payload.role ?? null;
  } catch {
    return null;
  }
}

export async function GET() {
  const serviceRole = decodeRole(process.env.SUPABASE_SERVICE_ROLE_KEY);
  const anonRole = decodeRole(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  return NextResponse.json({
    ok: true,
    commit: process.env.VERCEL_GIT_COMMIT_SHA ?? "unknown",
    branch: process.env.VERCEL_GIT_COMMIT_REF ?? "unknown",
    deployedAt: process.env.VERCEL_DEPLOYMENT_ID ?? "unknown",
    env: {
      NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      APP_AUTH_SECRET: !!process.env.APP_AUTH_SECRET,
      SEED_KEY: !!process.env.SEED_KEY,
    },
    keys: {
      anonKeyRole: anonRole,
      serviceKeyRole: serviceRole,
      serviceKeyLooksValid: serviceRole === "service_role",
    },
  });
}
