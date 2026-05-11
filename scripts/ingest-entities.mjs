#!/usr/bin/env node
// Ingest investors / angels / companies / contacts from disk → entities table.
//
// Usage (run from D:\KVASI\app):
//   node scripts/ingest-entities.mjs
//
// Idempotent: every row keyed on slug; reruns just upsert.
// Builds entity_links between contacts and their companies (by company name match).
//
// Data sources:
//   ../robotics-companies-directory/MASTER_CONTACTS.csv         (830 contacts)
//   ../robotics-companies-directory/EMAILS_VERIFIED.csv         (same rows + email)
//   ../robotics-companies-directory/*.md                        (~111 company files)
//   ../robotics-companies-directory/austin_angels.md            (~40 angels in 3 tables)
//   ../research/program_details/06_vc_top.json                  (15 top VCs)
//   ../research/program_details/07_vc_specialist.json           (11 specialist VCs)
//   ../research/program_details/08_vc_preseed.json              (11 pre-seed VCs)

import { readFileSync, readdirSync, existsSync } from "node:fs";
import { resolve, join, basename } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..", "..");                // D:\KVASI
const APP = resolve(__dirname, "..");                       // D:\KVASI\app

// Next.js convention — load .env.local first, fall back to .env.
dotenv.config({ path: join(APP, ".env.local") });
dotenv.config({ path: join(APP, ".env") });
const DIR_RCD = join(ROOT, "robotics-companies-directory");
const DIR_VC = join(ROOT, "research", "program_details");

// ── slug helper ───────────────────────────────────────────────────────
function slugify(s) {
  return String(s || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

// ── tiny CSV parser (handles quoted fields with commas) ───────────────
function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (ch === '"') inQuotes = false;
      else field += ch;
    } else {
      if (ch === '"') inQuotes = true;
      else if (ch === ",") { row.push(field); field = ""; }
      else if (ch === "\n") { row.push(field); rows.push(row); row = []; field = ""; }
      else if (ch === "\r") { /* skip */ }
      else field += ch;
    }
  }
  if (field.length || row.length) { row.push(field); rows.push(row); }
  if (!rows.length) return [];
  const headers = rows[0];
  return rows.slice(1).filter((r) => r.length && r.some((c) => c.trim())).map((r) => {
    const o = {};
    headers.forEach((h, i) => { o[h.trim()] = (r[i] ?? "").trim(); });
    return o;
  });
}

// ── ingest: investors (VC JSON files) ─────────────────────────────────
function ingestVcs() {
  const out = [];
  for (const file of ["06_vc_top.json", "07_vc_specialist.json", "08_vc_preseed.json"]) {
    const path = join(DIR_VC, file);
    if (!existsSync(path)) { console.warn(`[vcs] missing: ${file}`); continue; }
    const j = JSON.parse(readFileSync(path, "utf8"));
    const list = j.funds ?? j.vcs ?? j.programs ?? j.investors ?? [];
    for (const v of list) {
      const tips = v.approach_tips ?? v.tips ?? [];
      out.push({
        type: "investor",
        slug: v.slug ?? slugify(v.name),
        name: v.name,
        org: v.name,
        properties: {
          official_url: v.official_url ?? v.url ?? null,
          contact_url: v.contact_url ?? v.submission_portal ?? null,
          contact_method: v.contact_method ?? null,
          contact_email: v.contact_email ?? null,
          deadline: v.deadline ?? v.next_deadline ?? null,
          fund_size: v.fund_size ?? null,
          check_size: v.check_size ?? null,
          stage: v.stage ?? null,
          thesis: v.thesis ?? v.focus ?? null,
          accepts_cold_pitches: v.accepts_cold_pitches ?? null,
          approach_tips: tips.length ? tips : null,
          category: j.category,
        },
        note: tips.length ? tips.map((t) => `- ${t}`).join("\n") : (v.notes ?? v.description ?? null),
        source: file,
      });
    }
  }
  return out;
}

// ── ingest: angels (austin_angels.md) ─────────────────────────────────
// Parse | row | Name | Background | LinkedIn | ... | tables.
function ingestAngels() {
  const path = join(DIR_RCD, "austin_angels.md");
  if (!existsSync(path)) { console.warn(`[angels] missing austin_angels.md`); return []; }
  const lines = readFileSync(path, "utf8").split("\n");
  const angels = [];
  let inTable = false;
  let headers = [];
  for (const line of lines) {
    if (line.startsWith("|") && line.includes("---")) { inTable = true; continue; }
    if (line.startsWith("|") && line.toLowerCase().includes("name") && !inTable) {
      headers = line.split("|").map((s) => s.trim().toLowerCase());
      continue;
    }
    if (!line.startsWith("|")) { inTable = false; headers = []; continue; }
    if (!inTable) continue;
    const cells = line.split("|").slice(1, -1).map((s) => s.trim());
    if (!cells.length) continue;
    // skip header separator and num-only rows
    const rawName = cells[1] ?? "";
    const name = rawName.replace(/\*\*/g, "").trim();
    if (!name || name === "Name") continue;
    const linkedinCell = cells[3] ?? "";
    const linkedinMatch = linkedinCell.match(/\((https?:\/\/[^)\s]+)\)/);
    const linkedinUrl = linkedinMatch ? linkedinMatch[1] : null;
    angels.push({
      type: "angel",
      slug: slugify(name),
      name,
      org: null,
      properties: {
        background: cells[2] ?? null,
        linkedin: linkedinUrl,
        check_size: cells[4] ?? cells[5] ?? null,
        sector_focus: cells[5] ?? cells[6] ?? null,
        notable_investments: cells[6] ?? cells[7] ?? null,
        fit_notes: cells[cells.length - 1] ?? null,
        location: "Austin",
      },
      note: cells[2] ?? null,
      source: "austin_angels.md",
    });
  }
  return angels;
}

// ── ingest: companies (one .md file per company in DIR_RCD) ───────────
function ingestCompanies() {
  const skipFiles = new Set([
    "README.md", "austin_angels.md", "austin_vcs.md", "general_robotics.md",
  ]);
  const files = readdirSync(DIR_RCD).filter((f) => f.endsWith(".md") && !skipFiles.has(f));
  const out = [];
  for (const file of files) {
    const path = join(DIR_RCD, file);
    const md = readFileSync(path, "utf8");
    const nameLine = md.split("\n").find((l) => l.startsWith("# "));
    const name = nameLine ? nameLine.replace(/^#\s+/, "").trim() : basename(file, ".md");
    const properties = {};
    const props = [
      ["website", /\*\*Website:\*\*\s*([^\n]+)/i],
      ["linkedin", /\*\*LinkedIn:\*\*\s*([^\n]+)/i],
      ["founded", /\*\*Founded:\*\*\s*([^\n]+)/i],
      ["location", /\*\*Location:\*\*\s*([^\n]+)/i],
      ["employees", /\*\*Employees:\*\*\s*([^\n]+)/i],
      ["twitter", /\*\*Twitter[/\\]?X:\*\*\s*([^\n]+)/i],
    ];
    for (const [key, re] of props) {
      const m = md.match(re);
      if (m) properties[key] = m[1].trim();
    }
    // pull "Total raised:" line as funding shorthand
    const fundingMatch = md.match(/\*\*Total raised:\*\*\s*([^\n]+)/i);
    if (fundingMatch) properties.total_raised = fundingMatch[1].trim();

    // Description: line after "**Description:**" up to next \n\n
    const descMatch = md.match(/\*\*Description:\*\*\s*([^\n]+)/);
    if (descMatch) properties.description = descMatch[1].trim();

    out.push({
      type: "company",
      slug: slugify(name) || basename(file, ".md"),
      name,
      org: name,
      properties,
      note: md, // full markdown body
      source: file,
    });
  }
  return out;
}

// ── ingest: contacts (MASTER_CONTACTS.csv + email join) ───────────────
function ingestContacts() {
  const masterPath = join(DIR_RCD, "MASTER_CONTACTS.csv");
  const verifiedPath = join(DIR_RCD, "EMAILS_VERIFIED.csv");
  if (!existsSync(masterPath)) { console.warn(`[contacts] missing MASTER_CONTACTS.csv`); return []; }
  const master = parseCsv(readFileSync(masterPath, "utf8"));
  const verified = existsSync(verifiedPath) ? parseCsv(readFileSync(verifiedPath, "utf8")) : [];

  const emailByKey = new Map();
  for (const v of verified) {
    const key = `${v.company_name}|${v.person_name}`.toLowerCase();
    if (v.email && v.email.includes("@") && v.verified === "yes") {
      emailByKey.set(key, v.email);
    }
  }

  const seenSlugs = new Set();
  const out = [];
  for (const c of master) {
    const name = c.person_name;
    if (!name) continue;
    let slug = slugify(`${name}-${c.company_name}`);
    // dedupe duplicate slugs by appending a counter
    let dedupe = slug;
    let i = 2;
    while (seenSlugs.has(dedupe)) { dedupe = `${slug}-${i++}`; }
    seenSlugs.add(dedupe);

    const key = `${c.company_name}|${c.person_name}`.toLowerCase();
    out.push({
      type: "contact",
      slug: dedupe,
      name,
      org: c.company_name || null,
      properties: {
        role: c.role || null,
        linkedin: c.linkedin_url || null,
        email: emailByKey.get(key) ?? null,
        company_website: c.company_website || null,
        company_linkedin: c.company_linkedin || null,
      },
      note: null,
      source: "MASTER_CONTACTS.csv",
    });
  }
  return out;
}

// ── upsert ────────────────────────────────────────────────────────────
async function upsertChunked(supa, rows, table = "entities") {
  let total = 0;
  for (let i = 0; i < rows.length; i += 500) {
    const chunk = rows.slice(i, i + 500);
    const { error, count } = await supa
      .from(table)
      .upsert(chunk, { onConflict: "slug", count: "exact" });
    if (error) {
      console.error(`[upsert ${table}] chunk ${i}-${i + chunk.length}:`, error.message);
      process.exit(1);
    }
    total += count ?? chunk.length;
    console.log(`  upserted ${i + chunk.length}/${rows.length}`);
  }
  return total;
}

// ── link contacts → companies ─────────────────────────────────────────
async function linkContactsToCompanies(supa) {
  console.log("[links] resolving contact → company links by org name…");
  const { data: companies, error: e1 } = await supa
    .from("entities").select("id, slug, name").eq("type", "company");
  if (e1) { console.error(e1.message); return; }
  const { data: contacts, error: e2 } = await supa
    .from("entities").select("id, slug, name, org").eq("type", "contact");
  if (e2) { console.error(e2.message); return; }

  // index companies by lowercased name
  const cmpByName = new Map();
  for (const c of companies) {
    cmpByName.set(c.name.toLowerCase(), c.id);
  }

  const links = [];
  let matched = 0;
  for (const contact of contacts) {
    if (!contact.org) continue;
    const cmpId = cmpByName.get(contact.org.toLowerCase());
    if (!cmpId) continue;
    matched++;
    links.push({ from_id: contact.id, to_id: cmpId, context: "works at" });
  }
  console.log(`[links] matched ${matched}/${contacts.length} contacts to companies`);
  if (!links.length) return;
  for (let i = 0; i < links.length; i += 1000) {
    const chunk = links.slice(i, i + 1000);
    const { error } = await supa
      .from("entity_links")
      .upsert(chunk, { onConflict: "from_id,to_id,context", ignoreDuplicates: true });
    if (error) console.error(`[links] chunk ${i}: ${error.message}`);
  }
  console.log(`[links] done — ${links.length} contact→company edges`);
}

// ── main ──────────────────────────────────────────────────────────────
async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error("Set NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY in .env.local");
    process.exit(1);
  }
  const supa = createClient(url, key, { auth: { persistSession: false } });

  console.log("─── INGEST ENTITIES ───");
  const investors = ingestVcs();
  console.log(`investors: ${investors.length}`);
  const angels = ingestAngels();
  console.log(`angels:    ${angels.length}`);
  const companies = ingestCompanies();
  console.log(`companies: ${companies.length}`);
  const contacts = ingestContacts();
  console.log(`contacts:  ${contacts.length}`);

  // Dedupe by slug across all types; if slug collides keep first.
  const seen = new Set();
  const all = [];
  for (const r of [...investors, ...angels, ...companies, ...contacts]) {
    if (!r.slug) continue;
    if (seen.has(r.slug)) { console.warn(`  dup slug skipped: ${r.slug}`); continue; }
    seen.add(r.slug);
    all.push(r);
  }
  console.log(`total unique: ${all.length}`);

  console.log("\n─── UPSERT ───");
  await upsertChunked(supa, all);

  console.log("\n─── LINKS ───");
  await linkContactsToCompanies(supa);

  console.log("\n✓ done");
}

main().catch((e) => { console.error(e); process.exit(1); });
