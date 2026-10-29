/**
 * The two submissions as the API takes them (apps/site/src/forms.ts) and the page sends them. `parse*`
 * turns unknown JSON into a checked value or throws a SubmissionError naming the field: the Worker
 * answers 400 with that message, the page shows it under the field. Limits are generous: the forms
 * are meant to take brainstorms, not essays.
 */
import { isPositionId } from "./positions.ts";

export class SubmissionError extends Error {
  field: string;
  constructor(field: string, message: string) {
    super(message);
    this.field = field;
  }
}

export const LIMITS = {
  email: 320,
  nickname: 80,
  contact: 500,
  title: 160,
  text: 8000,
  otherPosition: 80,
  entries: 20,
  positions: 12,
  years: 70,
} as const;

/** Loose on purpose: a confirmation mail decides whether the address works. */
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Which film system the person worked in: the titles, departments and habits differ. */
export const SYSTEMS = ["german", "us", "other"] as const;
export type FilmSystem = (typeof SYSTEMS)[number];
export const SYSTEM_LABEL: Record<FilmSystem, string> = { german: "German", us: "US / International", other: "Other" };

export interface Person {
  /** The system the person worked in; null when not given. */
  system: FilmSystem | null;
  /** Position ids (positions.ts), in the order picked. */
  positions: string[];
  /** What "other" means when it is picked; null otherwise. */
  other_position: string | null;
  /** Years in the industry altogether, across every position; null when not given. */
  years: number | null;
}

/** Where the apps run; what a tester can test on. */
export const PLATFORMS = ["web", "android", "ios"] as const;
export type Platform = (typeof PLATFORMS)[number];
export const PLATFORM_LABEL: Record<Platform, string> = { web: "Web (Studio, Admin)", android: "Android", ios: "iOS (once it exists)" };

export interface WaitlistSubmission extends Person {
  email: string;
  nickname: string | null;
  /** Wants to be picked as an alpha tester (roadmap step 5). */
  tester: boolean;
  /** Wants the Call Sheet: a mail when the roadmap moves a step. */
  updates: boolean;
  /** Platforms the person can test on; required, non-empty, when tester. */
  platforms: Platform[];
}

export interface RequestEntry {
  title: string | null;
  text: string;
  /** Willing to test this feature once it exists. */
  test: boolean;
  /** Willing to be contacted while this feature is being shaped. */
  prototype: boolean;
}

export interface RequestSubmission extends Person {
  entries: RequestEntry[];
  /** How to reach the person, in their words (an email, a handle); required once an entry asks to test or to be contacted. */
  contact: string | null;
  /** Platforms the person could test on; required once an entry asks to test. */
  platforms: Platform[];
}

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);

/** An optional free text: absent, null or blank become null; otherwise trimmed and bounded. */
function optionalText(v: unknown, field: string, max: number): string | null {
  if (v === undefined || v === null) return null;
  if (typeof v !== "string") throw new SubmissionError(field, `${field} must be text`);
  const t = v.trim();
  if (!t) return null;
  if (t.length > max) throw new SubmissionError(field, `${field} is longer than ${max} characters`);
  return t;
}

/** A list of platform ids, deduplicated; absent or null is empty. */
function platforms(v: unknown): Platform[] {
  const raw = v === undefined || v === null ? [] : v;
  if (!Array.isArray(raw)) throw new SubmissionError("platforms", "platforms must be a list");
  const out: Platform[] = [];
  for (const p of raw) {
    if (!(PLATFORMS as readonly string[]).includes(p as string)) throw new SubmissionError("platforms", "unknown platform");
    if (!out.includes(p as Platform)) out.push(p as Platform);
  }
  return out;
}

function person(b: Record<string, unknown>): Person {
  const raw = b.positions === undefined || b.positions === null ? [] : b.positions;
  if (!Array.isArray(raw)) throw new SubmissionError("positions", "positions must be a list");
  if (raw.length > LIMITS.positions) throw new SubmissionError("positions", `at most ${LIMITS.positions} positions`);
  const positions: string[] = [];
  for (const id of raw) {
    if (!isPositionId(id)) throw new SubmissionError("positions", "unknown position");
    if (!positions.includes(id)) positions.push(id);
  }
  const other_position = positions.includes("other") ? optionalText(b.other_position, "other_position", LIMITS.otherPosition) : null;
  let years: number | null = null;
  if (b.years !== undefined && b.years !== null && b.years !== "") {
    const n = typeof b.years === "string" ? Number(b.years) : b.years;
    if (typeof n !== "number" || !Number.isInteger(n) || n < 0 || n > LIMITS.years) throw new SubmissionError("years", `years must be a whole number from 0 to ${LIMITS.years}`);
    years = n;
  }
  let system: FilmSystem | null = null;
  if (b.system !== undefined && b.system !== null && b.system !== "") {
    if (!(SYSTEMS as readonly string[]).includes(b.system as string)) throw new SubmissionError("system", "unknown system");
    system = b.system as FilmSystem;
  }
  return { system, positions, other_position, years };
}

export function parseWaitlist(v: unknown): WaitlistSubmission {
  if (!isRecord(v)) throw new SubmissionError("body", "expected an object");
  if (typeof v.email !== "string") throw new SubmissionError("email", "email is required");
  const email = v.email.trim();
  if (!email) throw new SubmissionError("email", "email is required");
  if (email.length > LIMITS.email || !EMAIL.test(email)) throw new SubmissionError("email", "this does not look like an email address");
  // Tester is the default: the form is the tester waiting list; the Call Sheet is the add-on, or the only pick.
  const tester = v.tester !== false;
  const updates = v.updates === true;
  if (!tester && !updates) throw new SubmissionError("tester", "pick the waiting list, the Call Sheet, or both");
  const ps = platforms(v.platforms);
  if (tester && ps.length === 0) throw new SubmissionError("platforms", "pick at least one platform you could test on");
  return { email, nickname: optionalText(v.nickname, "nickname", LIMITS.nickname), tester, updates, platforms: ps, ...person(v) };
}

export function parseRequest(v: unknown): RequestSubmission {
  if (!isRecord(v)) throw new SubmissionError("body", "expected an object");
  if (!Array.isArray(v.entries) || v.entries.length === 0) throw new SubmissionError("entries", "write at least one request");
  if (v.entries.length > LIMITS.entries) throw new SubmissionError("entries", `at most ${LIMITS.entries} requests at once`);
  const entries: RequestEntry[] = v.entries.map((e: unknown, i: number) => {
    const f = `entries.${i}`;
    if (!isRecord(e)) throw new SubmissionError(f, "expected an object");
    const text = typeof e.text === "string" ? e.text.trim() : "";
    if (!text) throw new SubmissionError(`${f}.text`, "the request text is required");
    if (text.length > LIMITS.text) throw new SubmissionError(`${f}.text`, `longer than ${LIMITS.text} characters`);
    return { title: optionalText(e.title, `${f}.title`, LIMITS.title), text, test: e.test === true, prototype: e.prototype === true };
  });
  const contact = optionalText(v.contact, "contact", LIMITS.contact);
  const ps = platforms(v.platforms);
  if (entries.some((e) => e.test || e.prototype) && !contact) throw new SubmissionError("contact", "say how to reach you, since you asked to test or to be contacted");
  if (entries.some((e) => e.test) && ps.length === 0) throw new SubmissionError("platforms", "pick at least one platform you could test on");
  return { entries, contact, platforms: ps, ...person(v) };
}
