// Next 16 renamed middleware → proxy. Same idea — runs on every matched request.
import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";

export const config = {
  matcher: ["/app/:path*", "/api/secure/:path*"],
};

export function proxy(req: NextRequest) {
  const cookie = req.cookies.get(SESSION_COOKIE)?.value;
  const ok = verifySessionToken(cookie, process.env.APP_AUTH_SECRET ?? "");
  if (ok) return NextResponse.next();
  const url = req.nextUrl.clone();
  url.pathname = "/login";
  url.searchParams.set("next", req.nextUrl.pathname);
  return NextResponse.redirect(url);
}
