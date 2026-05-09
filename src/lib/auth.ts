import { createHmac, timingSafeEqual } from "node:crypto";

const COOKIE = "kvasi_session";

function sign(payload: string, secret: string) {
  return createHmac("sha256", secret).update(payload).digest("hex");
}

function safeEq(a: string, b: string) {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

export function makeSessionToken(secret: string) {
  const exp = Date.now() + 30 * 24 * 3600 * 1000; // 30 days
  const payload = `v1.${exp}`;
  return `${payload}.${sign(payload, secret)}`;
}

export function verifySessionToken(token: string | undefined, secret: string): boolean {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [v, exp, sig] = parts;
  if (v !== "v1") return false;
  if (Number(exp) < Date.now()) return false;
  const expected = sign(`${v}.${exp}`, secret);
  return safeEq(sig, expected);
}

export const SESSION_COOKIE = COOKIE;
