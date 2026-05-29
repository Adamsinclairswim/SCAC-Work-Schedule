const submitBtn = document.getElementById("submitBtn");

submitBtn.addEventListener("click", function () {
    const name = document.getElementById("employeeName").value.trim();

    if (name === "") {
        alert("Please enter your full name.");
        return;
    }

    const shiftCheckboxes = document.querySelectorAll(
        "section:nth-of-type(2) input[type='checkbox']"
    );

    const roleCheckboxes = document.querySelectorAll(
        "section:nth-of-type(3) input[type='checkbox']"
    );

    const shifts = [];
    shiftCheckboxes.forEach(checkbox => {
        if (checkbox.checked) {
            shifts.push(checkbox.parentElement.textContent.trim());
        }
    });

    const roles = [];
    roleCheckboxes.forEach(checkbox => {
        if (checkbox.checked) {
            roles.push(checkbox.parentElement.textContent.trim());
        }
    });

    const availabilityRows = document.querySelectorAll(".availability-row");

    const availability = {};

    availabilityRows.forEach(row => {
        const day = row.querySelector("strong").textContent.trim();
        const times = row.querySelectorAll("input[type='time']");

        availability[day] = {
            start: times[0].value,
            end: times[1].value
        };
    });

    const employee = {
        name: name,
        shifts: shifts,
        roles: roles,
        availability: availability,
        timeOffDate: document.getElementById("timeOffDate").value,
        timeOffReason: document.getElementById("timeOffReason").value.trim(),
        preferredHours: document.getElementById("preferredHours").value,
        maxHours: document.getElementById("maxHours").value,
        notes: document.getElementById("notes").value.trim()
    };

    const employees = JSON.parse(localStorage.getItem("employees")) || [];

    employees.push(employee);

    localStorage.setItem("employees", JSON.stringify(employees));

    alert("Availability submitted successfully!");

    clearForm();
});

function clearForm() {
    document.getElementById("employeeName").value = "";
    document.getElementById("timeOffDate").value = "";
    document.getElementById("timeOffReason").value = "";
    document.getElementById("preferredHours").value = "";
    document.getElementById("maxHours").value = "";
    document.getElementById("notes").value = "";

    const checkboxes = document.querySelectorAll("input[type='checkbox']");
    checkboxes.forEach(checkbox => {
        checkbox.checked = false;
    });

    const timeInputs = document.querySelectorAll("input[type='time']");
    timeInputs.forEach(input => {
        input.value = "";
    });
}