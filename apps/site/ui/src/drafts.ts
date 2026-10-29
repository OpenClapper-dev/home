/**
 * A form's unsent draft in localStorage: written on every change, restored on the next visit, cleared
 * once the form was sent. Storage can be unavailable (private mode, blocked); then the form just works
 * without a draft.
 */
import { useEffect, useRef, useState } from "preact/hooks";

function read<T>(key: string): T | null {
  try { const raw = localStorage.getItem(key); return raw ? (JSON.parse(raw) as T) : null; } catch { return null; }
}

export function useDraft<T>(key: string, initial: () => T, isEmpty: (v: T) => boolean): [T, (v: T) => void, { restored: boolean; discard: () => void }] {
  const first = useRef(read<T>(key));
  const [value, setValue] = useState<T>(() => first.current ?? initial());
  const [restored, setRestored] = useState(() => first.current !== null && !isEmpty(first.current));
  useEffect(() => {
    try { if (isEmpty(value)) localStorage.removeItem(key); else localStorage.setItem(key, JSON.stringify(value)); } catch { /* no storage */ }
  }, [value]);
  const discard = () => { setValue(initial()); setRestored(false); };
  return [value, (v) => { setValue(v); setRestored(false); }, { restored, discard }];
}
