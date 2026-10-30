/**
 * A form's unsent draft in localStorage: written on every change, restored on the next visit, cleared
 * once the form was sent. Storage can be unavailable (private mode, blocked); then the form just works
 * without a draft.
 */
import { useEffect, useRef, useState } from "preact/hooks";

function read<T>(key: string): T | null {
  try { const raw = localStorage.getItem(key); return raw ? (JSON.parse(raw) as T) : null; } catch { return null; }
}

const isPlain = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);
/** A draft from before a form grew a field is laid over today's defaults, one nested object deep (the person block), so new fields start as they should. */
function over<T extends object>(base: T, stored: Partial<T>): T {
  const out = { ...base } as Record<string, unknown>;
  for (const [k, v] of Object.entries(stored)) out[k] = isPlain(out[k]) && isPlain(v) ? { ...out[k], ...v } : v;
  return out as T;
}

export function useDraft<T extends object>(key: string, initial: () => T, isEmpty: (v: T) => boolean): [T, (v: T) => void, { restored: boolean; discard: () => void }] {
  const first = useRef<T | null>((() => { const stored = read<Partial<T>>(key); return stored ? over(initial(), stored) : null; })());
  const [value, setValue] = useState<T>(() => first.current ?? initial());
  const [restored, setRestored] = useState(() => first.current !== null && !isEmpty(first.current));
  useEffect(() => {
    try { if (isEmpty(value)) localStorage.removeItem(key); else localStorage.setItem(key, JSON.stringify(value)); } catch { /* no storage */ }
  }, [value]);
  const discard = () => { setValue(initial()); setRestored(false); };
  return [value, (v) => { setValue(v); setRestored(false); }, { restored, discard }];
}
