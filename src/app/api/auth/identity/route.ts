// Identity selector — sets the kvasi_who cookie, bumps app_users.last_seen
// and login_count. Called by the IdentityPicker modal that fires when an
// authed user has no identity selected yet.
//
// This is NOT auth. Workspace access is gated by /api/auth/login.
// The WHO cookie is a separate, soft identity tag for presence tracking.
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { admin } from "@/lib/supabase/admin";
import { WHO_COOKIE, SESSION_COOKIE, verifySessionToken, isAppUser } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: Request) {
  const jar = await cookies();
  const ok = await verifySessionToken(jar.get(SESSION_COOKIE)?.value, process.env.APP_AUTH_SECRET ?? "");
  if (!ok) return NextResponse.json({ error: "not signed in" }, { status: 401 });

  const body = (await req.json().catch(() => ({}))) as { user?: string };
  const user = body.user?.toLowerCase()?.trim();
  if (!isAppUser(user)) return NextResponse.json({ error: "pick a user" }, { status: 400 });

  // Bump login_count + last_seen — best effort.
  try {
    const supa = admin();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: prev } = await (supa.from("app_users") as any)
      .select("login_count")
      .eq("username", user)
      .maybeSingle();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supa.from("app_users") as any)
      .update({
        last_seen: new Date().toISOString(),
        login_count: (prev?.login_count ?? 0) + 1,
      })
      .eq("username", user);
  } catch (e) {
    console.error("[identity] failed to bump app_users:", (e as Error).message);
  }

  const res = NextResponse.json({ ok: true, user });
  res.cookies.set(WHO_COOKIE, user, {
    httpOnly: false, // client reads this for tooltips; soft signal only
    sameSite: "lax",
    secure: true,
    path: "/",
    maxAge: 30 * 24 * 3600,
  });
  return res;
}

// DELETE → clear the identity so the picker pops up again. Used by "switch user".
export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(WHO_COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}
