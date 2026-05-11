// Heartbeat — bumps app_users.last_seen for the current identity (WHO cookie).
// Client pings every ~60s while the tab is visible.
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { admin } from "@/lib/supabase/admin";
import { WHO_COOKIE, isAppUser } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST() {
  const jar = await cookies();
  const who = jar.get(WHO_COOKIE)?.value;
  if (!isAppUser(who)) return NextResponse.json({ error: "no identity" }, { status: 400 });

  const supa = admin();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supa.from("app_users") as any)
    .update({ last_seen: new Date().toISOString() })
    .eq("username", who);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, user: who });
}
