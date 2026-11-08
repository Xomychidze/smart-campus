// Room catalog: fictional data only. Each room has its own bookings.
// AC5: all data is deep-frozen, so nothing can mutate it at runtime.

function deepFreeze(value) {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);
    Object.values(value).forEach(deepFreeze);
  }
  return value;
}

export const ROOMS = deepFreeze([
  {
    id: "R101",
    name: "Alpha Lab",
    capacity: 30,
    equipment: ["projector", "whiteboard"],
    blocked: false,
    bookings: [
      { start: "09:00", end: "10:00" },
      { start: "13:00", end: "14:30" },
      { start: "16:00", end: "17:00" },
    ],
  },
  {
    id: "R102",
    name: "Beta Studio",
    capacity: 12,
    equipment: ["whiteboard"],
    blocked: false,
    bookings: [
      { start: "10:00", end: "11:30" },
      { start: "15:00", end: "16:00" },
    ],
  },
  {
    id: "R201",
    name: "Gamma Hall",
    capacity: 80,
    equipment: ["projector", "microphone", "whiteboard"],
    blocked: false,
    bookings: [{ start: "11:00", end: "12:00" }],
  },
  {
    id: "R202",
    name: "Delta Room",
    capacity: 8,
    equipment: ["projector"],
    blocked: true,
    bookings: [],
  },
  {
    id: "R301",
    name: "Epsilon Lab",
    capacity: 20,
    equipment: ["computers", "projector"],
    blocked: false,
    bookings: [
      { start: "09:30", end: "11:00" },
      { start: "14:00", end: "16:00" },
    ],
  },
]);

export function getRoomById(id, rooms = ROOMS) {
  return rooms.find((r) => r.id === id) ?? null;
}

/** All equipment items offered by the catalog (sorted, unique) for the filter UI. */
export function listEquipment(rooms = ROOMS) {
  return [...new Set(rooms.flatMap((r) => r.equipment))].sort();
}
