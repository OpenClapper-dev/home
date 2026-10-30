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
  otherLanguage: 60,
  title: 160,
  text: 8000,
  otherPosition: 80,
  entries: 20,
  positions: 12,
} as const;

/** Loose on purpose: a confirmation mail decides whether the address works. */
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Which film systems the person worked in (many): the titles, departments and habits differ. */
export const SYSTEMS = ["german", "us", "other"] as const;
export type FilmSystem = (typeof SYSTEMS)[number];
export const SYSTEM_LABEL: Record<FilmSystem, string> = { german: "German", us: "US / International", other: "Other" };

/** Years in the industry, as a band: exact numbers invite hesitation and say no more. */
export const YEARS = ["lt1", "1-3", "3-6", "6-9", "9-12", "12+"] as const;
export type YearsBand = (typeof YEARS)[number];
export const YEARS_LABEL: Record<YearsBand, string> = { lt1: "Less than a year", "1-3": "1 to 3", "3-6": "3 to 6", "6-9": "6 to 9", "9-12": "9 to 12", "12+": "12 or more" };

/** Languages the person could test in, or be asked questions in (many); "other" names one. */
export const LANGUAGES = ["german", "english", "other"] as const;
export type Language = (typeof LANGUAGES)[number];
export const LANGUAGE_LABEL: Record<Language, string> = { german: "German", english: "English", other: "Another language" };

/**
 * The about-you block, the same on both forms and required on both: the owner needs to see which
 * direction input comes from, to even out biases early. No name is asked.
 */
export interface Person {
  /** The systems the person worked in, at least one. */
  systems: FilmSystem[];
  /** Position ids (positions.ts), in the order picked, at least one. */
  positions: string[];
  /** What "other" means when it is picked; required then, null otherwise. */
  other_position: string | null;
  /** Years in the industry altogether, across every position. */
  years: YearsBand;
  /** Languages to test or answer questions in, at least one. */
  languages: Language[];
  /** Which language "other" means when it is picked; required then, null otherwise. */
  other_language: string | null;
}

/** Where the apps run; what a tester can test on. */
export const PLATFORMS = ["web", "android", "ios"] as const;
export type Platform = (typeof PLATFORMS)[number];
export const PLATFORM_LABEL: Record<Platform, string> = { web: "Web", android: "Android", ios: "iOS" };

export interface WaitlistSubmission extends Person {
  email: string;
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
  /** Willing to answer questions while this is taking shape. */
  prototype: boolean;
}

/** A feature request: anonymous unless an email is given; the email is required once an entry asks for questions. */
export interface RequestSubmission extends Person {
  entries: RequestEntry[];
  email: string | null;
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

/** A list of ids out of a fixed set, deduplicated; absent or null is empty. */
function picks<T extends string>(v: unknown, field: string, all: readonly T[]): T[] {
  const raw = v === undefined || v === null ? [] : v;
  if (!Array.isArray(raw)) throw new SubmissionError(field, `${field} must be a list`);
  const out: T[] = [];
  for (const x of raw) {
    if (!all.includes(x as T)) throw new SubmissionError(field, `unknown ${field.replace(/s$/, "")}`);
    if (!out.includes(x as T)) out.push(x as T);
  }
  return out;
}

/** The optional email of a request: absent or blank is null; otherwise it must look like an address. */
function optionalEmail(v: unknown): string | null {
  const t = optionalText(v, "email", LIMITS.email);
  if (t !== null && !EMAIL.test(t)) throw new SubmissionError("email", "this does not look like an email address");
  return t;
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
  if (positions.length === 0) throw new SubmissionError("positions", "pick at least one position");
  const other_position = positions.includes("other") ? optionalText(b.other_position, "other_position", LIMITS.otherPosition) : null;
  if (positions.includes("other") && !other_position) throw new SubmissionError("other_position", "say what \"other\" is");
  const systems = picks(b.systems, "systems", SYSTEMS);
  if (systems.length === 0) throw new SubmissionError("systems", "pick at least one system");
  if (!(YEARS as readonly string[]).includes(b.years as string)) throw new SubmissionError("years", "pick your years in the industry");
  const languages = picks(b.languages, "languages", LANGUAGES);
  if (languages.length === 0) throw new SubmissionError("languages", "pick at least one language");
  const other_language = languages.includes("other") ? optionalText(b.other_language, "other_language", LIMITS.otherLanguage) : null;
  if (languages.includes("other") && !other_language) throw new SubmissionError("other_language", "which language?");
  return { systems, positions, other_position, years: b.years as YearsBand, languages, other_language };
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
  return { email, tester, updates, platforms: ps, ...person(v) };
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
    return { title: optionalText(e.title, `${f}.title`, LIMITS.title), text, prototype: e.prototype === true };
  });
  const email = optionalEmail(v.email);
  if (entries.some((e) => e.prototype) && !email) throw new SubmissionError("email", "leave an email, since you asked for questions");
  return { entries, email, ...person(v) };
}
