import assert from "node:assert/strict";
import { test } from "node:test";
import { parseRequest, parseWaitlist, SubmissionError } from "./submissions.ts";

const field = (fn: () => unknown) => { try { fn(); } catch (e) { return (e as SubmissionError).field; } return null; };

test("waitlist: the email is the only required field", () => {
  assert.deepEqual(parseWaitlist({ email: " Me@Example.org " }), { email: "Me@Example.org", nickname: null, positions: [], other_position: null, years: null });
  assert.equal(field(() => parseWaitlist({})), "email");
  assert.equal(field(() => parseWaitlist({ email: "nope" })), "email");
  assert.equal(field(() => parseWaitlist({ email: "a@b.co", years: 99 })), "years");
  assert.equal(field(() => parseWaitlist({ email: "a@b.co", positions: ["astronaut"] })), "positions");
});

test("waitlist: optional fields are trimmed, bounded and deduplicated", () => {
  const w = parseWaitlist({ email: "a@b.co", nickname: "  ", positions: ["dp", "dp", "other"], other_position: " Drone pilot ", years: "12" });
  assert.equal(w.nickname, null);
  assert.deepEqual(w.positions, ["dp", "other"]);
  assert.equal(w.other_position, "Drone pilot");
  assert.equal(w.years, 12);
  assert.equal(parseWaitlist({ email: "a@b.co", positions: ["dp"], other_position: "x" }).other_position, null);
});

test("request: at least one entry with text; flags default to false", () => {
  assert.equal(field(() => parseRequest({ entries: [] })), "entries");
  assert.equal(field(() => parseRequest({ entries: [{ title: "t" }] })), "entries.0.text");
  const r = parseRequest({ entries: [{ text: " Call sheets in the phone app ", test: true }, { title: "", text: "x", prototype: "yes" }], contact: "@me on instagram" });
  assert.deepEqual(r.entries, [{ title: null, text: "Call sheets in the phone app", test: true, prototype: false }, { title: null, text: "x", test: false, prototype: false }]);
  assert.equal(r.contact, "@me on instagram");
});
