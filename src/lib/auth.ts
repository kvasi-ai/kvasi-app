// Edge-runtime safe HMAC using Web Crypto API.
// Used by both proxy.ts (Edge) and /api/auth/login (Node) — single shared impl.

const COOKIE = "kvasi_session";
const enc = new TextEncoder();

async function getKey(secret: string) {
  return crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

function toHex(buf: ArrayBuffer): string {
  const view = new Uint8Array(buf);
  let out = "";
  for (let i = 0; i < view.length; i++) out += view[i].toString(16).padStart(2, "0");
  return out;
}

function safeEqHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return mismatch === 0;
}

async function sign(payload: string, secret: string): Promise<string> {
  const key = await getKey(secret);
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(payload));
  return toHex(sig);
}

export async function makeSessionToken(secret: string): Promise<string> {
  const exp = Date.now() + 30 * 24 * 3600 * 1000; // 30 days
  const payload = `v1.${exp}`;
  const sig = await sign(payload, secret);
  return `${payload}.${sig}`;
}

export async function verifySessionToken(token: string | undefined, secret: string): Promise<boolean> {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [v, exp, sig] = parts;
  if (v !== "v1") return false;
  if (Number(exp) < Date.now()) return false;
  const expected = await sign(`${v}.${exp}`, secret);
  return safeEqHex(sig, expected);
}

export const SESSION_COOKIE = COOKIE;
