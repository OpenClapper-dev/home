/**
 * The public API: the two forms and the confirmation link. Both forms are anonymous and behind
 * Turnstile. The waiting list is double opt-in: a row is stored unconfirmed with a token, the
 * confirmation mail goes out, and the link confirms it. Submitting an address again before it is
 * confirmed sends the mail again; a confirmed address answers the same as a new one, so the form
 * never tells whether an address is on the list.
 */
import { parseRequest, parseWaitlist, SubmissionError } from "@openclapper/home-vocab";
import { HttpError, json, readJson, type Router } from "./http.ts";
import { sendConfirmation } from "./mail.ts";
import { verifyTurnstile, TurnstileError } from "./turnstile.ts";
import type { Ctx } from "./index.ts";

/** How long a confirmation link works. The mail says 7 days. */
export const TOKEN_TTL_MS = 7 * 86_400_000;
/** The same unconfirmed address gets at most one mail per this; sooner, the answer is still "sent". */
const RESEND_AFTER_MS = 10 * 60_000;

const token = () => {
  const bytes = crypto.getRandomValues(new Uint8Array(24));
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
};

/** The field's error is the message the page shows under it. */
const fieldError = (err: unknown) => {
  if (err instanceof SubmissionError) return json({ error: err.message, field: err.field }, 400);
  throw err;
};

async function guard(ctx: Ctx, body: Record<string, unknown>, action: "waitlist" | "request") {
  try {
    await verifyTurnstile(body.turnstile, action, ctx.env, ctx.request.headers.get("cf-connecting-ip"), ctx.local);
  } catch (err) {
    if (err instanceof TurnstileError) {
      console.warn(`turnstile: ${err.message}`);
      throw new HttpError(403, "the bot check did not pass; reload the page and try again");
    }
    throw err;
  }
}

export function registerForms(router: Router<Ctx>) {
  router.on("POST", "/api/waitlist", async (ctx) => {
    const { env, request } = ctx;
    const body = await readJson<Record<string, unknown>>(request);
    let w;
    try { w = parseWaitlist(body); } catch (err) { return fieldError(err); }
    await guard(ctx, body, "waitlist");

    const now = new Date();
    const existing = await env.DB.prepare("SELECT id, confirmed_at, token_sent_at FROM waitlist WHERE email = ?1").bind(w.email).first<{ id: string; confirmed_at: string | null; token_sent_at: string | null }>();
    if (existing?.confirmed_at) return json({ ok: true });
    if (existing && existing.token_sent_at && now.getTime() - Date.parse(existing.token_sent_at) < RESEND_AFTER_MS) return json({ ok: true });

    const t = token();
    const positions = JSON.stringify(w.positions);
    if (existing) {
      await env.DB.prepare("UPDATE waitlist SET nickname = ?2, positions = ?3, other_position = ?4, years = ?5, token = ?6, token_sent_at = ?7, system = ?8 WHERE id = ?1")
        .bind(existing.id, w.nickname, positions, w.other_position, w.years, t, now.toISOString(), w.system).run();
    } else {
      await env.DB.prepare("INSERT INTO waitlist (id, email, nickname, positions, other_position, years, created_at, token, token_sent_at, system) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?7, ?9)")
        .bind(crypto.randomUUID(), w.email, w.nickname, positions, w.other_position, w.years, now.toISOString(), t, w.system).run();
    }
    try {
      await sendConfirmation(env.EMAIL, env, w.email, t);
    } catch (err) {
      // The row stays (unconfirmed, resendable); the person is told to try again.
      console.error("confirmation mail failed", err);
      throw new HttpError(502, "the confirmation mail could not be sent; try again in a few minutes");
    }
    return json({ ok: true });
  });

  /** The link in the mail. Always ends on the page: confirmed, or expired/unknown (the page says to sign up again). */
  router.on("GET", "/api/waitlist/confirm/:token", async ({ env }, { token: t }) => {
    const back = (state: "yes" | "no") => Response.redirect(`${env.SITE_URL.replace(/\/$/, "")}/?confirmed=${state}#waitlist`, 303);
    if (!/^[0-9a-f]{48}$/.test(t)) return back("no");
    const row = await env.DB.prepare("SELECT id, token_sent_at FROM waitlist WHERE token = ?1 AND confirmed_at IS NULL").bind(t).first<{ id: string; token_sent_at: string }>();
    if (!row || Date.now() - Date.parse(row.token_sent_at) > TOKEN_TTL_MS) return back("no");
    await env.DB.prepare("UPDATE waitlist SET confirmed_at = ?2, token = NULL WHERE id = ?1").bind(row.id, new Date().toISOString()).run();
    return back("yes");
  });

  router.on("POST", "/api/requests", async (ctx) => {
    const { env, request } = ctx;
    const body = await readJson<Record<string, unknown>>(request);
    let r;
    try { r = parseRequest(body); } catch (err) { return fieldError(err); }
    await guard(ctx, body, "request");
    const id = crypto.randomUUID();
    await env.DB.batch([
      env.DB.prepare("INSERT INTO requests (id, created_at, positions, other_position, years, contact, system) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)")
        .bind(id, new Date().toISOString(), JSON.stringify(r.positions), r.other_position, r.years, r.contact, r.system),
      ...r.entries.map((e, i) =>
        env.DB.prepare("INSERT INTO request_entries (id, request_id, position, title, text, test, prototype) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)")
          .bind(crypto.randomUUID(), id, i, e.title, e.text, e.test ? 1 : 0, e.prototype ? 1 : 0)),
    ]);
    return json({ ok: true, id }, 201);
  });
}
