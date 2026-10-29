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

export interface WaitlistSubmission extends Person {
  email: string;
  nickname: string | null;
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
  /** How to reach the person, in their words (an email, a handle, nothing); null when not given. */
  contact: string | null;
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
  return { email, nickname: optionalText(v.nickname, "nickname", LIMITS.nickname), ...person(v) };
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
  return { entries, contact: optionalText(v.contact, "contact", LIMITS.contact), ...person(v) };
}
