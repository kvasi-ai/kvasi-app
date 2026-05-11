// Heartbeat — bumps app_users.last_seen for the logged-in user.
// Client pings every ~60s while a tab is focused.
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { admin } from "@/lib/supabase/admin";
import { SESSION_COOKIE, getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST() {
  const jar = await cookies();
  const user = await getSessionUser(
    jar.get(SESSION_COOKIE)?.value,
    process.env.APP_AUTH_SECRET ?? "",
  );
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const supa = admin();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supa.from("app_users") as any)
    .update({ last_seen: new Date().toISOString() })
    .eq("username", user);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, user });
}
