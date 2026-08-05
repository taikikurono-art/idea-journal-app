// Lightweight signed-cookie session so acquaintances can join with just a
// shared password + display name — no accounts, no email, no OAuth.
// Uses the Web Crypto API so it works in both the Edge middleware and
// normal Node API routes.

export const SESSION_COOKIE = "idea_journal_session";

function getSecret(): string {
  return process.env.SESSION_SECRET || "insecure-dev-secret";
}

async function hmac(value: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(getSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value));
  return Buffer.from(sig).toString("base64url");
}

export async function signSession(name: string): Promise<string> {
  const payload = Buffer.from(name, "utf-8").toString("base64url");
  const sig = await hmac(payload);
  return `${payload}.${sig}`;
}

export async function verifySession(cookieValue: string | undefined | null): Promise<string | null> {
  if (!cookieValue) return null;
  const [payload, sig] = cookieValue.split(".");
  if (!payload || !sig) return null;
  const expected = await hmac(payload);
  if (expected !== sig) return null;
  try {
    return Buffer.from(payload, "base64url").toString("utf-8");
  } catch {
    return null;
  }
}
