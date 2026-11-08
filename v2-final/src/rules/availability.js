// AC3 + AC4: blocked room and booking overlap. Pure functions, no DOM.
// The room is always passed in, so a check can only ever see that room's bookings.
import { toMinutes } from "./validation.js";

/**
 * Returns the first booking of `room` that overlaps [startMin, endMin), or null.
 * Touching intervals (end === other start) do NOT overlap.
 */
export function findConflict(room, startMin, endMin) {
  return (
    room.bookings.find(
      (b) => startMin < toMinutes(b.end) && endMin > toMinutes(b.start)
    ) ?? null
  );
}

/**
 * Availability of `room` for a time range that is already validated.
 * Returns { status: "blocked" | "busy" | "available", conflict? }.
 * F3: a blocked room is never "available".
 */
export function checkRoomAvailability(room, startMin, endMin) {
  if (room.blocked) {
    return { status: "blocked" };
  }
  const conflict = findConflict(room, startMin, endMin);
  if (conflict) {
    return { status: "busy", conflict };
  }
  return { status: "available" };
}
