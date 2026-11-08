import { test } from "node:test";
import assert from "node:assert/strict";
import { ROOMS, getRoomById, listEquipment } from "../src/data/rooms.js";
import { runCheck } from "../src/rules/check.js";

test("catalog has at least four rooms with all required fields", () => {
  assert.ok(ROOMS.length >= 4);
  for (const r of ROOMS) {
    assert.equal(typeof r.id, "string");
    assert.equal(typeof r.name, "string");
    assert.equal(typeof r.capacity, "number");
    assert.ok(Array.isArray(r.equipment));
    assert.equal(typeof r.blocked, "boolean");
    assert.ok(Array.isArray(r.bookings));
  }
  assert.equal(new Set(ROOMS.map((r) => r.id)).size, ROOMS.length, "room ids must be unique");
});

test("catalog contains at least one blocked room", () => {
  assert.ok(ROOMS.some((r) => r.blocked));
});

test("AC5: booking data is immutable (assignment and push throw)", () => {
  const room = getRoomById("R101");
  assert.throws(() => { room.bookings[0].start = "00:00"; }, TypeError);
  assert.throws(() => { room.bookings.push({ start: "18:00", end: "19:00" }); }, TypeError);
  assert.throws(() => { room.blocked = true; }, TypeError);
  assert.throws(() => { room.equipment.push("laser"); }, TypeError);
});

test("AC5: running checks does not change room data", () => {
  const before = JSON.stringify(ROOMS);
  runCheck(getRoomById("R101"), "09:30", "10:30");
  runCheck(getRoomById("R101"), "11:00", "12:00");
  runCheck(getRoomById("R202"), "11:00", "12:00");
  assert.equal(JSON.stringify(ROOMS), before);
});

test("listEquipment returns sorted unique items from the catalog", () => {
  assert.deepEqual(listEquipment(), ["computers", "microphone", "projector", "whiteboard"]);
});

test("each room uses its own bookings: same slot, different result per room", () => {
  // 13:00-14:00 is booked in Alpha Lab (R101) but free in Beta Studio (R102)
  assert.equal(runCheck(getRoomById("R101"), "13:00", "14:00").kind, "busy");
  assert.equal(runCheck(getRoomById("R102"), "13:00", "14:00").kind, "ok");
  // 11:00-12:00 is booked in Gamma Hall (R201) but free in Alpha Lab (R101)
  assert.equal(runCheck(getRoomById("R201"), "11:00", "12:00").kind, "busy");
  assert.equal(runCheck(getRoomById("R101"), "11:00", "12:00").kind, "ok");
});
