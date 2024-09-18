"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const baseUrl = "https://66e98a6387e417609449dfc5.mockapi.io/api/";
const myAgentNumber = "8176800";
const bookingFlights = document.querySelector(".bookingFlights");
const bookingInp = document.querySelector(".bookingInp");
const addPassenger = document.querySelector(".addPassenger");
const flListSelect = document.querySelector("#flights");
const passengerList = document.querySelector("#passengerList");
const genderRadio = document.querySelector('input[name="gender"]');
const editPopup = document.querySelector("#editPopup");
const editName = document.querySelector("#editName");
const saveEdit = document.querySelector("#saveEdit");
const closePopup = document.querySelector("#closePopup");
let currentPassengerId = null;
const myPassengers = document.querySelector(".myPassengers");
const getFlights = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const res = yield fetch(baseUrl + "flights");
        const flights = yield res.json();
        for (const flight of flights) {
            const opt = document.createElement("option");
            opt.textContent = `${flight.date}: ${flight.from} - ${flight.to}`;
            opt.value = flight.id;
            flListSelect.appendChild(opt);
        }
    }
    catch (err) {
        console.error("Error fetching flights:", err);
    }
});
getFlights();
const createPassenger = () => __awaiter(void 0, void 0, void 0, function* () {
    const name = bookingInp.value;
    const gender = getSelectedGender();
    const flight_id = flListSelect.value;
    const newPassenger = {
        createdAt: new Date().getDate().toString(),
        name,
        gender,
        flight_id,
        agent: myAgentNumber,
    };
    try {
        const res = yield fetch(baseUrl + "pasangers", {
            method: "Post",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(newPassenger),
        });
        const createdPassenger = yield res.json();
        alert(`Passenger created : ${newPassenger.name}`);
        updatePassengerList(flight_id);
    }
    catch (err) {
        console.log(err);
    }
});
const getPassengersByFlight = (flight_id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const res = yield fetch(baseUrl + "pasangers?flight_id=" + flight_id);
        const passengers = yield res.json();
        return passengers;
    }
    catch (err) {
        console.log(err);
        return [];
    }
});
const getPassengersByAgentId = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const res = yield fetch(baseUrl + "pasangers?agent=" + myAgentNumber);
        const passengers = yield res.json();
        return passengers;
    }
    catch (err) {
        console.log(err);
        return [];
    }
});
const updatePassengerList = (flight_id) => __awaiter(void 0, void 0, void 0, function* () {
    passengerList.innerHTML = "";
    const passengers = yield getPassengersByFlight(flight_id);
    if (passengers.length === 0) {
        passengerList.textContent = "No passengers for this flight.";
        return;
    }
    for (const passenger of passengers) {
        const li = document.createElement("li");
        li.textContent = `${passenger.name} (${passenger.gender}) `;
        addEditButton(li, passenger);
        addDeleteButton(li, passenger);
        passengerList.appendChild(li);
    }
});
const updateMyPassengerList = () => __awaiter(void 0, void 0, void 0, function* () {
    passengerList.innerHTML = "";
    const passengers = yield getPassengersByAgentId();
    if (passengers.length === 0) {
        passengerList.textContent = "No passengers for this agent";
        return;
    }
    for (const passenger of passengers) {
        const li = document.createElement("li");
        li.textContent = `${passenger.name} (${passenger.gender}) `;
        addEditButton(li, passenger);
        addDeleteButton(li, passenger);
        passengerList.appendChild(li);
    }
});
const getSelectedGender = () => {
    const genderInput = document.querySelector('input[name="gender"]:checked');
    return genderInput.value;
};
const deletePassenger = (id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield fetch(`${baseUrl}pasangers/${id}`, { method: "DELETE" });
        alert("Passenger deleted");
        const flight_id = flListSelect.value;
        updatePassengerList(flight_id);
    }
    catch (err) {
        console.error("Error deleting passenger:", err);
    }
});
const openEditPopup = (name, id) => {
    editName.value = name;
    currentPassengerId = id;
    editPopup.style.display = "block";
};
const closeEditPopup = () => {
    editPopup.style.display = "none";
    currentPassengerId = null;
};
const saveEditPassenger = () => __awaiter(void 0, void 0, void 0, function* () {
    if (!currentPassengerId)
        return;
    const updatedName = editName.value;
    try {
        const res = yield fetch(`${baseUrl}pasangers/${currentPassengerId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ name: updatedName }),
        });
        yield res.json();
        alert("Passenger updated");
        const flight_id = flListSelect.value;
        updatePassengerList(flight_id);
        closeEditPopup();
    }
    catch (err) {
        console.log("Error updating passenger:", err);
    }
});
const addEditButton = (li, passenger) => {
    const editButton = document.createElement("button");
    editButton.textContent = "Edit";
    editButton.addEventListener("click", () => {
        openEditPopup(passenger.name, passenger.id);
    });
    li.appendChild(editButton);
};
const addDeleteButton = (li, passenger) => {
    const delleteButton = document.createElement("button");
    delleteButton.textContent = "Delete";
    delleteButton.addEventListener("click", () => {
        const confirmDelete = confirm(`Are you sure you want to delete the ${passenger.name}`);
        if (confirmDelete) {
            deletePassenger(passenger.id);
        }
    });
    li.appendChild(delleteButton);
};
addPassenger.addEventListener("click", (e) => {
    e.preventDefault();
    createPassenger();
});
flListSelect.addEventListener("change", (e) => {
    const selectedFlight = e.target.value;
    updatePassengerList(selectedFlight);
});
closePopup.addEventListener("click", closeEditPopup);
saveEdit.addEventListener("click", saveEditPassenger);
myPassengers.addEventListener("click", updateMyPassengerList);
