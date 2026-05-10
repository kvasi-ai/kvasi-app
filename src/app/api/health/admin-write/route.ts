// End-to-end admin-write probe. Inserts a no-op program_status row using a
// real program id, then deletes it. Proves the admin client can actually
// bypass RLS in the deployed environment. Gated by the SEED_KEY shared secret.
//
// Use:
//   curl -X POST https://kvasi-app.vercel.app/api/health/admin-write \
//     -H "x-seed-key: $SEED_KEY"
//
// Returns 200 + diagnostics on success, 500 + the exact Postgres error on failure.
import { NextResponse } from "next/server";
import { admin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: Request) {
  const key = req.headers.get("x-seed-key");
  if (!process.env.SEED_KEY || key !== process.env.SEED_KEY) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let supa;
  try {
    supa = admin();
  } catch (e) {
    return NextResponse.json(
      { ok: false, step: "admin-init", error: (e as Error).message },
      { status: 500 },
    );
  }

  // Find any program to attach a probe row to.
  const { data: probeProgram, error: probeErr } = await supa
    .from("programs")
    .select("id")
    .limit(1)
    .single();

  if (probeErr || !probeProgram) {
    return NextResponse.json(
      { ok: false, step: "select-program", error: probeErr?.message ?? "no programs in DB" },
      { status: 500 },
    );
  }

  const probeRow = probeProgram as { id: string };
  // Insert a discovered-status probe row.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const t = supa.from("program_status") as any;
  const { data: inserted, error: insErr } = await t
    .insert([{ program_id: probeRow.id, status: "discovered", note: "[probe — admin-write]" }])
    .select("id")
    .single();

  if (insErr || !inserted) {
    return NextResponse.json(
      { ok: false, step: "insert-probe", error: insErr?.message ?? "insert returned no row" },
      { status: 500 },
    );
  }

  const insertedRow = inserted as { id: string };
  // Clean up: delete the probe row we just inserted.
  const { error: delErr } = await t.delete().eq("id", insertedRow.id);

  return NextResponse.json({
    ok: true,
    program_id: probeRow.id,
    probe_status_id: insertedRow.id,
    cleanup_error: delErr?.message ?? null,
  });
}
