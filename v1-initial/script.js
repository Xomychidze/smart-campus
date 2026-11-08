// Smart Campus Room Availability Checker - v1 (monolithic prototype, one room)

var room = {
  id: "R101",
  name: "Alpha Lab",
  blocked: false,
  bookings: [
    { start: "09:00", end: "10:00" },
    { start: "13:00", end: "14:30" },
    { start: "16:00", end: "17:00" }
  ]
};
Object.freeze(room.bookings);
room.bookings.forEach(function (b) { Object.freeze(b); });

var NOW = "09:00";

function toMinutes(t) {
  var parts = t.split(":");
  return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
}

function checkAvailability() {
  var s = document.getElementById("start").value.trim();
  var e = document.getElementById("end").value.trim();
  var box = document.getElementById("result");

  // --- AC1: valid time ---
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(s) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(e)) {
    box.className = "error";
    box.textContent = "Please enter time in HH:MM format (00:00 - 23:59).";
    return;
  }
  var sm = toMinutes(s);
  var em = toMinutes(e);
  if (sm >= em) {
    box.className = "error";
    box.textContent = "End time must be later than start time.";
    return;
  }

  // --- AC2: maximum 120 minutes ---
  if (em - sm > 120) {
    box.className = "error";
    box.textContent = "Booking cannot be longer than 120 minutes.";
    return;
  }

  // --- AC3: blocked room ---
  if (room.blocked) {
    box.className = "error";
    box.textContent = "This room is blocked and cannot be booked.";
    return;
  }

  // --- AC4: overlap (touching boundaries are allowed) ---
  for (var i = 0; i < room.bookings.length; i++) {
    var bs = toMinutes(room.bookings[i].start);
    var be = toMinutes(room.bookings[i].end);
    if (sm < be && em > bs) {
      box.className = "busy";
      box.textContent = "Room is busy: overlaps with booking " + room.bookings[i].start + "-" + room.bookings[i].end + ".";
      return;
    }
  }

  box.className = "ok";
  box.textContent = "Room " + room.name + " is available from " + s + " to " + e + ".";
}

document.getElementById("check").addEventListener("click", function () {
  var s = document.getElementById("start").value.trim();
  var e = document.getElementById("end").value.trim();
  var box = document.getElementById("result");

  // validation duplicated before calling the main function
  if (s === "" || e === "") {
    box.className = "error";
    box.textContent = "Please enter both start and end time.";
    return;
  }
  var sm = toMinutes(s);
  var em = toMinutes(e);
  if (!isNaN(sm) && !isNaN(em) && em - sm > 120) {
    box.className = "error";
    box.textContent = "Booking cannot be longer than 120 minutes.";
    return;
  }

  checkAvailability();
});
