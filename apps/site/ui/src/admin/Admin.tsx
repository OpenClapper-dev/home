/** The owner's view (apps/site/src/admin.ts): the waiting list and every feature request. Behind Cloudflare Access. */
import { DEPARTMENT_LABEL, departmentsOf, LANGUAGE_LABEL, PLATFORM_LABEL, positionById, SYSTEM_LABEL, YEARS_LABEL, type FilmSystem, type Language, type Platform, type YearsBand } from "@openclapper/home-vocab";
import { Banner, Button, IconButton, Spinner, THEME_CYCLE, THEME_ICON, THEME_LABEL, useTheme } from "@openclapper/home-ui";
import { useEffect, useState } from "preact/hooks";

interface Wait { id: string; email: string; tester: boolean; updates: boolean; platforms: Platform[]; systems: FilmSystem[]; positions: string[]; other_position: string | null; years: YearsBand; languages: Language[]; other_language: string | null; created_at: string; confirmed_at: string | null; invited_at: string | null }
interface Entry { id: string; title: string | null; text: string; prototype: boolean }
interface Req { id: string; created_at: string; email: string | null; systems: FilmSystem[]; positions: string[]; other_position: string | null; years: YearsBand; languages: Language[]; other_language: string | null; status: "new" | "seen" | "done"; entries: Entry[] }

async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(path, { ...init, credentials: "same-origin", headers: { accept: "application/json", ...(init.body ? { "content-type": "application/json" } : {}) } });
  // Access sends its login page when the session ran out: go through it again.
  if (res.redirected) { location.reload(); throw new Error("signed out"); }
  const body = (await res.json().catch(() => null)) as ({ error?: string } & T) | null;
  if (!res.ok) throw new Error(body?.error ?? `HTTP ${res.status}`);
  return body as T;
}
const send = (method: string, path: string, body?: unknown) => api<unknown>(path, { method, body: body === undefined ? undefined : JSON.stringify(body) });

const when = (iso: string | null) => (iso ? new Date(iso).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" }) : "");
const who = (p: { systems: FilmSystem[]; positions: string[]; other_position: string | null; years: YearsBand; languages: Language[]; other_language: string | null; platforms?: Platform[] }) => {
  const parts = p.positions.map((id) => (id === "other" && p.other_position ? `Other: ${p.other_position}` : positionById(id)?.label ?? id));
  const depts = departmentsOf(p.positions).map((d) => DEPARTMENT_LABEL[d]);
  const languages = p.languages.map((l) => (l === "other" && p.other_language ? p.other_language : LANGUAGE_LABEL[l])).join("/");
  const platforms = (p.platforms ?? []).map((x) => PLATFORM_LABEL[x]).join("/");
  return [p.systems.map((s) => SYSTEM_LABEL[s]).join("/"), parts.join(", "), depts.length ? `(${depts.join(", ")})` : "", `${YEARS_LABEL[p.years]} yrs`, languages, platforms].filter(Boolean).join(" · ") || "no details";
};

type Tab = "requests" | "waitlist";
const tabFromHash = (): Tab => (location.hash === "#waitlist" ? "waitlist" : "requests");

export function Admin() {
  const [theme, setTheme] = useTheme();
  const [me, setMe] = useState("");
  const [tab, setTab] = useState<Tab>(tabFromHash);
  const [wait, setWait] = useState<Wait[] | null>(null);
  const [reqs, setReqs] = useState<Req[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const load = () => Promise.all([
    api<{ email: string }>("/admin/api/whoami").then((r) => setMe(r.email)),
    api<{ waitlist: Wait[] }>("/admin/api/waitlist").then((r) => setWait(r.waitlist)),
    api<{ requests: Req[] }>("/admin/api/requests").then((r) => setReqs(r.requests)),
  ]).then(() => setError(null)).catch((e: Error) => setError(e.message));
  useEffect(() => { void load(); }, []);
  useEffect(() => { const sync = () => setTab(tabFromHash()); addEventListener("hashchange", sync); return () => removeEventListener("hashchange", sync); }, []);
  const act = async (fn: () => Promise<unknown>) => { try { await fn(); await load(); } catch (e) { setError((e as Error).message); } };

  const confirmed = wait?.filter((w) => w.confirmed_at) ?? [];
  const fresh = reqs?.filter((r) => r.status === "new") ?? [];
  return (
    <div class="admin">
      <header class="admin__head">
        <span class="top__brand"><img src="/icons/favicon.svg" alt="" width="24" height="24" />home admin</span>
        <nav class="admin__tabs f-tabs" aria-label="Page">
          <a class="f-tab" href="#requests" aria-selected={tab === "requests"}>Requests{fresh.length > 0 && <span class="f-tab__count">{fresh.length}</span>}</a>
          <a class="f-tab" href="#waitlist" aria-selected={tab === "waitlist"}>Waiting list</a>
        </nav>
        <span style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span class="meta">{me && `${me} (Cloudflare Access) · `}<span class="num">v{__HOME_VERSION__} ({__HOME_COMMIT__})</span></span>
          <IconButton icon={THEME_ICON[theme]} label={THEME_LABEL[theme]} onClick={() => setTheme(THEME_CYCLE[theme])} />
        </span>
      </header>
      {error && <Banner kind="danger" title="Could not load" role="alert" action={<Button size="sm" kind="secondary" onClick={() => void load()}>Try again</Button>}>{error}</Banner>}
      {!error && (!wait || !reqs) && <div class="status"><Spinner size="lg" /></div>}
      {wait && reqs && (
        <div class="admin__tiles">
          <div class="tile"><span class="tile__label">Requests</span><span class="tile__value num">{reqs.length}</span><span class="meta">{fresh.length} new · {reqs.reduce((n, r) => n + r.entries.length, 0)} entries</span></div>
          <div class="tile"><span class="tile__label">Testers confirmed</span><span class="tile__value num">{confirmed.filter((w) => w.tester).length}</span><span class="meta">{wait.length - confirmed.length} pending · {confirmed.filter((w) => w.invited_at).length} invited · {confirmed.filter((w) => w.updates).length} on the Call Sheet</span></div>
          <div class="tile"><span class="tile__label">Would answer questions</span><span class="tile__value num">{reqs.flatMap((r) => r.entries).filter((e) => e.prototype).length}</span><span class="meta">entries with a contact behind them</span></div>
        </div>
      )}
      {tab === "requests" && reqs && (
        <section class="sec-box">
          <div class="sec-box__head">Feature requests<span class="grow" /><span class="num">{reqs.length}</span></div>
          {reqs.length === 0 && <p class="status meta">Nothing yet.</p>}
          {reqs.map((r) => (
            <article class={`req${r.status === "done" ? " req--done" : ""}`} key={r.id}>
              <div class="req__meta">
                <span class="num">{when(r.created_at)}</span>
                <span>{who(r)}</span>
                <span class="grow" />
                <span class="f-seg" role="radiogroup" aria-label="Status">
                  {(["new", "seen", "done"] as const).map((s) => <button type="button" class="f-seg__opt" role="radio" aria-checked={r.status === s} key={s} onClick={() => void act(() => send("PATCH", `/admin/api/requests/${r.id}`, { status: s }))}>{s}</button>)}
                </span>
                <IconButton icon="delete" size="sm" label="Delete this submission" onClick={() => { if (confirm("Delete this submission and its entries?")) void act(() => send("DELETE", `/admin/api/requests/${r.id}`)); }} />
              </div>
              {r.entries.map((e) => (
                <div class="req__entry" key={e.id}>
                  {e.title && <span class="req__title">{e.title}</span>}
                  <span class="req__text">{e.text}</span>
                  {e.prototype && <span class="req__flags"><span class="pill pill--soon">would answer questions</span></span>}
                </div>
              ))}
              {r.email && <div class="req__contact"><span class="meta">Email · </span>{r.email}</div>}
            </article>
          ))}
        </section>
      )}
      {tab === "waitlist" && wait && (
        <section class="sec-box">
          <div class="sec-box__head">Waiting list<span class="grow" /><a class="f-btn f-btn--secondary f-btn--sm" href="/admin/api/waitlist.csv" download>CSV of confirmed</a></div>
          <div class="scroll">
            <table class="tbl">
              <thead><tr><th>Email</th><th>For</th><th>About</th><th>Signed up</th><th>Confirmed</th><th>Invited</th><th /></tr></thead>
              <tbody>
                {wait.length === 0 && <tr><td colSpan={7} class="meta">Nothing yet.</td></tr>}
                {wait.map((w) => (
                  <tr key={w.id}>
                    <td>{w.email}</td>
                    <td class="req__flags">{w.tester && <span class="pill pill--ok">tester</span>}{w.updates && <span class="pill pill--soon">Call Sheet</span>}</td>
                    <td class="meta">{who(w)}</td>
                    <td class="num meta">{when(w.created_at)}</td>
                    <td>{w.confirmed_at ? <span class="pill pill--ok">{when(w.confirmed_at)}</span> : <span class="pill pill--later">pending</span>}</td>
                    <td>{w.confirmed_at && <button type="button" class={`f-check${w.invited_at ? " is-checked" : ""}`} role="checkbox" aria-checked={!!w.invited_at} onClick={() => void act(() => send("PATCH", `/admin/api/waitlist/${w.id}`, { invited: !w.invited_at }))}><span class="f-check__box">{w.invited_at && "✓"}</span><span class="meta">{when(w.invited_at)}</span></button>}</td>
                    <td class="tbl__act"><IconButton icon="delete" size="sm" label={`Remove ${w.email}`} onClick={() => { if (confirm(`Remove ${w.email} from the list?`)) void act(() => send("DELETE", `/admin/api/waitlist/${w.id}`)); }} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
