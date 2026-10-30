import assert from "node:assert/strict";
import { test } from "node:test";
import { parseRequest, parseWaitlist, SubmissionError } from "./submissions.ts";

const field = (fn: () => unknown) => { try { fn(); } catch (e) { return (e as SubmissionError).field; } return null; };
/** A complete about-you block, as both forms send it. */
const who = { systems: ["german"], positions: ["dp"], years: "3-6", languages: ["german", "english"] };

test("waitlist: email, the about-you block and, for a tester, a platform are required", () => {
  assert.deepEqual(parseWaitlist({ email: " Me@Example.org ", platforms: ["web"], ...who }), { email: "Me@Example.org", tester: true, updates: false, platforms: ["web"], systems: ["german"], positions: ["dp"], other_position: null, years: "3-6", languages: ["german", "english"], other_language: null });
  assert.equal(field(() => parseWaitlist({})), "email");
  assert.equal(field(() => parseWaitlist({ email: "nope" })), "email");
  assert.equal(field(() => parseWaitlist({ email: "a@b.co", ...who })), "platforms");
  assert.equal(field(() => parseWaitlist({ email: "a@b.co", platforms: ["vhs"], ...who })), "platforms");
  assert.equal(field(() => parseWaitlist({ email: "a@b.co", tester: false, ...who })), "tester");
  const only = parseWaitlist({ email: "a@b.co", tester: false, updates: true, ...who });
  assert.deepEqual([only.tester, only.updates, only.platforms], [false, true, []]);
});

test("about you: systems, positions, years and languages are required; 'other' needs its text; lists are deduplicated", () => {
  const base = { email: "a@b.co", platforms: ["web"] };
  assert.equal(field(() => parseWaitlist({ ...base, ...who, systems: [] })), "systems");
  assert.equal(field(() => parseWaitlist({ ...base, ...who, systems: ["martian"] })), "systems");
  assert.equal(field(() => parseWaitlist({ ...base, ...who, positions: [] })), "positions");
  assert.equal(field(() => parseWaitlist({ ...base, ...who, positions: ["astronaut"] })), "positions");
  assert.equal(field(() => parseWaitlist({ ...base, ...who, positions: ["dp", "other"] })), "other_position");
  assert.equal(field(() => parseWaitlist({ ...base, ...who, years: 12 })), "years");
  assert.equal(field(() => parseWaitlist({ ...base, ...who, years: undefined })), "years");
  assert.equal(field(() => parseWaitlist({ ...base, ...who, languages: [] })), "languages");
  assert.equal(field(() => parseWaitlist({ ...base, ...who, languages: ["other"] })), "other_language");
  const w = parseWaitlist({ ...base, systems: ["us", "us", "other"], positions: ["dp", "dp", "other"], other_position: " Drone pilot ", years: "12+", languages: ["other", "other"], other_language: " French " });
  assert.deepEqual([w.systems, w.positions, w.other_position, w.years, w.languages, w.other_language], [["us", "other"], ["dp", "other"], "Drone pilot", "12+", ["other"], "French"]);
  assert.equal(parseWaitlist({ ...base, ...who, other_position: "x", other_language: "y" }).other_position, null);
});

test("request: at least one entry with text; the about-you block is required; the email is optional", () => {
  assert.equal(field(() => parseRequest({ entries: [], ...who })), "entries");
  assert.equal(field(() => parseRequest({ entries: [{ title: "t" }], ...who })), "entries.0.text");
  assert.equal(field(() => parseRequest({ entries: [{ text: "x" }], ...who, systems: [] })), "systems");
  const r = parseRequest({ entries: [{ text: " Call sheets in the phone app " }, { title: "", text: "x", prototype: "yes" }], ...who });
  assert.deepEqual(r.entries, [{ title: null, text: "Call sheets in the phone app", prototype: false }, { title: null, text: "x", prototype: false }]);
  assert.equal(r.email, null);
  assert.equal(field(() => parseRequest({ entries: [{ text: "x" }], email: "nope", ...who })), "email");
  assert.equal(parseRequest({ entries: [{ text: "x" }], email: " a@b.co ", ...who }).email, "a@b.co");
});

test("request: asking for questions needs an email", () => {
  assert.equal(field(() => parseRequest({ entries: [{ text: "x", prototype: true }], ...who })), "email");
  const r = parseRequest({ entries: [{ text: "x", prototype: true }], email: "a@b.co", ...who });
  assert.deepEqual([r.email, r.entries[0].prototype], ["a@b.co", true]);
});
