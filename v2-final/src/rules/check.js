// Orchestrator: validation (AC1, AC2) -> availability (AC3, AC4) -> result object.
// No DOM here, so the whole decision can be tested from Node.
import { validateTimeRange } from "./validation.js";
import { checkRoomAvailability } from "./availability.js";

/**
 * runCheck(room, start, end) -> { kind: "ok" | "busy" | "error", code, message }
 */
export function runCheck(room, start, end) {
  const v = validateTimeRange(start, end);
  if (!v.ok) {
    return { kind: "error", code: v.code, message: v.message };
  }

  const a = checkRoomAvailability(room, v.startMin, v.endMin);

  if (a.status === "blocked") {
    return { kind: "error", code: "BLOCKED", message: "This room is blocked and cannot be booked." };
  }
  if (a.status === "busy") {
    return {
      kind: "busy",
      code: "OVERLAP",
      message: `Room is busy: overlaps with booking ${a.conflict.start}-${a.conflict.end}.`,
    };
  }
  return {
    kind: "ok",
    code: "AVAILABLE",
    message: `Room ${room.name} is available from ${v.start} to ${v.end}.`,
  };
}
