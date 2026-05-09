import { NextResponse } from "next/server";
import { makeSessionToken, SESSION_COOKIE } from "@/lib/auth";

export async function POST(req: Request) {
  const { password } = (await req.json()) as { password?: string };
  const expected = process.env.APP_PASSWORD;
  const secret = process.env.APP_AUTH_SECRET;

  if (!expected || !secret) {
    return NextResponse.json({ error: "Server not configured" }, { status: 500 });
  }
  if (typeof password !== "string" || password !== expected) {
    return NextResponse.json({ error: "Wrong password" }, { status: 401 });
  }

  const token = makeSessionToken(secret);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
    maxAge: 30 * 24 * 3600,
  });
  return res;
}
