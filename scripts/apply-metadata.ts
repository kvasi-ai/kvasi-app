// Reads all program_details/*.json files and updates programs.metadata
// AND sets YC status to "applied" (since user has already applied).
// Run: npx tsx scripts/apply-metadata.ts
import { createClient } from "@supabase/supabase-js";
import { readFileSync, readdirSync } from "node:fs";
import { resolve, join } from "node:path";

const envPath = resolve(__dirname, "..", ".env.local");
for (const line of readFileSync(envPath, "utf8").split("\n")) {
  const m = line.match(/^([A-Z_]+)=(.*)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
}

const supa = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: { persistSession: false },
});

type Tip = string;
type Source = { title: string; url: string };
type ProgramDetail = {
  slug: string;
  application_url?: string;
  official_application_url?: string;
  submission_portal?: string;
  url?: string;
  pitch_url?: string;
  deadline?: string;
  deadline_text?: string;
  next_deadline?: string;
  tips?: Tip[];
  sources?: Source[] | string[];
  notes?: string;
};

function pickUrl(p: ProgramDetail): string | null {
  return (
    p.application_url ??
    p.official_application_url ??
    p.submission_portal ??
    p.pitch_url ??
    p.url ??
    null
  );
}

function pickDeadline(p: ProgramDetail): string | null {
  return p.deadline_text ?? p.next_deadline ?? p.deadline ?? null;
}

function normalizeSources(s: unknown): Source[] {
  if (!Array.isArray(s)) return [];
  return s
    .map((x): Source | null => {
      if (typeof x === "string") return { title: new URL(x).hostname, url: x };
      if (x && typeof x === "object" && "url" in x) {
        const obj = x as { title?: string; url: string };
        return { title: obj.title ?? new URL(obj.url).hostname, url: obj.url };
      }
      return null;
    })
    .filter((x): x is Source => x !== null);
}

const dir = resolve(__dirname, "..", "..", "research", "program_details");
const files = readdirSync(dir).filter((f) => f.endsWith(".json"));

const all: ProgramDetail[] = [];
for (const f of files) {
  const text = readFileSync(join(dir, f), "utf8");
  const parsed = JSON.parse(text) as unknown;
  // shape A: { programs: [...] }, shape B: [...] directly, shape C: { category, programs: [...] }
  let arr: ProgramDetail[] = [];
  if (Array.isArray(parsed)) arr = parsed as ProgramDetail[];
  else if (parsed && typeof parsed === "object") {
    const obj = parsed as Record<string, unknown>;
    if (Array.isArray(obj.programs)) arr = obj.programs as ProgramDetail[];
    else if (Array.isArray(obj.funds)) arr = obj.funds as ProgramDetail[];
    else if (Array.isArray(obj.entries)) arr = obj.entries as ProgramDetail[];
    else if (Array.isArray(obj.items)) arr = obj.items as ProgramDetail[];
    else { console.warn(`! ${f}: unknown shape, skipping`); continue; }
  } else { console.warn(`! ${f}: unknown shape, skipping`); continue; }
  console.log(`· ${f}: ${arr.length} entries`);
  all.push(...arr);
}

async function main() {
console.log(`\n→ Applying metadata to ${all.length} programs…\n`);

let ok = 0;
let miss = 0;
for (const p of all) {
  if (!p.slug) {
    console.warn(`! entry missing slug:`, p);
    miss++;
    continue;
  }
  const url = pickUrl(p);
  const deadline = pickDeadline(p);
  const tips = Array.isArray(p.tips) ? p.tips : [];
  const sources = normalizeSources(p.sources);

  const metadata = {
    application_url: url,
    deadline_text: deadline,
    tips,
    sources,
  };

  const { error } = await supa
    .from("programs")
    .update({ metadata })
    .eq("slug", p.slug);

  if (error) {
    console.error(`✗ ${p.slug}:`, error.message);
    miss++;
  } else {
    ok++;
  }
}

console.log(`\n✓ Updated: ${ok}  ·  ✗ Missed: ${miss}\n`);

// ── set YC status to "applied" ─────────────────────────────────────
console.log("→ Setting YC F26 status to 'applied'…");
const { data: yc } = await supa.from("programs").select("id").eq("slug", "yc-f26").single();
if (yc?.id) {
  const { error } = await supa.from("program_status").insert({
    program_id: yc.id,
    status: "applied",
  });
  if (error) console.error("✗ YC status:", error.message);
  else console.log("✓ YC status → applied");
}
console.log("✓ done");
}

main().catch((e) => { console.error(e); process.exit(1); });
