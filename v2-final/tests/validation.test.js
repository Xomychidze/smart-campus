import { test } from "node:test";
import assert from "node:assert/strict";
import { validateTimeRange, toMinutes } from "../src/rules/validation.js";

test("toMinutes converts HH:MM to minutes", () => {
  assert.equal(toMinutes("00:00"), 0);
  assert.equal(toMinutes("09:30"), 570);
  assert.equal(toMinutes("23:59"), 1439);
});

test("AC1: empty input is rejected", () => {
  const r = validateTimeRange("", "");
  assert.equal(r.ok, false);
  assert.equal(r.code, "EMPTY");
});

test("AC1: wrong format is rejected", () => {
  for (const bad of ["9am", "25:00", "10:60", "1000", "9:00"]) {
    const r = validateTimeRange(bad, "11:00");
    assert.equal(r.ok, false, `expected "${bad}" to be rejected`);
    assert.equal(r.code, "FORMAT");
  }
});

test("AC1: start equal to end or after end is rejected", () => {
  assert.equal(validateTimeRange("10:00", "10:00").code, "ORDER");
  assert.equal(validateTimeRange("11:00", "10:00").code, "ORDER");
});

test("AC2 boundary: exactly 120 minutes is accepted", () => {
  const r = validateTimeRange("10:00", "12:00");
  assert.equal(r.ok, true);
  assert.equal(r.endMin - r.startMin, 120);
});

test("AC2 boundary: 121 minutes is rejected", () => {
  const r = validateTimeRange("10:00", "12:01");
  assert.equal(r.ok, false);
  assert.equal(r.code, "TOO_LONG");
});
