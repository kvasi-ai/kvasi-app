// Note: Vercel env vars can only be changed via dashboard or `vercel env`.
// This endpoint simply VALIDATES whether a given password matches the current one,
// useful for "Are you sure?" UX in settings. To actually change the password,
// the team must update the APP_PASSWORD env var in Vercel and redeploy.
import { NextResponse } from "next/server";

export const runtime = "edge";

export async function POST(req: Request) {
  const { password } = (await req.json()) as { password?: string };
  const expected = process.env.APP_PASSWORD;
  if (!expected) return NextResponse.json({ error: "not_configured" }, { status: 500 });
  return NextResponse.json({ ok: typeof password === "string" && password === expected });
}
