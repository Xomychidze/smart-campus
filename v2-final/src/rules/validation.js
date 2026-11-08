// AC1 + AC2: time-range validation. Pure functions, no DOM.
import { MAX_DURATION_MINUTES, TIME_PATTERN } from "../config.js";

/** "HH:MM" -> minutes since midnight. */
export function toMinutes(time) {
  const [h, m] = time.split(":");
  return Number(h) * 60 + Number(m);
}

function fail(code, message) {
  return { ok: false, code, message };
}

/**
 * Validates a requested time range.
 * Returns { ok: true, start, end, startMin, endMin }
 *      or { ok: false, code, message }.
 * Single place for AC1 and AC2 (v1 had them in two places).
 */
export function validateTimeRange(start, end) {
  const s = String(start ?? "").trim();
  const e = String(end ?? "").trim();

  if (s === "" || e === "") {
    return fail("EMPTY", "Please enter both start and end time.");
  }
  if (!TIME_PATTERN.test(s) || !TIME_PATTERN.test(e)) {
    return fail("FORMAT", "Please enter time in HH:MM format (00:00 - 23:59).");
  }

  const startMin = toMinutes(s);
  const endMin = toMinutes(e);

  if (startMin >= endMin) {
    return fail("ORDER", "End time must be later than start time.");
  }
  if (endMin - startMin > MAX_DURATION_MINUTES) {
    return fail("TOO_LONG", `Booking cannot be longer than ${MAX_DURATION_MINUTES} minutes.`);
  }
  return { ok: true, start: s, end: e, startMin, endMin };
}
