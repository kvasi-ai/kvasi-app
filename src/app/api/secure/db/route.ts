// Server-mediated writes for tables protected by RLS.
// The app uses HMAC-cookie auth (not Supabase auth), so client writes can't
// satisfy RLS policies that depend on auth.uid(). This route verifies the
// session cookie and uses the service-role client to perform whitelisted
// inserts/updates/deletes on the user's behalf.
//
// Auth: matcher /api/secure/:path* in proxy.ts already gates this route.
// As an extra belt-and-braces check, we re-verify the cookie here too.
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { admin } from "@/lib/supabase/admin";
import { SESSION_COOKIE, verifySessionToken, getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Op = "insert" | "update" | "delete";

// Per-table allowlist: which ops are allowed and which columns can be written.
// Anything not listed is rejected.
const ALLOW: Record<string, { ops: Op[]; cols: string[]; idCol?: string }> = {
  program_status: { ops: ["insert"], cols: ["program_id", "status", "note"] },
  todos: {
    ops: ["insert", "update", "delete"],
    cols: ["program_id", "title", "due_date", "done"],
    idCol: "id",
  },
  comments: {
    ops: ["insert", "delete"],
    cols: ["program_id", "body"],
    idCol: "id",
  },
  programs: {
    ops: ["update", "delete"],
    // Only fields users edit inline — never tier/priority/slug from client.
    cols: ["note", "terms"],
    idCol: "id",
  },
};

function pickCols(payload: Record<string, unknown>, cols: string[]) {
  const out: Record<string, unknown> = {};
  for (const k of cols) if (k in payload) out[k] = payload[k];
  return out;
}

export async function POST(req: Request) {
  const jar = await cookies();
  const ok = await verifySessionToken(
    jar.get(SESSION_COOKIE)?.value,
    process.env.APP_AUTH_SECRET ?? "",
  );
  if (!ok) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  let body: { table?: string; op?: Op; values?: Record<string, unknown>; id?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }

  const { table, op, values, id } = body;
  if (!table || !op || !ALLOW[table]) {
    return NextResponse.json({ error: "table not allowed" }, { status: 400 });
  }
  const rules = ALLOW[table];
  if (!rules.ops.includes(op)) {
    return NextResponse.json({ error: `op ${op} not allowed on ${table}` }, { status: 400 });
  }

  const supa = admin();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const t = supa.from(table) as any;

  if (op === "insert") {
    if (!values) return NextResponse.json({ error: "values required" }, { status: 400 });
    const row = pickCols(values, rules.cols);
    const { data, error } = await t.insert([row]).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, row: data });
  }

  if (op === "update") {
    if (!id || !values) return NextResponse.json({ error: "id + values required" }, { status: 400 });
    const patch = pickCols(values, rules.cols);
    const { error } = await t.update(patch).eq(rules.idCol ?? "id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  if (op === "delete") {
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
    const { error } = await t.delete().eq(rules.idCol ?? "id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "unreachable" }, { status: 500 });
}
