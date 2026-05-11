// Public health probe — returns commit SHA + boolean flags for required envs
// + the SHAPE of each key (not the value). Lets you confirm which build is live
// and whether the env wiring is plausible without exposing secrets.
import { NextResponse } from "next/server";
import { keyShape } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  return NextResponse.json({
    ok: true,
    commit: process.env.VERCEL_GIT_COMMIT_SHA ?? "unknown",
    branch: process.env.VERCEL_GIT_COMMIT_REF ?? "unknown",
    deployedAt: process.env.VERCEL_DEPLOYMENT_ID ?? "unknown",
    env: {
      NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: !!anonKey,
      SUPABASE_SERVICE_ROLE_KEY: !!serviceKey,
      APP_AUTH_SECRET: !!process.env.APP_AUTH_SECRET,
      SEED_KEY: !!process.env.SEED_KEY,
    },
    keys: {
      anonShape: keyShape(anonKey),
      serviceShape: keyShape(serviceKey),
      // Length helps spot truncation / accidental quoting.
      anonLength: anonKey?.length ?? 0,
      serviceLength: serviceKey?.length ?? 0,
    },
  });
}
