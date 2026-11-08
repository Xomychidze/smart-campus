import { test } from "node:test";
import assert from "node:assert/strict";
import { initApp, EMPTY_MESSAGE } from "../src/ui/app.js";
import { createFakeDocument } from "./helpers/fake-dom.js";

function setup() {
  const doc = createFakeDocument();
  const api = initApp(doc);
  const { els } = doc;
  const box = (name) => els.equipment.children.map((l) => l.children[0]).find((c) => c.value === name);
  const roomIds = () => els.room.children.map((o) => o.value);
  const type = (id, value) => { els[id].value = value; };
  return { doc, els, api, box, roomIds, type };
}

test("integration: initial state lists all rooms and selects the first", () => {
  const { els, roomIds } = setup();
  assert.deepEqual(roomIds(), ["R101", "R102", "R201", "R202", "R301"]);
  assert.equal(els.room.value, "R101");
  assert.equal(els["empty-state"].hidden, true);
  assert.equal(els.check.disabled, false);
});

test("integration: filter -> select room -> check time -> result (free slot)", () => {
  const { els, box, roomIds, type } = setup();

  // filter: 15 attendees + projector -> R101, R201, R301 (R202 has capacity 8, R102 has no projector)
  type("attendees", "15");
  els.attendees.dispatch("input");
  box("projector").checked = true;
  box("projector").dispatch("change");
  assert.deepEqual(roomIds(), ["R101", "R201", "R301"]);

  // choose Epsilon Lab and check a free slot
  els.room.value = "R301";
  els.room.dispatch("change");
  type("start", "12:00");
  type("end", "13:00");
  els.check.dispatch("click");

  assert.equal(els.result.className, "ok");
  assert.match(els.result.textContent, /Epsilon Lab is available from 12:00 to 13:00/);
});

test("integration: busy slot and boundary touching through the UI", () => {
  const { els, type } = setup(); // R101 selected, booking 09:00-10:00
  type("start", "09:30");
  type("end", "10:30");
  els.check.dispatch("click");
  assert.equal(els.result.className, "busy");
  assert.match(els.result.textContent, /09:00-10:00/);

  type("start", "10:00");
  type("end", "11:00");
  els.check.dispatch("click");
  assert.equal(els.result.className, "ok");
});

test("integration: invalid time shows a clear error (AC1/AC2/AC6)", () => {
  const { els, type } = setup();
  type("start", "10:00");
  type("end", "12:01");
  els.check.dispatch("click");
  assert.equal(els.result.className, "error");
  assert.match(els.result.textContent, /120 minutes/);
});

test("F4 integration: impossible requirements show the empty state and disable checking", () => {
  const { els, type, roomIds } = setup();
  type("attendees", "500");
  els.attendees.dispatch("input");
  assert.deepEqual(roomIds(), []);
  assert.equal(els["empty-state"].hidden, false);
  assert.equal(els["empty-state"].textContent, EMPTY_MESSAGE);
  assert.equal(els.room.disabled, true);
  assert.equal(els.check.disabled, true);

  // relaxing the requirement restores the list
  type("attendees", "5");
  els.attendees.dispatch("input");
  assert.equal(els["empty-state"].hidden, true);
  assert.equal(els.check.disabled, false);
  assert.ok(roomIds().length > 0);
});

test("F5 integration: changing the room re-checks the same time for the NEW room", () => {
  const { els, type } = setup();
  type("start", "13:00");
  type("end", "14:00");
  els.check.dispatch("click");
  assert.equal(els.result.className, "busy"); // Alpha Lab is booked 13:00-14:30

  els.room.value = "R102"; // Beta Studio is free at 13:00
  els.room.dispatch("change");
  assert.equal(els.result.className, "ok");
  assert.match(els.result.textContent, /Beta Studio/);
});

test("F5 integration: blocked room switch shows blocked error, not a stale 'available'", () => {
  const { els, type } = setup();
  type("start", "11:00");
  type("end", "12:00");
  els.check.dispatch("click");
  assert.equal(els.result.className, "ok");

  els.room.value = "R202"; // Delta Room is blocked
  els.room.dispatch("change");
  assert.equal(els.result.className, "error");
  assert.match(els.result.textContent, /blocked/);
});

test("F5 integration: result is cleared when the filter removes the selected room", () => {
  const { els, type } = setup();
  type("start", "11:00");
  type("end", "12:00");
  els.check.dispatch("click");
  assert.equal(els.result.className, "ok"); // for R101

  type("attendees", "50"); // only Gamma Hall remains
  els.attendees.dispatch("input");
  assert.equal(els.room.value, "R201");
  assert.equal(els.result.className, "");
  assert.equal(els.result.textContent, "");
});

test("integration: invalid attendees value shows a filter error and keeps the old list", () => {
  const { els, type, roomIds } = setup();
  type("attendees", "abc");
  els.attendees.dispatch("input");
  assert.equal(els["filter-error"].hidden, false);
  assert.equal(roomIds().length, 5);
});
