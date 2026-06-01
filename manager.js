const employees =
  JSON.parse(localStorage.getItem("employees")) || [];

const timeOffRequests =
  JSON.parse(localStorage.getItem("timeOffRequests")) || [];

const scheduleCalendar =
  document.getElementById("scheduleCalendar");

const employeeList =
  document.getElementById("employeeList");

const timeOffList =
  document.getElementById("timeOffList");

const generateBtn =
  document.getElementById("generateBtn");

const saveBtn =
  document.getElementById("saveBtn");

const clearBtn =
  document.getElementById("clearBtn");

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

const cleaningByDay = {
  Monday: ["11AM-12PM", "3PM-4PM"],
  Tuesday: ["11AM-12PM"],
  Wednesday: ["11AM-12PM", "3PM-4PM"],
  Thursday: ["11AM-12PM", "2PM-3PM"],
  Friday: ["8AM-9AM", "2PM-3PM"],
  Saturday: ["9AM-10AM", "12PM-1PM"],
  Sunday: ["9AM-10AM", "12PM-1PM"]
};

function getDayName(dateString) {
  const date =
    new Date(dateString + "T00:00:00");

  return date.toLocaleDateString(
    "en-US",
    { weekday: "long" }
  );
}

function addDays(dateString, days) {
  const date =
    new Date(dateString + "T00:00:00");

  date.setDate(date.getDate() + days);

  return date.toISOString().split("T")[0];
}

function isOnTimeOff(name, date) {
  return timeOffRequests.some(request => {
    return (
      request.name.toLowerCase() ===
      name.toLowerCase()
      &&
      request.dates.includes(date)
    );
  });
}

function getAvailableEmployees(
  date,
  day,
  role,
  shift
) {
  return employees.filter(employee => {

    const roleMatch =
      employee.roles.includes(role);

    const shiftMatch =
      employee.availability[day]
      &&
      employee.availability[day]
        .includes(shift);

    const onTimeOff =
      isOnTimeOff(
        employee.name,
        date
      );

    return (
      roleMatch &&
      shiftMatch &&
      !onTimeOff
    );
  });
}

function createShiftCard(
  date,
  day,
  role,
  shift
) {

  const availableEmployees =
    getAvailableEmployees(
      date,
      day,
      role,
      shift
    );

  let options =
    `<option value="">Select Employee</option>`;

  availableEmployees.forEach(emp => {

    options += `
      <option value="${emp.name}">
        ${emp.name}
      </option>
    `;
  });

  return `
    <div class="shift-card ${role.toLowerCase().replace(" ","-")}">

      <p class="shift-role">
        ${role}
      </p>

      <p class="shift-time">
        ${shift}
      </p>

      ${
        availableEmployees.length > 0
        ?
        `
        <select
          class="assignment"
          data-date="${date}"
          data-shift="${shift}"
          data-role="${role}"
        >
          ${options}
        </select>
        `
        :
        `
        <p class="no-people">
          No Available Employees
        </p>
        `
      }

    </div>
  `;
}

function generateSchedule() {

  const startDate =
    document.getElementById("weekStart").value;

  if (!startDate) {
    alert("Select a week start date.");
    return;
  }

  let html = "";

  for (let i = 0; i < 7; i++) {

    const currentDate =
      addDays(startDate, i);

    const day =
      getDayName(currentDate);

    html += `
      <div class="day-column">

        <div class="day-header">
          <h3>${day}</h3>
          <p>${currentDate}</p>
        </div>
    `;

    const shifts =
      hoursByDay[day] || [];

    shifts.forEach(shift => {

      html += createShiftCard(
        currentDate,
        day,
        "Front Desk",
        shift
      );

      html += createShiftCard(
        currentDate,
        day,
        "Aura",
        shift
      );
    });

    const cleaningShifts =
      cleaningByDay[day] || [];

    cleaningShifts.forEach(shift => {

      html += createShiftCard(
        currentDate,
        day,
        "Cleaning",
        shift
      );
    });

    html += `</div>`;
  }

  scheduleCalendar.innerHTML = html;

  document
    .querySelectorAll(".assignment")
    .forEach(select => {
      select.addEventListener(
        "change",
        checkDuplicates
      );
    });
}

function checkDuplicates() {

  const assignments = {};

  document
    .querySelectorAll(".assignment")
    .forEach(select => {

      const employee =
        select.value;

      if (!employee) return;

      const key =
        employee +
        "-" +
        select.dataset.date +
        "-" +
        select.dataset.shift;

      if (assignments[key]) {

        alert(
          employee +
          " is already assigned during " +
          select.dataset.shift
        );

        select.value = "";
      }

      assignments[key] = true;
    });
}

function saveSchedule() {

  const schedule = [];

  document
    .querySelectorAll(".assignment")
    .forEach(select => {

      if (select.value) {

        schedule.push({
          employee: select.value,
          date: select.dataset.date,
          shift: select.dataset.shift,
          role: select.dataset.role
        });
      }
    });

  localStorage.setItem(
    "savedSchedule",
    JSON.stringify(schedule)
  );

  alert("Schedule Saved");
}

function clearSchedule() {

  localStorage.removeItem(
    "savedSchedule"
  );

  location.reload();
}

function renderEmployees() {

  employeeList.innerHTML = "";

  employees.forEach(emp => {

    employeeList.innerHTML += `
      <div class="employee-card">
        <strong>${emp.name}</strong>
        <br>
        Roles:
        ${emp.roles.join(", ")}
      </div>
    `;
  });
}

function renderTimeOff() {

  timeOffList.innerHTML = "";

  timeOffRequests.forEach(req => {

    timeOffList.innerHTML += `
      <div class="employee-card">
        <strong>${req.name}</strong>
        <br>
        ${req.start}
        →
        ${req.end}
        <br>
        ${req.reason}
      </div>
    `;
  });
}

generateBtn.addEventListener(
  "click",
  generateSchedule
);

saveBtn.addEventListener(
  "click",
  saveSchedule
);

clearBtn.addEventListener(
  "click",
  clearSchedule
);

renderEmployees();
renderTimeOff();