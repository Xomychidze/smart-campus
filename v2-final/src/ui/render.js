// UI presentation only: turns data into DOM updates. No business rules here.

/** One place for result feedback (v1 repeated this 8 times). `null` clears it. */
export function renderResult(el, result) {
  if (!result) {
    el.className = "";
    el.textContent = "";
    return;
  }
  el.className = result.kind; // "ok" | "busy" | "error"
  el.textContent = result.message;
}

/** F4: clear empty state. */
export function renderEmptyState(el, visible, message) {
  el.hidden = !visible;
  el.textContent = visible ? message : "";
}

export function renderFilterError(el, message) {
  el.hidden = message === "";
  el.textContent = message;
}

export function formatRoomLabel(room) {
  return `${room.name} (${room.capacity} seats${room.blocked ? ", blocked" : ""})`;
}

export function renderRoomOptions(doc, select, rooms, selectedId) {
  const options = rooms.map((room) => {
    const option = doc.createElement("option");
    option.value = room.id;
    option.textContent = formatRoomLabel(room);
    return option;
  });
  select.replaceChildren(...options);
  select.value = selectedId;
}

export function renderRoomInfo(el, room) {
  el.textContent = room
    ? `Capacity: ${room.capacity} | Equipment: ${room.equipment.join(", ") || "none"} | Status: ${room.blocked ? "blocked" : "open"}`
    : "";
}

/** Builds one checkbox per equipment item; returns the input elements. */
export function renderEquipmentCheckboxes(doc, container, items, onChange) {
  const rows = items.map((item) => {
    const label = doc.createElement("label");
    label.className = "check";
    const input = doc.createElement("input");
    input.type = "checkbox";
    input.value = item;
    input.addEventListener("change", onChange);
    const text = doc.createElement("span");
    text.textContent = item;
    label.append(input, text);
    return { label, input };
  });
  container.replaceChildren(...rows.map((r) => r.label));
  return rows.map((r) => r.input);
}
