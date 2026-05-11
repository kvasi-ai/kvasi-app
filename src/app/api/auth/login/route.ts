import { NextResponse } from "next/server";
import { makeSessionToken, SESSION_COOKIE, isAppUser, type AppUser } from "@/lib/auth";
import { admin } from "@/lib/supabase/admin";

// nodejs (not edge) so we can bump login_count via the admin client.
export const runtime = "nodejs";

// Per-user passwords. Set in Vercel env vars (and .env.local):
//   ANUJ_PASSWORD, SHREYAS_PASSWORD, NIKETAN_PASSWORD
// Legacy: APP_PASSWORD is accepted for backward-compat but logs the user as "anuj".
function expectedPasswordFor(user: AppUser): string | undefined {
  if (user === "anuj")     return process.env.ANUJ_PASSWORD    ?? process.env.APP_PASSWORD;
  if (user === "shreyas")  return process.env.SHREYAS_PASSWORD ?? process.env.APP_PASSWORD;
  if (user === "niketan")  return process.env.NIKETAN_PASSWORD ?? process.env.APP_PASSWORD;
  return undefined;
}

export async function POST(req: Request) {
  const body = (await req.json()) as { user?: string; password?: string };
  const user = body.user?.toLowerCase()?.trim();
  const password = body.password;
  const secret = process.env.APP_AUTH_SECRET;

  if (!secret) {
    return NextResponse.json({ error: "Server not configured (APP_AUTH_SECRET missing)" }, { status: 500 });
  }
  if (!isAppUser(user)) {
    return NextResponse.json({ error: "Pick a user" }, { status: 400 });
  }
  const expected = expectedPasswordFor(user);
  if (!expected) {
    return NextResponse.json({ error: `No password configured for ${user}` }, { status: 500 });
  }
  if (typeof password !== "string" || password !== expected) {
    return NextResponse.json({ error: "Wrong password" }, { status: 401 });
  }

  // Best-effort: bump login_count + last_seen. Never block login on this.
  try {
    const supa = admin();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supa.rpc as any)("noop").catch(() => null); // warm cache, ignore
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
    console.error("[login] failed to bump app_users:", (e as Error).message);
  }

  const token = await makeSessionToken(user, secret);
  const res = NextResponse.json({ ok: true, user });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
    maxAge: 30 * 24 * 3600,
  });
  return res;
}
