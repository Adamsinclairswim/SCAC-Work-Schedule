const employees = JSON.parse(localStorage.getItem("employees")) || [];
const timeOffRequests = JSON.parse(localStorage.getItem("timeOffRequests")) || [];

const hoursByDay = {
  Monday: ["4AM-8AM", "5AM-9AM", "6AM-10AM", "8AM-12PM", "9AM-1PM", "10AM-3PM", "11AM-3PM", "12PM-4PM", "2PM-6PM", "3PM-7PM", "4PM-8PM", "6PM-10PM", "7PM-11PM"],
  Tuesday: ["4AM-8AM", "5AM-9AM", "6AM-10AM", "8AM-12PM", "9AM-1PM", "10AM-3PM", "11AM-3PM", "12PM-4PM", "2PM-6PM", "3PM-7PM", "4PM-8PM", "6PM-10PM", "7PM-11PM"],
  Wednesday: ["4AM-8AM", "5AM-9AM", "6AM-10AM", "8AM-12PM", "9AM-1PM", "10AM-3PM", "11AM-3PM", "12PM-4PM", "2PM-6PM", "3PM-7PM", "4PM-8PM", "6PM-10PM", "7PM-11PM"],
  Thursday: ["4AM-8AM", "5AM-9AM", "6AM-10AM", "8AM-12PM", "9AM-1PM", "10AM-3PM", "11AM-3PM", "12PM-4PM", "2PM-6PM", "3PM-7PM", "4PM-8PM", "6PM-10PM", "7PM-11PM"],
  Friday: ["5AM-9AM", "6AM-10AM", "8AM-12PM", "9AM-1PM", "10AM-3PM", "11AM-3PM", "12PM-4PM", "2PM-6PM", "3PM-7PM", "4PM-8PM", "6PM-10PM"],
  Saturday: ["6AM-10AM", "8AM-12PM", "9AM-1PM", "10AM-3PM", "11AM-3PM", "12PM-4PM", "2PM-6PM", "3PM-7PM", "4PM-8PM"],
  Sunday: ["6AM-10AM", "8AM-12PM", "9AM-1PM", "10AM-3PM", "11AM-3PM", "12PM-4PM", "2PM-6PM", "3PM-7PM", "4PM-8PM"]
};

const cleaningByDay = {
  Monday: ["11AM-12PM", "3PM-4PM"],
  Tuesday: ["11AM-12PM"],
  Wednesday: ["11AM-12PM", "3PM-4PM"],
  Thursday: ["11AM-12PM", "2PM-3PM"],
  Friday: ["8AM-9AM", "2PM-3PM"],
  Saturday: ["9AM-10AM", "12PM-1PM"],
  Sunday: ["9AM-10AM", "12PM-1PM"]
};

const auraSpots = ["Aura 1", "Aura 2", "Aura 3", "Aura 4", "Aura 5", "Aura 6", "Aura 7"];

const generateBtn = document.getElementById("generateBtn");
const saveBtn = document.getElementById("saveBtn");
const clearBtn = document.getElementById("clearBtn");
const scheduleArea = document.getElementById("scheduleArea");
const employeeList = document.getElementById("employeeList");
const timeOffList = document.getElementById("timeOffList");

function getDayName(dateString) {
  const date = new Date(dateString + "T00:00:00");
  return date.toLocaleDateString("en-US", { weekday: "long" });
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

function isOnTimeOff(name, date) {
  return timeOffRequests.some(request => {
    return request.name.toLowerCase() === name.toLowerCase() &&
           request.dates.includes(date);
  });
}

function getAvailableEmployees(date, day, role, shift) {
  return employees.filter(emp => {
    const hasRole = emp.roles.includes(role);
    const available = emp.availability[day] && emp.availability[day].includes(shift);
    const off = isOnTimeOff(emp.name, date);

    return hasRole && available && !off;
  });
}

function createDropdown(date, day, role, shift, label) {
  const available = getAvailableEmployees(date, day, role, shift);

  let options = `<option value="">Choose employee</option>`;

  available.forEach(emp => {
    options += `<option value="${emp.name}">${emp.name}</option>`;
  });

  return `
    <tr>
      <td>${date}</td>
      <td>${day}</td>
      <td>${role}</td>
      <td>${label}</td>
      <td>${shift}</td>
      <td>
        <select class="assignment" data-date="${date}" data-shift="${shift}">
          ${options}
        </select>
      </td>
      <td>${available.length > 0 ? `<span class="good">${available.length} available</span>` : `<span class="bad">No one available</span>`}</td>
    </tr>
  `;
}

function generateSchedule() {
  const start = document.getElementById("startDate").value;
  const end = document.getElementById("endDate").value;

  if (!start || !end) {
    scheduleArea.innerHTML = `<p class="bad">Please select a start and end date.</p>`;
    return;
  }

  const dates = getDateRange(start, end);

  let html = `
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Day</th>
            <th>Role</th>
            <th>Position</th>
            <th>Shift</th>
            <th>Assign</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
  `;

  dates.forEach(date => {
    const day = getDayName(date);
    const shifts = hoursByDay[day] || [];

    shifts.forEach(shift => {
      html += createDropdown(date, day, "Front Desk", shift, "Front Desk");
    });

    shifts.forEach(shift => {
      auraSpots.forEach(spot => {
        html += createDropdown(date, day, "Aura", shift, spot);
      });
    });

    const cleaningShifts = cleaningByDay[day] || [];

    cleaningShifts.forEach(shift => {
      html += createDropdown(date, day, "Cleaning", shift, "Cleaning");
    });
  });

  html += `
        </tbody>
      </table>
    </div>
  `;

  scheduleArea.innerHTML = html;

  document.querySelectorAll(".assignment").forEach(select => {
    select.addEventListener("change", preventDuplicateAssignments);
  });
}

function preventDuplicateAssignments() {
  const selects = document.querySelectorAll(".assignment");
  const used = {};

  selects.forEach(select => {
    const employee = select.value;
    const date = select.dataset.date;
    const shift = select.dataset.shift;

    if (!employee) return;

    const key = `${employee}-${date}-${shift}`;

    if (used[key]) {
      alert(`${employee} is already assigned during ${shift} on ${date}.`);
      select.value = "";
    } else {
      used[key] = true;
    }
  });
}

function saveSchedule() {
  const assignments = [];

  document.querySelectorAll(".assignment").forEach(select => {
    if (select.value) {
      const row = select.closest("tr");

      assignments.push({
        date: row.children[0].textContent,
        day: row.children[1].textContent,
        role: row.children[2].textContent,
        position: row.children[3].textContent,
        shift: row.children[4].textContent,
        employee: select.value
      });
    }
  });

  localStorage.setItem("savedSchedule", JSON.stringify(assignments));
  alert("Schedule saved!");
}

function clearSchedule() {
  localStorage.removeItem("savedSchedule");
  scheduleArea.innerHTML = "<p>Saved schedule cleared.</p>";
}

function renderEmployees() {
  if (employees.length === 0) {
    employeeList.innerHTML = "<p>No employees submitted yet.</p>";
    return;
  }

  employeeList.innerHTML = employees.map(emp => `
    <div class="employee-card">
      <strong>${emp.name}</strong>
      <p>${emp.roles.join(", ")}</p>
    </div>
  `).join("");
}

function renderTimeOff() {
  if (timeOffRequests.length === 0) {
    timeOffList.innerHTML = "<p>No time off requests yet.</p>";
    return;
  }

  timeOffList.innerHTML = timeOffRequests.map(req => `
    <div class="employee-card">
      <strong>${req.name}</strong>
      <p>${req.start} to ${req.end}</p>
      <p>${req.reason}</p>
    </div>
  `).join("");
}

generateBtn.addEventListener("click", generateSchedule);
saveBtn.addEventListener("click", saveSchedule);
clearBtn.addEventListener("click", clearSchedule);

renderEmployees();
renderTimeOff();