// Run with: npx tsx scripts/seed.ts
// Inserts the 60 programs from src/lib/programs-data.ts into Supabase.
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { SEED_PROGRAMS } from "../src/lib/programs-data";

// load env (Node native dotenv since Node 22 supports --env-file)
const envPath = resolve(__dirname, "..", ".env.local");
const envText = readFileSync(envPath, "utf8");
for (const line of envText.split("\n")) {
  const m = line.match(/^([A-Z_]+)=(.*)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supa = createClient(url, key, { auth: { persistSession: false } });

async function main() {
  console.log(`→ Seeding ${SEED_PROGRAMS.length} programs to ${url}…`);

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
  }));

  const { error: progErr } = await supa.from("programs").upsert(rows, { onConflict: "slug" });
  if (progErr) {
    console.error("✗ programs upsert failed:", progErr);
    process.exit(1);
  }
  console.log(`✓ ${rows.length} programs upserted`);

  // initial status = 'discovered' for any program without status
  const { data: progs } = await supa.from("programs").select("id, slug");
  if (progs && progs.length) {
    const { data: existing } = await supa.from("program_status").select("program_id");
    const seen = new Set(existing?.map((e) => e.program_id) ?? []);
    const todo = progs.filter((p) => !seen.has(p.id));
    if (todo.length) {
      const { error: statusErr } = await supa.from("program_status").insert(
        todo.map((p) => ({ program_id: p.id, status: "discovered" })),
      );
      if (statusErr) console.error("✗ status seed failed:", statusErr);
      else console.log(`✓ ${todo.length} initial statuses set`);
    } else {
      console.log("· statuses already present, skipping");
    }
  }

  console.log("✓ seed complete");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
