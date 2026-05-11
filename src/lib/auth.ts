// Edge-runtime safe HMAC using Web Crypto API.
// Used by proxy.ts (Edge), /api/auth/login (Edge), and /api/secure/* (Node).
//
// Token format v2: `v2.{user}.{exp}.{sig}` where sig = HMAC(secret, `v2.{user}.{exp}`).
// `user` is one of the known usernames (lowercase). v1 tokens (no user) are
// still accepted by verifySessionToken for graceful migration but will be
// rejected by getSessionUser, forcing a re-login.

const COOKIE = "kvasi_session";
const enc = new TextEncoder();

export const KNOWN_USERS = ["anuj", "shreyas", "niketan"] as const;
export type AppUser = (typeof KNOWN_USERS)[number];

export function isAppUser(s: string | null | undefined): s is AppUser {
  return !!s && (KNOWN_USERS as readonly string[]).includes(s);
}

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

export async function makeSessionToken(user: AppUser, secret: string): Promise<string> {
  const exp = Date.now() + 30 * 24 * 3600 * 1000; // 30 days
  const payload = `v2.${user}.${exp}`;
  const sig = await sign(payload, secret);
  return `${payload}.${sig}`;
}

// Boolean check used by proxy.ts (just needs to know "is the cookie valid?").
// Accepts both v1 and v2 to avoid forcing immediate re-login on legacy sessions.
export async function verifySessionToken(token: string | undefined, secret: string): Promise<boolean> {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length === 3) {
    const [v, exp, sig] = parts;
    if (v !== "v1") return false;
    if (Number(exp) < Date.now()) return false;
    const expected = await sign(`${v}.${exp}`, secret);
    return safeEqHex(sig, expected);
  }
  if (parts.length === 4) {
    const [v, user, exp, sig] = parts;
    if (v !== "v2") return false;
    if (!isAppUser(user)) return false;
    if (Number(exp) < Date.now()) return false;
    const expected = await sign(`${v}.${user}.${exp}`, secret);
    return safeEqHex(sig, expected);
  }
  return false;
}

// Returns the authenticated user from a v2 token, or null if the token is
// invalid / expired / v1 (legacy). Used by API routes that need user identity.
export async function getSessionUser(token: string | undefined, secret: string): Promise<AppUser | null> {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 4) return null;
  const [v, user, exp, sig] = parts;
  if (v !== "v2") return null;
  if (!isAppUser(user)) return null;
  if (Number(exp) < Date.now()) return null;
  const expected = await sign(`${v}.${user}.${exp}`, secret);
  return safeEqHex(sig, expected) ? user : null;
}

export const SESSION_COOKIE = COOKIE;
