// Idempotent upsert of SEED_PROGRAMS into the live programs table.
// Run after deploy:
//   curl -X POST https://kvasi-app.vercel.app/api/seed -H "x-seed-key: $SEED_KEY"
//
// Behavior:
// - Upserts every row in SEED_PROGRAMS keyed on slug (corrects dates, priority, etc.)
// - Deletes rows whose slug appears in RETIRED_SLUGS
// - Returns counts for visibility
import { NextResponse } from "next/server";
import { admin } from "@/lib/supabase/admin";
import { SEED_PROGRAMS, RETIRED_SLUGS } from "@/lib/programs-data";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: Request) {
  const key = req.headers.get("x-seed-key");
  if (!process.env.SEED_KEY || key !== process.env.SEED_KEY) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const supa = admin();

  const rows = SEED_PROGRAMS.map((p) => ({
    slug: p.slug,
    name: p.name,
    org: p.org,
    tier: p.tier,
    kind: p.kind,
    dilution: p.dilution,
    visa: p.visa,
    loc: p.loc,
    amount: p.amount,
    terms: p.terms,
    note: p.note,
    start_date: p.start_date ?? null,
    end_date: p.end_date ?? null,
    point_date: p.point_date ?? null,
    rolling: p.rolling,
    priority: p.priority ?? false,
  }));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: upsertErr, count: upsertCount } = await (supa
    .from("programs") as any)
    .upsert(rows, { onConflict: "slug", count: "exact" });

  if (upsertErr) {
    return NextResponse.json({ error: upsertErr.message, step: "upsert" }, { status: 500 });
  }

  let deletedCount = 0;
  if (RETIRED_SLUGS.length > 0) {
    const { error: delErr, count } = await supa
      .from("programs")
      .delete({ count: "exact" })
      .in("slug", RETIRED_SLUGS);
    if (delErr) {
      return NextResponse.json({ error: delErr.message, step: "delete-retired" }, { status: 500 });
    }
    deletedCount = count ?? 0;
  }

  return NextResponse.json({
    upserted: upsertCount ?? rows.length,
    retired: deletedCount,
    total_in_seed: rows.length,
  });
}
