import assert from "node:assert/strict";
import { test } from "node:test";
import { parseRequest, parseWaitlist, SubmissionError } from "./submissions.ts";

const field = (fn: () => unknown) => { try { fn(); } catch (e) { return (e as SubmissionError).field; } return null; };

test("waitlist: email and a platform are required for a tester; the Call Sheet alone needs only the email", () => {
  assert.deepEqual(parseWaitlist({ email: " Me@Example.org ", platforms: ["web"] }), { email: "Me@Example.org", nickname: null, tester: true, updates: false, platforms: ["web"], system: null, positions: [], other_position: null, years: null });
  assert.equal(parseWaitlist({ email: "a@b.co", platforms: ["android"], system: "german" }).system, "german");
  assert.equal(field(() => parseWaitlist({ email: "a@b.co", platforms: ["web"], system: "martian" })), "system");
  assert.equal(field(() => parseWaitlist({})), "email");
  assert.equal(field(() => parseWaitlist({ email: "nope" })), "email");
  assert.equal(field(() => parseWaitlist({ email: "a@b.co" })), "platforms");
  assert.equal(field(() => parseWaitlist({ email: "a@b.co", platforms: ["vhs"] })), "platforms");
  assert.equal(field(() => parseWaitlist({ email: "a@b.co", tester: false })), "tester");
  const only = parseWaitlist({ email: "a@b.co", tester: false, updates: true });
  assert.deepEqual([only.tester, only.updates, only.platforms], [false, true, []]);
  assert.equal(field(() => parseWaitlist({ email: "a@b.co", platforms: ["web"], years: 99 })), "years");
  assert.equal(field(() => parseWaitlist({ email: "a@b.co", platforms: ["web"], positions: ["astronaut"] })), "positions");
});

test("waitlist: optional fields are trimmed, bounded and deduplicated", () => {
  const w = parseWaitlist({ email: "a@b.co", nickname: "  ", platforms: ["web", "web", "ios"], updates: true, positions: ["dp", "dp", "other"], other_position: " Drone pilot ", years: "12" });
  assert.equal(w.nickname, null);
  assert.deepEqual(w.platforms, ["web", "ios"]);
  assert.equal(w.updates, true);
  assert.deepEqual(w.positions, ["dp", "other"]);
  assert.equal(w.other_position, "Drone pilot");
  assert.equal(w.years, 12);
  assert.equal(parseWaitlist({ email: "a@b.co", platforms: ["web"], positions: ["dp"], other_position: "x" }).other_position, null);
});

test("request: at least one entry with text; flags default to false", () => {
  assert.equal(field(() => parseRequest({ entries: [] })), "entries");
  assert.equal(field(() => parseRequest({ entries: [{ title: "t" }] })), "entries.0.text");
  const r = parseRequest({ entries: [{ text: " Call sheets in the phone app " }, { title: "", text: "x", prototype: "yes" }] });
  assert.deepEqual(r.entries, [{ title: null, text: "Call sheets in the phone app", test: false, prototype: false }, { title: null, text: "x", test: false, prototype: false }]);
  assert.deepEqual([r.contact, r.platforms], [null, []]);
});

test("request: asking to test needs a contact and a platform; asking to be contacted needs a contact", () => {
  assert.equal(field(() => parseRequest({ entries: [{ text: "x", test: true }], platforms: ["web"] })), "contact");
  assert.equal(field(() => parseRequest({ entries: [{ text: "x", test: true }], contact: "@me" })), "platforms");
  assert.equal(field(() => parseRequest({ entries: [{ text: "x", prototype: true }] })), "contact");
  const r = parseRequest({ entries: [{ text: "x", test: true }], contact: "@me on instagram", platforms: ["web", "android"] });
  assert.deepEqual([r.contact, r.platforms, r.entries[0].test], ["@me on instagram", ["web", "android"], true]);
  assert.equal(parseRequest({ entries: [{ text: "x", prototype: true }], contact: "@me" }).platforms.length, 0);
});
