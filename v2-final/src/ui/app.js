// UI controller: wires DOM events to the pure rules and to render.js.
// `doc` is injected, so the same code runs in the browser and in Node tests.
import { CURRENT_TIME } from "../config.js";
import { ROOMS, getRoomById, listEquipment } from "../data/rooms.js";
import { filterRooms, parseAttendees } from "../rules/filters.js";
import { runCheck } from "../rules/check.js";
import {
  renderResult,
  renderEmptyState,
  renderFilterError,
  renderRoomOptions,
  renderRoomInfo,
  renderEquipmentCheckboxes,
} from "./render.js";

export const EMPTY_MESSAGE =
  "No rooms match your requirements. Try fewer attendees or remove some equipment.";

export function initApp(doc, rooms = ROOMS) {
  const el = {
    attendees: doc.getElementById("attendees"),
    equipment: doc.getElementById("equipment"),
    filterError: doc.getElementById("filter-error"),
    emptyState: doc.getElementById("empty-state"),
    room: doc.getElementById("room"),
    roomInfo: doc.getElementById("room-info"),
    start: doc.getElementById("start"),
    end: doc.getElementById("end"),
    check: doc.getElementById("check"),
    result: doc.getElementById("result"),
    currentTime: doc.getElementById("current-time"),
  };

  let visibleRooms = rooms;

  const checkboxes = renderEquipmentCheckboxes(doc, el.equipment, listEquipment(rooms), updateRooms);

  const selectedRoom = () => getRoomById(el.room.value, visibleRooms);

  function readCriteria() {
    const attendees = parseAttendees(el.attendees.value);
    if (!attendees.ok) return { error: attendees.message };
    return {
      attendees: attendees.value,
      equipment: checkboxes.filter((c) => c.checked).map((c) => c.value),
    };
  }

  /** F1, F2, F4: re-filter the room list whenever a requirement changes. */
  function updateRooms() {
    const criteria = readCriteria();
    if (criteria.error) {
      renderFilterError(el.filterError, criteria.error);
      return;
    }
    renderFilterError(el.filterError, "");

    const previousId = el.room.value;
    visibleRooms = filterRooms(rooms, criteria);
    const isEmpty = visibleRooms.length === 0;
    const keepSelection = visibleRooms.some((r) => r.id === previousId);
    const selectedId = keepSelection ? previousId : (visibleRooms[0]?.id ?? "");

    renderEmptyState(el.emptyState, isEmpty, EMPTY_MESSAGE);
    renderRoomOptions(doc, el.room, visibleRooms, selectedId);
    renderRoomInfo(el.roomInfo, selectedRoom());
    el.room.disabled = isEmpty;
    el.check.disabled = isEmpty;

    // The previously shown result belonged to a room that is no longer selected.
    if (!keepSelection) renderResult(el.result, null);
  }

  function checkSelectedRoom() {
    const room = selectedRoom();
    if (!room) return;
    renderResult(el.result, runCheck(room, el.start.value, el.end.value));
  }

  /** F5: switching room refreshes the result for the NEW room (or clears it). */
  function onRoomChange() {
    renderRoomInfo(el.roomInfo, selectedRoom());
    const hasTimes = el.start.value.trim() !== "" && el.end.value.trim() !== "";
    if (hasTimes) checkSelectedRoom();
    else renderResult(el.result, null);
  }

  el.attendees.addEventListener("input", updateRooms);
  el.room.addEventListener("change", onRoomChange);
  el.check.addEventListener("click", checkSelectedRoom);

  if (el.currentTime) {
    el.currentTime.textContent = `Current time (fixed, fictional): ${CURRENT_TIME}`;
  }
  updateRooms();

  return { updateRooms, checkSelectedRoom, onRoomChange };
}
