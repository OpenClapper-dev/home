/**
 * The owner's view, under /admin behind Cloudflare Access: the waiting list (confirmed and pending),
 * every feature request with its entries, a status per request, and a CSV of the confirmed addresses
 * for the invites. Nothing here is reachable without the Access JWT (index.ts).
 */
import { assertEnum, json, readJson, type Router } from "./http.ts";
import type { Ctx } from "./index.ts";

export const STATUSES = ["new", "seen", "done"] as const;

interface WaitlistRow { id: string; email: string; nickname: string | null; positions: string; other_position: string | null; years: number | null; created_at: string; confirmed_at: string | null; invited_at: string | null }
interface RequestRow { id: string; created_at: string; positions: string; other_position: string | null; years: number | null; contact: string | null; status: string }
interface EntryRow { id: string; request_id: string; position: number; title: string | null; text: string; test: number; prototype: number }

const csvCell = (v: string | number | null) => { const s = v === null ? "" : String(v); return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };

export function registerAdmin(router: Router<Ctx>) {
  router.on("GET", "/admin/api/whoami", async ({ admin }) => json({ email: admin }));

  router.on("GET", "/admin/api/waitlist", async ({ env }) => {
    const { results } = await env.DB.prepare("SELECT id, email, nickname, positions, other_position, years, created_at, confirmed_at, invited_at FROM waitlist ORDER BY created_at DESC").all<WaitlistRow>();
    return json({ waitlist: results.map((r) => ({ ...r, positions: JSON.parse(r.positions) as string[] })) });
  });

  /** The confirmed addresses, for an invite round: email, nickname, positions, years, confirmed_at. */
  router.on("GET", "/admin/api/waitlist.csv", async ({ env }) => {
    const { results } = await env.DB.prepare("SELECT email, nickname, positions, other_position, years, confirmed_at, invited_at FROM waitlist WHERE confirmed_at IS NOT NULL ORDER BY confirmed_at").all<WaitlistRow>();
    const lines = ["email,nickname,positions,other_position,years,confirmed_at,invited_at", ...results.map((r) =>
      [r.email, r.nickname, (JSON.parse(r.positions) as string[]).join(" "), r.other_position, r.years, r.confirmed_at, r.invited_at].map(csvCell).join(","))];
    return new Response(`${lines.join("\n")}\n`, { headers: { "content-type": "text/csv; charset=utf-8", "content-disposition": 'attachment; filename="openclapper-waitlist.csv"', "cache-control": "no-store" } });
  });

  /** JSON { invited: boolean }: marks that an invite went out (or takes it back). */
  router.on("PATCH", "/admin/api/waitlist/:id", async ({ env, request }, { id }) => {
    const b = await readJson<{ invited?: unknown }>(request);
    if (typeof b.invited !== "boolean") return json({ error: "invited must be a boolean" }, 400);
    const r = await env.DB.prepare("UPDATE waitlist SET invited_at = ?2 WHERE id = ?1").bind(id, b.invited ? new Date().toISOString() : null).run();
    return r.meta.changes ? json({ ok: true }) : json({ error: "not found" }, 404);
  });

  router.on("DELETE", "/admin/api/waitlist/:id", async ({ env }, { id }) => {
    const r = await env.DB.prepare("DELETE FROM waitlist WHERE id = ?1").bind(id).run();
    return r.meta.changes ? json({ ok: true }) : json({ error: "not found" }, 404);
  });

  router.on("GET", "/admin/api/requests", async ({ env }) => {
    const [reqs, entries] = await env.DB.batch([
      env.DB.prepare("SELECT id, created_at, positions, other_position, years, contact, status FROM requests ORDER BY created_at DESC"),
      env.DB.prepare("SELECT id, request_id, position, title, text, test, prototype FROM request_entries ORDER BY request_id, position"),
    ]);
    const byRequest = new Map<string, EntryRow[]>();
    for (const e of entries.results as EntryRow[]) {
      const list = byRequest.get(e.request_id) ?? [];
      list.push(e);
      byRequest.set(e.request_id, list);
    }
    return json({
      requests: (reqs.results as RequestRow[]).map((r) => ({
        ...r,
        positions: JSON.parse(r.positions) as string[],
        entries: (byRequest.get(r.id) ?? []).map((e) => ({ id: e.id, title: e.title, text: e.text, test: e.test === 1, prototype: e.prototype === 1 })),
      })),
    });
  });

  /** JSON { status: new | seen | done }. */
  router.on("PATCH", "/admin/api/requests/:id", async ({ env, request }, { id }) => {
    const b = await readJson<{ status?: unknown }>(request);
    const status = assertEnum(b.status, "status", STATUSES);
    const r = await env.DB.prepare("UPDATE requests SET status = ?2 WHERE id = ?1").bind(id, status).run();
    return r.meta.changes ? json({ ok: true }) : json({ error: "not found" }, 404);
  });

  /** The entries go explicitly: D1 does not run the schema's ON DELETE CASCADE everywhere (not in the local runtime). */
  router.on("DELETE", "/admin/api/requests/:id", async ({ env }, { id }) => {
    const [, r] = await env.DB.batch([env.DB.prepare("DELETE FROM request_entries WHERE request_id = ?1").bind(id), env.DB.prepare("DELETE FROM requests WHERE id = ?1").bind(id)]);
    return r.meta.changes ? json({ ok: true }) : json({ error: "not found" }, 404);
  });
}
