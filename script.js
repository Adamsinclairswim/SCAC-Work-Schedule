const days = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday"
];

const shifts = [
  "Opening",
  "Morning",
  "Midday",
  "Afternoon",
  "Closing"
];

const availabilityGrid = document.getElementById("availabilityGrid");
const submitBtn = document.getElementById("submitBtn");
const message = document.getElementById("message");

function buildAvailabilityGrid() {
  days.forEach(day => {
    const dayBox = document.createElement("div");
    dayBox.classList.add("day-box");

    const title = document.createElement("h3");
    title.textContent = day;
    dayBox.appendChild(title);

    const row = document.createElement("div");
    row.classList.add("checkbox-grid");

    shifts.forEach(shift => {
      const label = document.createElement("label");
      label.innerHTML = `
        <input type="checkbox" class="availability" data-day="${day}" value="${shift}" />
        ${shift}
      `;
      row.appendChild(label);
    });

    dayBox.appendChild(row);
    availabilityGrid.appendChild(dayBox);
  });
}

function getSelectedRoles() {
  return Array.from(document.querySelectorAll(".role:checked")).map(role => role.value);
}

function getAvailability() {
  const availability = {};

  days.forEach(day => {
    availability[day] = [];
  });

  document.querySelectorAll(".availability:checked").forEach(box => {
    const day = box.dataset.day;
    const shift = box.value;
    availability[day].push(shift);
  });

  return availability;
}

function getDateRange(start, end) {
  const dates = [];
  const current = new Date(start);
  const final = new Date(end);

  while (current <= final) {
    dates.push(current.toISOString().split("T")[0]);
    current.setDate(current.getDate() + 1);
  }

  return dates;
}

function submitAvailability() {
  const name = document.getElementById("employeeName").value.trim();
  const roles = getSelectedRoles();
  const availability = getAvailability();

  const timeOffStart = document.getElementById("timeOffStart").value;
  const timeOffEnd = document.getElementById("timeOffEnd").value;
  const timeOffReason = document.getElementById("timeOffReason").value.trim();

  if (!name) {
    message.textContent = "Please enter your name.";
    return;
  }

  if (roles.length === 0) {
    message.textContent = "Please select at least one role.";
    return;
  }

  let employees = JSON.parse(localStorage.getItem("employees")) || [];

  const existingIndex = employees.findIndex(emp => emp.name.toLowerCase() === name.toLowerCase());

  const employeeData = {
    name,
    roles,
    availability
  };

  if (existingIndex >= 0) {
    employees[existingIndex] = employeeData;
  } else {
    employees.push(employeeData);
  }

  localStorage.setItem("employees", JSON.stringify(employees));

  if (timeOffStart && timeOffEnd) {
    let timeOffRequests = JSON.parse(localStorage.getItem("timeOffRequests")) || [];

    timeOffRequests.push({
      name,
      start: timeOffStart,
      end: timeOffEnd,
      dates: getDateRange(timeOffStart, timeOffEnd),
      reason: timeOffReason || "No reason given"
    });

    localStorage.setItem("timeOffRequests", JSON.stringify(timeOffRequests));
  }

  message.textContent = "Submitted successfully!";
}

buildAvailabilityGrid();
submitBtn.addEventListener("click", submitAvailability);