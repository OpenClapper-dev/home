/**
 * Cloudflare Turnstile, server side: the page puts the widget's token in the submission, this checks
 * it with siteverify before anything is stored. Fails closed: no token, a network error or a mismatch
 * all refuse. The action must be the form's, and the hostname the site's own (SITE_URL), so a token
 * from another site's widget on the same key is refused. Cloudflare's test key answers with neither
 * (hostname example.com, `result_with_testing_key`); that answer is accepted only in local development.
 * Docs: https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
 */
export class TurnstileError extends Error {}

const SITEVERIFY = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export async function verifyTurnstile(token: unknown, action: "waitlist" | "request", env: { TURNSTILE_SECRET?: string; SITE_URL: string }, ip: string | null, local: boolean): Promise<void> {
  if (!env.TURNSTILE_SECRET) throw new TurnstileError("Turnstile is not configured");
  if (typeof token !== "string" || !token || token.length > 2048) throw new TurnstileError("missing token");
  const body = new URLSearchParams({ secret: env.TURNSTILE_SECRET, response: token });
  if (ip) body.set("remoteip", ip);
  let result: { success?: boolean; action?: string; hostname?: string; "error-codes"?: string[]; metadata?: { result_with_testing_key?: boolean } };
  try {
    const r = await fetch(SITEVERIFY, { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body, signal: AbortSignal.timeout(10_000) });
    if (!r.ok) throw new Error(`siteverify ${r.status}`);
    result = await r.json();
  } catch (err) {
    throw new TurnstileError(`siteverify failed: ${(err as Error).message}`);
  }
  if (!result.success) throw new TurnstileError(`refused: ${(result["error-codes"] ?? []).join(",") || "unknown"}`);
  if (local && result.metadata?.result_with_testing_key) return;
  if (result.action !== action) throw new TurnstileError(`action mismatch: ${result.action}`);
  const expected = new URL(env.SITE_URL).hostname;
  if (result.hostname !== expected) throw new TurnstileError(`hostname mismatch: ${result.hostname}`);
}
