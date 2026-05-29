const employeeSubmissions = document.getElementById("employeeSubmissions");
const generatedSchedule = document.getElementById("generatedSchedule");
const finalSchedule = document.getElementById("finalSchedule");
const generateScheduleBtn = document.getElementById("generateScheduleBtn");
const exportScheduleBtn = document.getElementById("exportScheduleBtn");

let employees = JSON.parse(localStorage.getItem("employees")) || [];
let assignedSchedule = [];

const shiftTemplates = {
    Monday: [
        { time: "4AM-8AM", role: "Opening", spots: 2 },
        { time: "8AM-12PM", role: "Aura Coverage", spots: 2 },
        { time: "11AM-3PM", role: "Aura Coverage", spots: 2 },
        { time: "12PM-4PM", role: "Aura Coverage", spots: 2 },
        { time: "3PM-7PM", role: "Aura Coverage", spots: 3 },
        { time: "7PM-11PM", role: "Closing", spots: 3 }
    ],

    Tuesday: [
        { time: "4AM-8AM", role: "Opening", spots: 2 },
        { time: "8AM-12PM", role: "Aura Coverage", spots: 2 },
        { time: "9AM-1PM", role: "Aura Coverage", spots: 1 },
        { time: "11AM-3PM", role: "Aura Coverage", spots: 2 },
        { time: "3PM-7PM", role: "Aura Coverage", spots: 3 },
        { time: "7PM-11PM", role: "Closing", spots: 3 }
    ],

    Wednesday: [
        { time: "4AM-8AM", role: "Opening", spots: 2 },
        { time: "8AM-12PM", role: "Aura Coverage", spots: 2 },
        { time: "9AM-1PM", role: "Aura Coverage", spots: 1 },
        { time: "12PM-4PM", role: "Aura Coverage", spots: 2 },
        { time: "3PM-7PM", role: "Aura Coverage", spots: 3 },
        { time: "7PM-11PM", role: "Closing", spots: 3 }
    ],

    Thursday: [
        { time: "4AM-8AM", role: "Opening", spots: 2 },
        { time: "8AM-12PM", role: "Aura Coverage", spots: 2 },
        { time: "11AM-3PM", role: "Aura Coverage", spots: 2 },
        { time: "12PM-4PM", role: "Aura Coverage", spots: 1 },
        { time: "3PM-7PM", role: "Aura Coverage", spots: 2 },
        { time: "7PM-11PM", role: "Closing", spots: 3 }
    ],

    Friday: [
        { time: "5AM-9AM", role: "Opening", spots: 2 },
        { time: "8AM-12PM", role: "Aura Coverage", spots: 1 },
        { time: "9AM-1PM", role: "Aura Coverage", spots: 1 },
        { time: "10AM-3PM", role: "Aura Coverage", spots: 2 },
        { time: "11AM-3PM", role: "Aura Coverage", spots: 1 },
        { time: "12PM-4PM", role: "Aura Coverage", spots: 1 },
        { time: "2PM-6PM", role: "Aura Coverage", spots: 2 },
        { time: "6PM-10PM", role: "Closing", spots: 3 }
    ],

    Saturday: [
        { time: "6AM-10AM", role: "Opening", spots: 2 },
        { time: "9AM-1PM", role: "Aura Coverage", spots: 1 },
        { time: "10AM-3PM", role: "Aura Coverage", spots: 1 },
        { time: "12PM-4PM", role: "Aura Coverage", spots: 2 },
        { time: "4PM-8PM", role: "Closing", spots: 2 }
    ],

    Sunday: [
        { time: "6AM-10AM", role: "Opening", spots: 2 },
        { time: "9AM-1PM", role: "Aura Coverage", spots: 1 },
        { time: "12PM-4PM", role: "Aura Coverage", spots: 2 },
        { time: "4PM-8PM", role: "Closing", spots: 2 }
    ]
};

function displayEmployeeSubmissions() {
    if (employees.length === 0) {
        employeeSubmissions.innerHTML = "<p>No employee submissions yet.</p>";
        return;
    }

    employeeSubmissions.innerHTML = "";

    employees.forEach(employee => {
        const card = document.createElement("div");
        card.classList.add("employee-card");

        card.innerHTML = `
            <h3>${employee.name}</h3>
            <p><strong>Shifts:</strong> ${employee.shifts?.join(", ") || "None"}</p>
            <p><strong>Roles:</strong> ${employee.roles?.join(", ") || "None"}</p>
            <p><strong>Preferred Hours:</strong> ${employee.preferredHours || "Not listed"}</p>
            <p><strong>Max Hours:</strong> ${employee.maxHours || "Not listed"}</p>
            <p><strong>Time Off:</strong> ${employee.timeOffDate || "None"}</p>
            <p><strong>Notes:</strong> ${employee.notes || "None"}</p>
        `;

        employeeSubmissions.appendChild(card);
    });
}

function getEligibleEmployees(shift) {
    return employees.filter(employee => {
        const canWorkShift = employee.shifts && employee.shifts.includes(shift.time);

        const canWorkRole =
            shift.role === "Opening" ||
            shift.role === "Closing"
                ? canWorkShift
                : employee.roles && employee.roles.includes(shift.role);

        return canWorkShift && canWorkRole;
    });
}

function generateSchedule() {
    generatedSchedule.innerHTML = "";
    assignedSchedule = [];

    Object.keys(shiftTemplates).forEach(day => {
        const dayTitle = document.createElement("h3");
        dayTitle.textContent = day;
        generatedSchedule.appendChild(dayTitle);

        shiftTemplates[day].forEach(shift => {
            const eligibleEmployees = getEligibleEmployees(shift);

            const shiftCard = document.createElement("div");
            shiftCard.classList.add("shift-card");

            let dropdowns = "";

            for (let i = 1; i <= shift.spots; i++) {
                dropdowns += `
                    <label>Spot ${i}</label>
                    <select class="assign-dropdown"
                        data-day="${day}"
                        data-time="${shift.time}"
                        data-role="${shift.role}"
                        data-spot="${i}">
                        <option value="">Choose employee</option>
                        ${eligibleEmployees.map(employee => `
                            <option value="${employee.name}">
                                ${employee.name}
                            </option>
                        `).join("")}
                    </select>
                `;
            }

            shiftCard.innerHTML = `
                <h4>${shift.time} — ${shift.role}</h4>
                <p><strong>Needed:</strong> ${shift.spots}</p>
                <p><strong>Eligible:</strong>
                    ${eligibleEmployees.length > 0
                        ? eligibleEmployees.map(employee => employee.name).join(", ")
                        : "No eligible employees"}
                </p>
                ${dropdowns}
            `;

            generatedSchedule.appendChild(shiftCard);
        });
    });

    addDropdownListeners();
    displayFinalSchedule();
}

function addDropdownListeners() {
    const dropdowns = document.querySelectorAll(".assign-dropdown");

    dropdowns.forEach(dropdown => {
        dropdown.addEventListener("change", function () {
            const day = this.dataset.day;
            const time = this.dataset.time;
            const role = this.dataset.role;
            const spot = this.dataset.spot;
            const employeeName = this.value;

            assignedSchedule = assignedSchedule.filter(item => {
                return !(item.day === day && item.time === time && item.spot === spot);
            });

            if (employeeName !== "") {
                assignedSchedule.push({
                    day,
                    time,
                    role,
                    spot,
                    employeeName
                });
            }

            displayFinalSchedule();
        });
    });
}

function displayFinalSchedule() {
    if (assignedSchedule.length === 0) {
        finalSchedule.innerHTML = "<p>Assigned shifts will appear here.</p>";
        return;
    }

    finalSchedule.innerHTML = "";

    assignedSchedule.forEach(shift => {
        const item = document.createElement("div");
        item.classList.add("final-shift");

        item.innerHTML = `
            <p>
                <strong>${shift.day}</strong> —
                ${shift.time} —
                ${shift.role} —
                Spot ${shift.spot}:
                ${shift.employeeName}
            </p>
        `;

        finalSchedule.appendChild(item);
    });
}

function exportSchedule() {
    if (assignedSchedule.length === 0) {
        alert("No assigned shifts to export yet.");
        return;
    }

    let text = "Final Schedule\n\n";

    assignedSchedule.forEach(shift => {
        text += `${shift.day} | ${shift.time} | ${shift.role} | Spot ${shift.spot} | ${shift.employeeName}\n`;
    });

    const blob = new Blob([text], { type: "text/plain" });
    const link = document.createElement("a");

    link.href = URL.createObjectURL(blob);
    link.download = "final-schedule.txt";
    link.click();
}

generateScheduleBtn.addEventListener("click", generateSchedule);
exportScheduleBtn.addEventListener("click", exportSchedule);

displayEmployeeSubmissions();