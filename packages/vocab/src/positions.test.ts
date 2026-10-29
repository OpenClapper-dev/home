import assert from "node:assert/strict";
import { test } from "node:test";
import { DEPARTMENTS, departmentsOf, POSITIONS, searchPositions } from "./positions.ts";

test("ids are unique and every department is known", () => {
  const ids = new Set<string>();
  for (const p of POSITIONS) {
    assert.ok(!ids.has(p.id), `duplicate ${p.id}`);
    ids.add(p.id);
    assert.ok(DEPARTMENTS.includes(p.department), `${p.id}: ${p.department}`);
  }
});

test("search hits labels, German aliases and departments, ignoring accents and case", () => {
  assert.deepEqual(searchPositions("aufnahmeleit").map((p) => p.id), ["location-manager", "second-ad", "third-ad"]);
  assert.deepEqual(searchPositions("Kostum").map((p) => p.id), ["costume-designer", "wardrobe"]);
  assert.ok(searchPositions("grip").every((p) => p.department === "grip"));
  assert.equal(searchPositions("").length, POSITIONS.length);
});

test("departments follow the canonical order without duplicates", () => {
  assert.deepEqual(departmentsOf(["gaffer", "dp", "electrician", "nope"]), ["camera", "lighting"]);
});
