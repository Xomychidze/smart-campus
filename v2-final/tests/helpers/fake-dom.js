// Minimal fake DOM so UI behaviour can be tested with plain `node --test` (no dependencies).

export class FakeElement {
  constructor(tag = "div") {
    this.tagName = tag;
    this.value = "";
    this.textContent = "";
    this.className = "";
    this.hidden = false;
    this.disabled = false;
    this.checked = false;
    this.type = "";
    this.children = [];
    this.listeners = {};
  }
  addEventListener(type, handler) {
    (this.listeners[type] ??= []).push(handler);
  }
  dispatch(type) {
    (this.listeners[type] ?? []).forEach((h) => h({ target: this }));
  }
  append(...nodes) {
    this.children.push(...nodes);
  }
  replaceChildren(...nodes) {
    this.children = [...nodes];
  }
}

const IDS = [
  "attendees", "equipment", "filter-error", "empty-state", "room",
  "room-info", "start", "end", "check", "result", "current-time",
];

export function createFakeDocument() {
  const els = Object.fromEntries(IDS.map((id) => [id, new FakeElement()]));
  return {
    els,
    getElementById: (id) => els[id] ?? null,
    createElement: (tag) => new FakeElement(tag),
  };
}
