const employees = JSON.parse(localStorage.getItem("employees")) || [];
const timeOffRequests = JSON.parse(localStorage.getItem("timeOffRequests")) || [];

const generateBtn = document.getElementById("generateBtn");
const saveScheduleBtn = document.getElementById("saveScheduleBtn");
const clearScheduleBtn = document.getElementById("clearScheduleBtn");
const clearRequestsBtn = document.getElementById("clearRequestsBtn");

const scheduleArea = document.getElementById("scheduleArea");
const employeeList = document.getElementById("employeeList");
const timeOffList = document.getElementById("timeOffList");

const requiredShifts = [
  { role: "Front Desk", shift: "Opening" },
  { role: "Front Desk", shift: "Midday" },
  { role: "Front Desk", shift: "Closing" },
  { role: "Lifeguard", shift: "Morning" },
  { role: "Lifeguard", shift: "Afternoon" },
  { role: "Swim Instructor", shift: "Afternoon" },
  { role: "Aura Coverage", shift: "Midday" },
  { role: "Cleaning", shift: "Closing" }
];

function getDayName(dateString) {
  const date = new Date(dateString + "T00:00:00");
  return date.toLocaleDateString("en-US", { weekday: "long" });
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

function isOnTimeOff(employeeName, date) {
  return timeOffRequests.some(request => {
    return request.name.toLowerCase() === employeeName.toLowerCase() &&
           request.dates.includes(date);
  });
}

function getAvailableEmployees(date, role, shift) {
  const day = getDayName(date);

  return employees.filter(employee => {
    const canWorkRole = employee.roles.includes(role);
    const canWorkShift = employee.availability[day]?.includes(shift);
    const blockedByTimeOff = isOnTimeOff(employee.name, date);

    return canWorkRole && canWorkShift && !blockedByTimeOff;
  });
}

function renderEmployees() {
  if (employees.length === 0) {
    employeeList.innerHTML = "<p>No employee submissions yet.</p>";
    return;
  }

  employeeList.innerHTML = employees.map(employee => `
    <div class="employee-card">
      <strong>${employee.name}</strong>
      <p><b>Roles:</b> ${employee.roles.join(", ")}</p>
    </div>
  `).join("");
}

function renderTimeOff() {
  if (timeOffRequests.length === 0) {
    timeOffList.innerHTML = "<p>No time off requests yet.</p>";
    return;
  }

  timeOffList.innerHTML = timeOffRequests.map(request => `
    <div class="employee-card">
      <strong>${request.name}</strong>
      <p><b>Dates:</b> ${request.start} to ${request.end}</p>
      <p><b>Reason:</b> ${request.reason}</p>
    </div>
  `).join("");
}

function generateSchedule() {
  const start = document.getElementById("scheduleStart").value;
  const end = document.getElementById("scheduleEnd").value;

  if (!start || !end) {
    scheduleArea.innerHTML = "<p class='warning'>Please select a start and end date.</p>";
    return;
  }

  const dates = getDateRange(start, end);

  let html = `<div class="table-wrap"><table>
    <thead>
      <tr>
        <th>Date</th>
        <th>Day</th>
        <th>Role</th>
        <th>Shift</th>
        <th>Assign Employee</th>
        <th>Status</th>
      </tr>
    </thead>
    <tbody>
  `;

  dates.forEach(date => {
    requiredShifts.forEach(item => {
      const available = getAvailableEmployees(date, item.role, item.shift);

      const options = available.map(emp => `
        <option value="${emp.name}">${emp.name}</option>
      `).join("");

      html += `
        <tr>
          <td>${date}</td>
          <td>${getDayName(date)}</td>
          <td>${item.role}</td>
          <td>${item.shift}</td>
          <td>
            <select class="assignment" data-date="${date}" data-shift="${item.shift}">
              <option value="">Choose employee</option>
              ${options}
            </select>
          </td>
          <td>
            ${available.length > 0 
              ? `<span class="good">${available.length} available</span>` 
              : `<span class="warning">No one available</span>`}
          </td>
        </tr>
      `;
    });
  });

  html += `</tbody></table></div>`;
  scheduleArea.innerHTML = html;

  document.querySelectorAll(".assignment").forEach(select => {
    select.addEventListener("change", checkDuplicateAssignments);
  });
}

function checkDuplicateAssignments() {
  const assignments = Array.from(document.querySelectorAll(".assignment"));
  const used = {};

  assignments.forEach(select => {
    select.classList.remove("duplicate");
    const employee = select.value;
    const date = select.dataset.date;
    const shift = select.dataset.shift;

    if (!employee) return;

    const key = `${employee}-${date}-${shift}`;

    if (used[key]) {
      alert(`${employee} is already assigned to ${shift} on ${date}.`);
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
        shift: row.children[3].textContent,
        employee: select.value
      });
    }
  });

  localStorage.setItem("savedSchedule", JSON.stringify(assignments));
  alert("Schedule saved!");
}

function clearSchedule() {
  if (confirm("Clear the saved schedule?")) {
    localStorage.removeItem("savedSchedule");
    scheduleArea.innerHTML = "<p>Schedule cleared.</p>";
  }
}

function clearRequests() {
  if (confirm("Clear all time off requests?")) {
    localStorage.removeItem("timeOffRequests");
    location.reload();
  }
}

generateBtn.addEventListener("click", generateSchedule);
saveScheduleBtn.addEventListener("click", saveSchedule);
clearScheduleBtn.addEventListener("click", clearSchedule);
clearRequestsBtn.addEventListener("click", clearRequests);

renderEmployees();
renderTimeOff();