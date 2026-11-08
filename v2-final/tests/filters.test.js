import { test } from "node:test";
import assert from "node:assert/strict";
import { ROOMS, getRoomById } from "../src/data/rooms.js";
import { filterRooms, parseAttendees, matchesCapacity } from "../src/rules/filters.js";
import { runCheck } from "../src/rules/check.js";

const ids = (rooms) => rooms.map((r) => r.id);

test("F1 boundary: exact capacity passes, one more attendee fails", () => {
  // Epsilon Lab (R301) has capacity 20
  assert.ok(ids(filterRooms(ROOMS, { attendees: 20 })).includes("R301"));
  assert.ok(!ids(filterRooms(ROOMS, { attendees: 21 })).includes("R301"));
  assert.equal(matchesCapacity({ capacity: 20 }, 20), true);
  assert.equal(matchesCapacity({ capacity: 20 }, 21), false);
});

test("F1: insufficient capacity excludes small rooms", () => {
  assert.deepEqual(ids(filterRooms(ROOMS, { attendees: 25 })), ["R101", "R201"]);
});

test("F2: room must have ALL selected equipment", () => {
  assert.deepEqual(ids(filterRooms(ROOMS, { equipment: ["projector", "whiteboard"] })), ["R101", "R201"]);
});

test("F2: missing a single required item excludes the room", () => {
  // only Gamma Hall has both projector and microphone
  assert.deepEqual(ids(filterRooms(ROOMS, { equipment: ["projector", "microphone"] })), ["R201"]);
});

test("F1 + F2 combined", () => {
  assert.deepEqual(
    ids(filterRooms(ROOMS, { attendees: 15, equipment: ["projector"] })),
    ["R101", "R201", "R301"]
  );
});

test("no criteria returns the whole catalog", () => {
  assert.equal(filterRooms(ROOMS, {}).length, ROOMS.length);
});

test("F3: a blocked room can match filters but is never reported as available", () => {
  const matches = filterRooms(ROOMS, { attendees: 5, equipment: ["projector"] });
  const delta = matches.find((r) => r.id === "R202");
  assert.ok(delta, "blocked room still matches the filter");
  for (const [s, e] of [["11:00", "12:00"], ["08:00", "08:30"], ["16:00", "17:00"]]) {
    assert.notEqual(runCheck(delta, s, e).kind, "ok");
  }
});

test("F4: impossible criteria give an empty list", () => {
  assert.deepEqual(filterRooms(ROOMS, { attendees: 100 }), []);
  assert.deepEqual(filterRooms(ROOMS, { equipment: ["microphone", "computers"] }), []);
});

test("parseAttendees accepts empty and whole numbers, rejects the rest", () => {
  assert.deepEqual(parseAttendees(""), { ok: true, value: 0 });
  assert.deepEqual(parseAttendees(" 12 "), { ok: true, value: 12 });
  for (const bad of ["-3", "2.5", "abc", "1e3"]) {
    assert.equal(parseAttendees(bad).ok, false, `"${bad}" must be rejected`);
  }
});

test("getRoomById returns null for unknown ids", () => {
  assert.equal(getRoomById("NOPE"), null);
});
