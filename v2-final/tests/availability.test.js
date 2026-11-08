import { test } from "node:test";
import assert from "node:assert/strict";
import { checkRoomAvailability, findConflict } from "../src/rules/availability.js";
import { runCheck } from "../src/rules/check.js";
import { toMinutes } from "../src/rules/validation.js";

const m = toMinutes;

function room(overrides = {}) {
  return {
    id: "T1",
    name: "Test Room",
    blocked: false,
    bookings: [
      { start: "09:00", end: "10:00" },
      { start: "13:00", end: "14:30" },
    ],
    ...overrides,
  };
}

test("AC3: blocked room is reported as blocked, never available", () => {
  const r = checkRoomAvailability(room({ blocked: true }), m("11:00"), m("12:00"));
  assert.equal(r.status, "blocked");
});

test("AC3: blocked room wins even when it has no bookings", () => {
  const r = checkRoomAvailability(room({ blocked: true, bookings: [] }), m("11:00"), m("12:00"));
  assert.equal(r.status, "blocked");
});

test("AC4: overlapping interval is busy and names the conflicting booking", () => {
  const r = checkRoomAvailability(room(), m("09:30"), m("10:30"));
  assert.equal(r.status, "busy");
  assert.deepEqual(r.conflict, { start: "09:00", end: "10:00" });
});

test("AC4 boundary: request that ends exactly when a booking starts is free (touching)", () => {
  assert.equal(findConflict(room(), m("12:00"), m("13:00")), null);
});

test("AC4 boundary: request that starts exactly when a booking ends is free (touching)", () => {
  assert.equal(findConflict(room(), m("10:00"), m("11:00")), null);
});

test("AC4 boundary: one minute of overlap is busy", () => {
  assert.equal(checkRoomAvailability(room(), m("10:00"), m("13:01")).status, "busy");
});

test("AC4: request fully inside an existing booking is busy", () => {
  assert.equal(checkRoomAvailability(room(), m("13:30"), m("14:00")).status, "busy");
});

test("runCheck: free slot returns ok with room name in message", () => {
  const r = runCheck(room(), "11:00", "12:00");
  assert.equal(r.kind, "ok");
  assert.match(r.message, /Test Room is available from 11:00 to 12:00/);
});

test("runCheck: validation errors come before availability (blocked room + 121 min -> TOO_LONG)", () => {
  const r = runCheck(room({ blocked: true }), "10:00", "12:01");
  assert.equal(r.kind, "error");
  assert.equal(r.code, "TOO_LONG");
});

test("runCheck: blocked room returns BLOCKED error", () => {
  const r = runCheck(room({ blocked: true }), "11:00", "12:00");
  assert.equal(r.kind, "error");
  assert.equal(r.code, "BLOCKED");
});
