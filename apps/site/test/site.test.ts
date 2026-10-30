/**
 * The site's Worker: the two forms (Turnstile first, then validation, then storage), the double
 * opt-in, and the admin API behind Access. The Worker's fetch is called directly so each test can set
 * the variables; Turnstile's siteverify and the Access JWKS endpoint are answered by a stubbed fetch,
 * and the mail binding by a fake that records what it was asked to send.
 */
import { env } from "cloudflare:workers";
import { afterAll, beforeAll, beforeEach, describe, expect, test, vi } from "vitest";
import worker, { router, type Env } from "../src/index.ts";
import { TOKEN_TTL_MS } from "../src/forms.ts";

const TEAM = "team.example.test", AUD = "home-aud", SITE = "https://openclapper.example";
const sent: { to: string; subject: string; text: string }[] = [];
const mailer: Env["EMAIL"] = { async send(m) { sent.push({ to: m.to, subject: m.subject, text: m.text }); return { messageId: "m" }; } };
const base: Env = { ...env, EMAIL: mailer, ACCESS_TEAM_DOMAIN: TEAM, ACCESS_AUD: AUD, SITE_URL: SITE, MAIL_FROM: "OpenClapper <noreply@openclapper.example>", TURNSTILE_SECRET: "secret", ADMIN_DEV_BYPASS: undefined };

/** What the stubbed siteverify answers next; reset per test to a pass. */
let siteverify: Record<string, unknown> = {};
const passFor = (action: string) => ({ success: true, action, hostname: "openclapper.example" });

function call(e: Env, method: string, path: string, opts: { jwt?: string; body?: unknown; host?: string; headers?: Record<string, string> } = {}): Promise<Response> {
  const headers = new Headers(opts.headers);
  if (opts.jwt) headers.set("Cf-Access-Jwt-Assertion", opts.jwt);
  if (opts.body !== undefined) headers.set("content-type", "application/json");
  return worker.fetch(new Request(`https://${opts.host ?? "openclapper.example"}${path}`, { method, headers, body: opts.body === undefined ? undefined : JSON.stringify(opts.body), redirect: "manual" }), e);
}
async function json<T = Record<string, unknown>>(res: Promise<Response>, status: number): Promise<T> {
  const r = await res;
  const text = await r.text();
  expect(r.status, text).toBe(status);
  return JSON.parse(text) as T;
}

// ---------- A signing key standing in for Access's ----------
const b64url = (b: ArrayBuffer | Uint8Array) => btoa(String.fromCharCode(...new Uint8Array(b))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const enc = (o: unknown) => b64url(new TextEncoder().encode(JSON.stringify(o)));
const RSA = { name: "RSASSA-PKCS1-v1_5", modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: "SHA-256" };
let accessKey: CryptoKeyPair, strangerKey: CryptoKeyPair;
async function jwt(claims: Record<string, unknown> = {}, key = accessKey): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const head = enc({ alg: "RS256", kid: "k1" });
  const body = enc({ aud: [AUD], iss: `https://${TEAM}`, exp: now + 300, iat: now, email: "owner@example.test", ...claims });
  const sig = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", key.privateKey, new TextEncoder().encode(`${head}.${body}`));
  return `${head}.${body}.${b64url(sig)}`;
}

beforeAll(async () => {
  accessKey = (await crypto.subtle.generateKey(RSA, true, ["sign", "verify"])) as CryptoKeyPair;
  strangerKey = (await crypto.subtle.generateKey(RSA, true, ["sign", "verify"])) as CryptoKeyPair;
  const jwk = { ...(await crypto.subtle.exportKey("jwk", accessKey.publicKey) as JsonWebKey), kid: "k1" };
  const real = globalThis.fetch;
  vi.spyOn(globalThis, "fetch").mockImplementation(async (input, init) => {
    const url = input instanceof Request ? input.url : String(input);
    if (url === `https://${TEAM}/cdn-cgi/access/certs`) return Response.json({ keys: [jwk] });
    if (url === "https://challenges.cloudflare.com/turnstile/v0/siteverify") return Response.json(siteverify);
    return real(input, init);
  });
});
afterAll(() => { vi.restoreAllMocks(); });
beforeEach(async () => {
  sent.length = 0;
  siteverify = passFor("waitlist");
  await env.DB.batch([env.DB.prepare("DELETE FROM request_entries"), env.DB.prepare("DELETE FROM requests"), env.DB.prepare("DELETE FROM waitlist")]);
});

/** The required about-you block, as both forms send it. */
const who = { systems: ["german"], positions: ["second-ad"], years: "3-6", languages: ["german", "english"] };
const waitlist = (over: Record<string, unknown> = {}) => ({ email: "me@example.test", platforms: ["web"], ...who, turnstile: "tok", ...over });
const request = (over: Record<string, unknown> = {}) => ({ entries: [{ text: "Call sheets on the phone" }], ...who, turnstile: "tok", ...over });

describe("turnstile", () => {
  test("no token, a failed check, a wrong action or a foreign hostname refuse before anything is stored", async () => {
    await json(call(base, "POST", "/api/waitlist", { body: waitlist({ turnstile: undefined }) }), 403);
    siteverify = { success: false, "error-codes": ["invalid-input-response"] };
    await json(call(base, "POST", "/api/waitlist", { body: waitlist() }), 403);
    siteverify = passFor("request");
    await json(call(base, "POST", "/api/waitlist", { body: waitlist() }), 403);
    siteverify = { ...passFor("waitlist"), hostname: "evil.example" };
    await json(call(base, "POST", "/api/waitlist", { body: waitlist() }), 403);
    expect(sent).toHaveLength(0);
    expect((await env.DB.prepare("SELECT count(*) AS n FROM waitlist").first<{ n: number }>())!.n).toBe(0);
  });
  test("the test key's answer (no action, hostname example.com) passes only locally", async () => {
    siteverify = { success: true, hostname: "example.com", metadata: { result_with_testing_key: true } };
    await json(call(base, "POST", "/api/waitlist", { body: waitlist() }), 403);
    const local: Env = { ...base, ACCESS_TEAM_DOMAIN: "", ACCESS_AUD: "", ADMIN_DEV_BYPASS: "true" };
    await json(call(local, "POST", "/api/waitlist", { body: waitlist(), host: "localhost:8790" }), 200);
    await json(call(local, "POST", "/api/waitlist", { body: waitlist({ email: "x@example.test" }) }), 403);
  });
  test("without the secret every submission is refused", async () => {
    await json(call({ ...base, TURNSTILE_SECRET: undefined }, "POST", "/api/waitlist", { body: waitlist() }), 403);
  });
  test("validation answers before the bot check, naming the field", async () => {
    siteverify = { success: false };
    const r = await json(call(base, "POST", "/api/waitlist", { body: waitlist({ email: "nope" }) }), 400);
    expect(r.field).toBe("email");
  });
});

describe("waiting list", () => {
  test("sign-up stores an unconfirmed row and mails a link; the link confirms once", async () => {
    await json(call(base, "POST", "/api/waitlist", { body: waitlist({ positions: ["dp", "gaffer"], years: "6-9" }) }), 200);
    expect(sent).toHaveLength(1);
    expect(sent[0].to).toBe("me@example.test");
    const link = sent[0].text.match(/https:\S+/)![0];
    expect(link.startsWith(`${SITE}/api/waitlist/confirm/`)).toBe(true);
    const row = await env.DB.prepare("SELECT confirmed_at, token, positions, platforms, tester, updates FROM waitlist WHERE email = 'ME@example.test'").first<{ confirmed_at: string | null; token: string | null; positions: string; platforms: string; tester: number; updates: number }>();
    expect(row!.confirmed_at).toBeNull();
    expect(row!.positions).toBe('["dp","gaffer"]');
    expect([row!.platforms, row!.tester, row!.updates]).toEqual(['["web"]', 1, 0]);
    expect(sent[0].text).toContain("to join the tester waiting list:");

    const path = new URL(link).pathname;
    const r1 = await call(base, "GET", path);
    expect(r1.status).toBe(303);
    expect(r1.headers.get("location")).toBe(`${SITE}/?confirmed=yes#waitlist`);
    const after = await env.DB.prepare("SELECT confirmed_at, token FROM waitlist WHERE email = 'me@example.test'").first<{ confirmed_at: string | null; token: string | null }>();
    expect(after!.confirmed_at).not.toBeNull();
    expect(after!.token).toBeNull();
    // The same link again: unknown now.
    expect((await call(base, "GET", path)).headers.get("location")).toBe(`${SITE}/?confirmed=no#waitlist`);
  });
  test("a confirmed address answers like a new one and gets no second mail; an unconfirmed one gets the mail again after the resend window", async () => {
    await json(call(base, "POST", "/api/waitlist", { body: waitlist() }), 200);
    const link = sent[0].text.match(/https:\S+/)![0];
    await call(base, "GET", new URL(link).pathname);
    await json(call(base, "POST", "/api/waitlist", { body: waitlist({ years: "12+" }) }), 200);
    expect(sent).toHaveLength(1);

    await json(call(base, "POST", "/api/waitlist", { body: waitlist({ email: "slow@example.test" }) }), 200);
    await json(call(base, "POST", "/api/waitlist", { body: waitlist({ email: "slow@example.test" }) }), 200);
    expect(sent).toHaveLength(2); // inside the resend window: no new mail, still "ok"
    await env.DB.prepare("UPDATE waitlist SET token_sent_at = ?1 WHERE email = 'slow@example.test'").bind(new Date(Date.now() - 3_600_000).toISOString()).run();
    await json(call(base, "POST", "/api/waitlist", { body: waitlist({ email: "slow@example.test", years: "lt1" }) }), 200);
    expect(sent).toHaveLength(3);
    expect(sent[2].text).not.toContain(new URL(sent[1].text.match(/https:\S+/)![0]).pathname); // a fresh token
  });
  test("an old link is refused", async () => {
    await json(call(base, "POST", "/api/waitlist", { body: waitlist() }), 200);
    await env.DB.prepare("UPDATE waitlist SET token_sent_at = ?1").bind(new Date(Date.now() - TOKEN_TTL_MS - 1000).toISOString()).run();
    const path = new URL(sent[0].text.match(/https:\S+/)![0]).pathname;
    expect((await call(base, "GET", path)).headers.get("location")).toBe(`${SITE}/?confirmed=no#waitlist`);
    expect((await call(base, "GET", "/api/waitlist/confirm/not-a-token")).headers.get("location")).toBe(`${SITE}/?confirmed=no#waitlist`);
  });
  test("the Call Sheet alone needs no platform; the mail and the row say what was picked", async () => {
    await json(call(base, "POST", "/api/waitlist", { body: waitlist({ platforms: [], tester: false, updates: true }) }), 200);
    expect(sent[0].subject).toContain("Call Sheet");
    expect(sent[0].text).toContain("to join the Call Sheet:");
    const row = await env.DB.prepare("SELECT tester, updates FROM waitlist WHERE email = 'me@example.test'").first<{ tester: number; updates: number }>();
    expect([row!.tester, row!.updates]).toEqual([0, 1]);
    expect((await json(call(base, "POST", "/api/waitlist", { body: waitlist({ email: "t@example.test", platforms: [] }) }), 400)).field).toBe("platforms");
    await json(call(base, "POST", "/api/waitlist", { body: waitlist({ email: "b@example.test", updates: true }) }), 200);
    expect(sent[1].text).toContain("to join the tester waiting list and the Call Sheet:");
  });
  test("a failed mail keeps the row and answers 502", async () => {
    const broken: Env = { ...base, EMAIL: { async send() { throw new Error("quota"); } } };
    await json(call(broken, "POST", "/api/waitlist", { body: waitlist() }), 502);
    expect((await env.DB.prepare("SELECT count(*) AS n FROM waitlist").first<{ n: number }>())!.n).toBe(1);
  });
});

describe("feature requests", () => {
  beforeEach(() => { siteverify = passFor("request"); });
  test("a submission stores the person once and every entry in order", async () => {
    const r = await json<{ id: string }>(call(base, "POST", "/api/requests", { body: request({ entries: [{ title: "Call sheets", text: "On the phone" }, { text: "Weather per day", prototype: true }], email: "asker@example.test" }) }), 201);
    const entries = await env.DB.prepare("SELECT title, text, prototype FROM request_entries WHERE request_id = ?1 ORDER BY position").bind(r.id).all();
    expect(entries.results).toEqual([{ title: "Call sheets", text: "On the phone", prototype: 0 }, { title: null, text: "Weather per day", prototype: 1 }]);
    expect((await env.DB.prepare("SELECT email, systems, years, languages FROM requests WHERE id = ?1").bind(r.id).first())).toEqual({ email: "asker@example.test", systems: '["german"]', years: "3-6", languages: '["german","english"]' });
    // An email on a request is unverified: it never makes the site send a mail.
    expect(sent).toHaveLength(0);
  });
  test("asking for questions needs an email; the about-you block is always required; never a mail", async () => {
    expect((await json(call(base, "POST", "/api/requests", { body: request({ entries: [{ text: "x", prototype: true }] }) }), 400)).field).toBe("email");
    expect((await json(call(base, "POST", "/api/requests", { body: request({ years: undefined }) }), 400)).field).toBe("years");
    expect((await json(call(base, "POST", "/api/requests", { body: request({ positions: [] }) }), 400)).field).toBe("positions");
    expect((await json(call(base, "POST", "/api/requests", { body: request({ languages: ["other"] }) }), 400)).field).toBe("other_language");
    await json(call(base, "POST", "/api/requests", { body: request() }), 201);
    expect(sent).toHaveLength(0);
    await json(call(base, "POST", "/api/requests", { body: request({ entries: [{ text: "x", prototype: true }], email: "q@example.test" }) }), 201);
    expect(sent).toHaveLength(0);
  });
  test("an empty entry is refused with its field", async () => {
    const r = await json(call(base, "POST", "/api/requests", { body: request({ entries: [{ text: "ok" }, { title: "only a title" }] }) }), 400);
    expect(r.field).toBe("entries.1.text");
  });
  test("a body that is not JSON, or too large, is refused", async () => {
    expect((await worker.fetch(new Request("https://openclapper.example/api/requests", { method: "POST", headers: { "content-type": "text/plain" }, body: "x" }), base)).status).toBe(415);
    await json(call(base, "POST", "/api/requests", { body: request({ entries: [{ text: "x".repeat(300_000) }] }) }), 413);
  });
});

describe("admin", () => {
  test("nothing under /admin without a verified JWT of this application; the page included", async () => {
    await json(call(base, "GET", "/admin/api/whoami"), 401);
    await json(call(base, "GET", "/admin/"), 401);
    await json(call(base, "GET", "/admin/api/waitlist", { jwt: await jwt({}, strangerKey) }), 401);
    await json(call(base, "GET", "/admin/api/waitlist", { jwt: await jwt({ aud: ["other"] }) }), 401);
    await json(call({ ...base, ACCESS_TEAM_DOMAIN: "", ACCESS_AUD: "" }, "GET", "/admin/api/whoami", { jwt: await jwt() }), 401);
    const me = await json(call(base, "GET", "/admin/api/whoami", { jwt: await jwt() }), 200);
    expect(me.email).toBe("owner@example.test");
  });
  test("the local bypass works only on localhost", async () => {
    const bypass: Env = { ...base, ACCESS_TEAM_DOMAIN: "", ACCESS_AUD: "", ADMIN_DEV_BYPASS: "true" };
    await json(call(bypass, "GET", "/admin/api/whoami"), 401);
    expect((await json(call(bypass, "GET", "/admin/api/whoami", { host: "localhost:8790" }), 200)).email).toBe("admin@localhost");
  });
  test("the waiting list, its CSV of confirmed addresses, the invite mark and deletion", async () => {
    siteverify = passFor("waitlist");
    await json(call(base, "POST", "/api/waitlist", { body: waitlist({ email: "a@example.test", positions: ["dp", "other"], other_position: 'Drone "pilot"' }) }), 200);
    await json(call(base, "POST", "/api/waitlist", { body: waitlist({ email: "b@example.test" }) }), 200);
    await call(base, "GET", new URL(sent[0].text.match(/https:\S+/)![0]).pathname);
    const t = await jwt();
    const list = await json<{ waitlist: { email: string; confirmed_at: string | null; positions: string[]; platforms: string[]; tester: boolean; updates: boolean; id: string }[] }>(call(base, "GET", "/admin/api/waitlist", { jwt: t }), 200);
    expect(list.waitlist.map((w) => [w.email, !!w.confirmed_at])).toEqual([["b@example.test", false], ["a@example.test", true]]);
    expect(list.waitlist[1].positions).toEqual(["dp", "other"]);
    expect([list.waitlist[1].platforms, list.waitlist[1].tester, list.waitlist[1].updates]).toEqual([["web"], true, false]);
    const csv = await (await call(base, "GET", "/admin/api/waitlist.csv", { jwt: t })).text();
    expect(csv.split("\n")[0]).toBe("email,tester,updates,platforms,systems,positions,other_position,years,languages,other_language,confirmed_at,invited_at");
    expect(csv.split("\n")[1].startsWith('a@example.test,1,0,web,german,dp other,"Drone ""pilot""",3-6,german english,,')).toBe(true);
    expect(csv).not.toContain("b@example.test");
    const a = list.waitlist[1].id;
    await json(call(base, "PATCH", `/admin/api/waitlist/${a}`, { jwt: t, body: { invited: true } }), 200);
    expect((await env.DB.prepare("SELECT invited_at FROM waitlist WHERE id = ?1").bind(a).first<{ invited_at: string | null }>())!.invited_at).not.toBeNull();
    await json(call(base, "DELETE", `/admin/api/waitlist/${a}`, { jwt: t }), 200);
    await json(call(base, "DELETE", `/admin/api/waitlist/${a}`, { jwt: t }), 404);
  });
  test("requests with their entries, a status, and deletion that takes the entries along", async () => {
    siteverify = passFor("request");
    const { id } = await json<{ id: string }>(call(base, "POST", "/api/requests", { body: request({ entries: [{ text: "one" }, { text: "two", prototype: true }], email: "me@example.test" }) }), 201);
    const t = await jwt();
    const list = await json<{ requests: { id: string; status: string; entries: { text: string; prototype: boolean }[] }[] }>(call(base, "GET", "/admin/api/requests", { jwt: t }), 200);
    expect(list.requests[0].id).toBe(id);
    expect(list.requests[0].entries.map((e) => [e.text, e.prototype])).toEqual([["one", false], ["two", true]]);
    await json(call(base, "PATCH", `/admin/api/requests/${id}`, { jwt: t, body: { status: "seen" } }), 200);
    await json(call(base, "PATCH", `/admin/api/requests/${id}`, { jwt: t, body: { status: "nope" } }), 400);
    await json(call(base, "DELETE", `/admin/api/requests/${id}`, { jwt: t }), 200);
    expect((await env.DB.prepare("SELECT count(*) AS n FROM request_entries").first<{ n: number }>())!.n).toBe(0);
  });
});

describe("routes", () => {
  test("every registered route is exercised above (add a test when you add a route)", () => {
    const tested = new Set([
      "POST /api/waitlist", "GET /api/waitlist/confirm/:token", "POST /api/requests",
      "GET /admin/api/whoami", "GET /admin/api/waitlist", "GET /admin/api/waitlist.csv", "PATCH /admin/api/waitlist/:id", "DELETE /admin/api/waitlist/:id",
      "GET /admin/api/requests", "PATCH /admin/api/requests/:id", "DELETE /admin/api/requests/:id",
    ]);
    for (const r of router.list()) expect(tested.has(`${r.method} ${r.pattern}`), `${r.method} ${r.pattern}`).toBe(true);
  });
});
