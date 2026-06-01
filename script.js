const hoursByDay = {
  Monday: [
    "4AM-8AM",
    "5AM-9AM",
    "6AM-10AM",
    "8AM-12PM",
    "9AM-1PM",
    "10AM-3PM",
    "11AM-3PM",
    "12PM-4PM",
    "2PM-6PM",
    "3PM-7PM",
    "4PM-8PM",
    "6PM-10PM",
    "7PM-11PM"
  ],
  Tuesday: [
    "4AM-8AM",
    "5AM-9AM",
    "6AM-10AM",
    "8AM-12PM",
    "9AM-1PM",
    "10AM-3PM",
    "11AM-3PM",
    "12PM-4PM",
    "2PM-6PM",
    "3PM-7PM",
    "4PM-8PM",
    "6PM-10PM",
    "7PM-11PM"
  ],
  Wednesday: [
    "4AM-8AM",
    "5AM-9AM",
    "6AM-10AM",
    "8AM-12PM",
    "9AM-1PM",
    "10AM-3PM",
    "11AM-3PM",
    "12PM-4PM",
    "2PM-6PM",
    "3PM-7PM",
    "4PM-8PM",
    "6PM-10PM",
    "7PM-11PM"
  ],
  Thursday: [
    "4AM-8AM",
    "5AM-9AM",
    "6AM-10AM",
    "8AM-12PM",
    "9AM-1PM",
    "10AM-3PM",
    "11AM-3PM",
    "12PM-4PM",
    "2PM-6PM",
    "3PM-7PM",
    "4PM-8PM",
    "6PM-10PM",
    "7PM-11PM"
  ],
  Friday: [
    "5AM-9AM",
    "6AM-10AM",
    "8AM-12PM",
    "9AM-1PM",
    "10AM-3PM",
    "11AM-3PM",
    "12PM-4PM",
    "2PM-6PM",
    "3PM-7PM",
    "4PM-8PM",
    "6PM-10PM"
  ],
  Saturday: [
    "6AM-10AM",
    "8AM-12PM",
    "9AM-1PM",
    "10AM-3PM",
    "11AM-3PM",
    "12PM-4PM",
    "2PM-6PM",
    "3PM-7PM",
    "4PM-8PM"
  ],
  Sunday: [
    "6AM-10AM",
    "8AM-12PM",
    "9AM-1PM",
    "10AM-3PM",
    "11AM-3PM",
    "12PM-4PM",
    "2PM-6PM",
    "3PM-7PM",
    "4PM-8PM"
  ]
};

const availabilityArea = document.getElementById("availabilityArea");
const submitBtn = document.getElementById("submitBtn");
const message = document.getElementById("message");

function buildAvailabilityForm() {
  availabilityArea.innerHTML = "";

  Object.keys(hoursByDay).forEach(day => {
    const dayBox = document.createElement("div");
    dayBox.className = "day-box";

    const title = document.createElement("h3");
    title.textContent = day;

    const grid = document.createElement("div");
    grid.className = "availability-grid";

    hoursByDay[day].forEach(shift => {
      const label = document.createElement("label");

      label.innerHTML = `
        <input 
          type="checkbox" 
          class="availability-checkbox" 
          data-day="${day}" 
          value="${shift}"
        />
        ${shift}
      `;

      grid.appendChild(label);
    });

    dayBox.appendChild(title);
    dayBox.appendChild(grid);
    availabilityArea.appendChild(dayBox);
  });
}

function getSelectedRoles() {
  const checkedRoles = document.querySelectorAll(".role:checked");

  return Array.from(checkedRoles).map(role => role.value);
}

function getAvailability() {
  const availability = {};

  Object.keys(hoursByDay).forEach(day => {
    availability[day] = [];
  });

  const checkedAvailability = document.querySelectorAll(".availability-checkbox:checked");

  checkedAvailability.forEach(box => {
    const day = box.dataset.day;
    const shift = box.value;

    availability[day].push(shift);
  });

  return availability;
}

function getDateRange(start, end) {
  const dates = [];
  const currentDate = new Date(start + "T00:00:00");
  const endDate = new Date(end + "T00:00:00");

  while (currentDate <= endDate) {
    dates.push(currentDate.toISOString().split("T")[0]);
    currentDate.setDate(currentDate.getDate() + 1);
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

  const hasAvailability = Object.values(availability).some(dayShifts => dayShifts.length > 0);

  if (!hasAvailability) {
    message.textContent = "Please select at least one available shift.";
    return;
  }

  let employees = JSON.parse(localStorage.getItem("employees")) || [];

  const existingEmployeeIndex = employees.findIndex(employee => {
    return employee.name.toLowerCase() === name.toLowerCase();
  });

  const employeeData = {
    name,
    roles,
    availability
  };

  if (existingEmployeeIndex >= 0) {
    employees[existingEmployeeIndex] = employeeData;
  } else {
    employees.push(employeeData);
  }

  localStorage.setItem("employees", JSON.stringify(employees));

  if (timeOffStart && timeOffEnd) {
    let timeOffRequests = JSON.parse(localStorage.getItem("timeOffRequests")) || [];

    const timeOffData = {
      name,
      start: timeOffStart,
      end: timeOffEnd,
      dates: getDateRange(timeOffStart, timeOffEnd),
      reason: timeOffReason || "No reason given"
    };

    timeOffRequests.push(timeOffData);

    localStorage.setItem("timeOffRequests", JSON.stringify(timeOffRequests));
  }

  message.textContent = "Availability submitted successfully!";
}

buildAvailabilityForm();

submitBtn.addEventListener("click", submitAvailability);