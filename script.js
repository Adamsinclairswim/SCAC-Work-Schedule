const hoursByDay = {
  Monday: ["4AM-8AM", "5AM-9AM", "6AM-10AM", "8AM-12PM", "9AM-1PM", "10AM-3PM", "11AM-3PM", "12PM-4PM", "2PM-6PM", "3PM-7PM", "4PM-8PM", "6PM-10PM", "7PM-11PM"],
  Tuesday: ["4AM-8AM", "5AM-9AM", "6AM-10AM", "8AM-12PM", "9AM-1PM", "10AM-3PM", "11AM-3PM", "12PM-4PM", "2PM-6PM", "3PM-7PM", "4PM-8PM", "6PM-10PM", "7PM-11PM"],
  Wednesday: ["4AM-8AM", "5AM-9AM", "6AM-10AM", "8AM-12PM", "9AM-1PM", "10AM-3PM", "11AM-3PM", "12PM-4PM", "2PM-6PM", "3PM-7PM", "4PM-8PM", "6PM-10PM", "7PM-11PM"],
  Thursday: ["4AM-8AM", "5AM-9AM", "6AM-10AM", "8AM-12PM", "9AM-1PM", "10AM-3PM", "11AM-3PM", "12PM-4PM", "2PM-6PM", "3PM-7PM", "4PM-8PM", "6PM-10PM", "7PM-11PM"],
  Friday: ["5AM-9AM", "6AM-10AM", "8AM-12PM", "9AM-1PM", "10AM-3PM", "11AM-3PM", "12PM-4PM", "2PM-6PM", "3PM-7PM", "4PM-8PM", "6PM-10PM"],
  Saturday: ["6AM-10AM", "8AM-12PM", "9AM-1PM", "10AM-3PM", "11AM-3PM", "12PM-4PM", "2PM-6PM", "3PM-7PM", "4PM-8PM"],
  Sunday: ["6AM-10AM", "8AM-12PM", "9AM-1PM", "10AM-3PM", "11AM-3PM", "12PM-4PM", "2PM-6PM", "3PM-7PM", "4PM-8PM"]
};

const availabilityArea = document.getElementById("availabilityArea");
const submitBtn = document.getElementById("submitBtn");
const message = document.getElementById("message");

function buildAvailabilityForm() {
  for (const day in hoursByDay) {
    const dayBox = document.createElement("div");
    dayBox.className = "day-box";

    dayBox.innerHTML = `<h3>${day}</h3>`;

    const grid = document.createElement("div");
    grid.className = "checkbox-grid";

    hoursByDay[day].forEach(shift => {
      const label = document.createElement("label");
      label.innerHTML = `
        <input type="checkbox" class="availability" data-day="${day}" value="${shift}" />
        ${shift}
      `;
      grid.appendChild(label);
    });

    dayBox.appendChild(grid);
    availabilityArea.appendChild(dayBox);
  }
}

function getSelectedRoles() {
  return Array.from(document.querySelectorAll(".role:checked")).map(role => role.value);
}

function getAvailability() {
  const availability = {};

  for (const day in hoursByDay) {
    availability[day] = [];
  }

  document.querySelectorAll(".availability:checked").forEach(box => {
    const day = box.dataset.day;
    availability[day].push(box.value);
  });

  return availability;
}

function getDateRange(start, end) {
  const dates = [];
  const current = new Date(start + "T00:00:00");
  const final = new Date(end + "T00:00:00");

  while (current <= final) {
    dates.push(current.toISOString().split("T")[0]);
    current.setDate(current.getDate() + 1);
  }

  return dates;
}

function submitForm() {
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

  const employee = {
    name,
    roles,
    availability
  };

  if (existingIndex >= 0) {
    employees[existingIndex] = employee;
  } else {
    employees.push(employee);
  }

  localStorage.setItem("employees", JSON.stringify(employees));

  if (timeOffStart && timeOffEnd) {
    let requests = JSON.parse(localStorage.getItem("timeOffRequests")) || [];

    requests.push({
      name,
      start: timeOffStart,
      end: timeOffEnd,
      dates: getDateRange(timeOffStart, timeOffEnd),
      reason: timeOffReason || "No reason given"
    });

    localStorage.setItem("timeOffRequests", JSON.stringify(requests));
  }

  message.textContent = "Submitted successfully!";
}

buildAvailabilityForm();
submitBtn.addEventListener("click", submitForm);