/**
 * The Turnstile widget on a form (explicit rendering; the script is in index.html). The token is
 * single-use and lives 5 minutes; the widget refreshes it on its own, and the form resets the widget
 * after every submission so the next one gets a fresh token.
 */
import { useEffect, useRef, useState } from "preact/hooks";

interface Turnstile {
  render(el: HTMLElement, opts: { sitekey: string; action: string; theme: "light" | "dark" | "auto"; "refresh-expired": "auto"; callback: (token: string) => void; "expired-callback": () => void; "error-callback": () => void }): string;
  reset(id: string): void;
  remove(id: string): void;
}
declare global { interface Window { turnstile?: Turnstile } }

const ready = () => new Promise<Turnstile>((resolve) => {
  const tick = () => { if (window.turnstile) resolve(window.turnstile); else setTimeout(tick, 100); };
  tick();
});

/** Renders the widget into the returned ref's element; `token` is null until the check passed. */
export function useTurnstile(action: "waitlist" | "request"): { ref: { current: HTMLDivElement | null }; token: string | null; reset: () => void; failed: boolean } {
  const ref = useRef<HTMLDivElement>(null);
  const id = useRef<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let gone = false;
    void ready().then((ts) => {
      if (gone || !ref.current) return;
      const theme = document.documentElement.getAttribute("data-theme") === "set" ? "dark" : "light";
      id.current = ts.render(ref.current, {
        sitekey: __TURNSTILE_SITEKEY__, action, theme, "refresh-expired": "auto",
        callback: (t) => { setToken(t); setFailed(false); },
        "expired-callback": () => setToken(null),
        "error-callback": () => { setToken(null); setFailed(true); },
      });
    });
    return () => { gone = true; if (id.current) window.turnstile?.remove(id.current); };
  }, []);
  const reset = () => { setToken(null); if (id.current) window.turnstile?.reset(id.current); };
  return { ref, token, reset, failed };
}
