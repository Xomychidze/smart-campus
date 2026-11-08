// F1 + F2: room filtering by capacity and equipment. Pure functions, no DOM.

/**
 * Parses the "attendees" input. Empty means "no capacity requirement" (0).
 * Returns { ok: true, value } or { ok: false, message }.
 */
export function parseAttendees(raw) {
  const s = String(raw ?? "").trim();
  if (s === "") {
    return { ok: true, value: 0 };
  }
  if (!/^\d+$/.test(s)) {
    return { ok: false, message: "Attendees must be a whole number (0 or more)." };
  }
  return { ok: true, value: Number(s) };
}

/** F1: capacity must be greater than or equal to requested attendees. */
export function matchesCapacity(room, attendees) {
  return room.capacity >= attendees;
}

/** F2: room must contain ALL required equipment items. */
export function matchesEquipment(room, required) {
  return required.every((item) => room.equipment.includes(item));
}

/**
 * Returns the rooms that satisfy every selected requirement.
 * Blocked rooms are not removed here: they stay visible but can never be
 * reported as available (F3 is enforced in rules/availability.js).
 */
export function filterRooms(rooms, { attendees = 0, equipment = [] } = {}) {
  return rooms.filter(
    (room) => matchesCapacity(room, attendees) && matchesEquipment(room, equipment)
  );
}
