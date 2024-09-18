const baseUrl: string = "https://66e98a6387e417609449dfc5.mockapi.io/api/";
const myAgentNumber: string = "8176800";
const bookingFlights: HTMLDivElement =
  document.querySelector(".bookingFlights")!;
const bookingInp: HTMLInputElement = document.querySelector(".bookingInp")!;
const addPassenger: HTMLButtonElement =
  document.querySelector(".addPassenger")!;
const flListSelect: HTMLSelectElement = document.querySelector("#flights")!;
const passengerList: HTMLUListElement =
  document.querySelector("#passengerList")!;
const genderRadio: HTMLButtonElement = document.querySelector(
  'input[name="gender"]'
)!;
const editPopup: HTMLDivElement = document.querySelector("#editPopup")!;
const editName: HTMLInputElement = document.querySelector("#editName")!;
const saveEdit: HTMLButtonElement = document.querySelector("#saveEdit")!;
const closePopup: HTMLSpanElement = document.querySelector("#closePopup")!;
let currentPassengerId: string | null = null;
const myPassengers: HTMLButtonElement =
  document.querySelector(".myPassengers")!;

const getFlights = async (): Promise<void> => {
  try {
    const res = await fetch(baseUrl + "flights");
    const flights: Flights[] = await res.json();
    for (const flight of flights) {
      const opt: HTMLOptionElement = document.createElement("option");
      opt.textContent = `${flight.date}: ${flight.from} - ${flight.to}`;
      opt.value = flight.id;
      flListSelect.appendChild(opt);
    }
  } catch (err) {
    console.error("Error fetching flights:", err);
  }
};

getFlights();

const createPassenger = async (): Promise<void> => {
  const name: string = bookingInp.value;
  const gender: string = getSelectedGender();
  const flight_id: string = flListSelect.value;

  const newPassenger: Passenger = {
    createdAt: new Date().getDate().toString(),
    name,
    gender,
    flight_id,
    agent: myAgentNumber,
  };
  try {
    const res = await fetch(baseUrl + "pasangers", {
      method: "Post",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newPassenger),
    });
    const createdPassenger = await res.json();
    alert(`Passenger created : ${newPassenger.name}`);
    updatePassengerList(flight_id);
  } catch (err) {
    console.log(err);
  }
};

const getPassengersByFlight = async (
  flight_id: string
): Promise<Passenger[]> => {
  try {
    const res = await fetch(baseUrl + "pasangers?flight_id=" + flight_id);
    const passengers: Passenger[] = await res.json();
    return passengers;
  } catch (err) {
    console.log(err);
    return [];
  }
};

const getPassengersByAgentId = async (): Promise<Passenger[]> => {
  try {
    const res = await fetch(baseUrl + "pasangers?agent=" + myAgentNumber);
    const passengers: Passenger[] = await res.json();
    return passengers;
  } catch (err) {
    console.log(err);
    return [];
  }
};

const updatePassengerList = async (flight_id: string): Promise<void> => {
  passengerList.innerHTML = "";
  const passengers = await getPassengersByFlight(flight_id);

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
};

const updateMyPassengerList = async (): Promise<void> => {
  passengerList.innerHTML = "";
  const passengers = await getPassengersByAgentId();

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
};

const getSelectedGender = (): string => {
  const genderInput = document.querySelector(
    'input[name="gender"]:checked'
  ) as HTMLInputElement;
  return genderInput.value;
};

const deletePassenger = async (id: string): Promise<void> => {
  try {
    await fetch(`${baseUrl}pasangers/${id}`, { method: "DELETE" });
    alert("Passenger deleted");
    const flight_id = flListSelect.value;
    updatePassengerList(flight_id);
  } catch (err) {
    console.error("Error deleting passenger:", err);
  }
};

const openEditPopup = (name: string, id: string): void => {
  editName.value = name;
  currentPassengerId = id;
  editPopup.style.display = "block";
};

const closeEditPopup = (): void => {
  editPopup.style.display = "none";
  currentPassengerId = null;
};

const saveEditPassenger = async (): Promise<void> => {
  if (!currentPassengerId) return;

  const updatedName = editName.value;

  try {
    const res = await fetch(`${baseUrl}pasangers/${currentPassengerId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: updatedName }),
    });
    await res.json();
    alert("Passenger updated");
    const flight_id = flListSelect.value;
    updatePassengerList(flight_id);
    closeEditPopup();
  } catch (err) {
    console.log("Error updating passenger:", err);
  }
};

const addEditButton = (li: HTMLLIElement, passenger: Passenger): void => {
  const editButton = document.createElement("button");
  editButton.textContent = "Edit";
  editButton.addEventListener("click", () => {
    openEditPopup(passenger.name, passenger.id!);
  });
  li.appendChild(editButton);
};

const addDeleteButton = (li: HTMLLIElement, passenger: Passenger): void => {
  const delleteButton = document.createElement("button");
  delleteButton.textContent = "Delete";
  delleteButton.addEventListener("click", () => {
    const confirmDelete = confirm(
      `Are you sure you want to delete the ${passenger.name}`
    );
    if (confirmDelete) {
      deletePassenger(passenger.id!);
    }
  });

  li.appendChild(delleteButton);
};

addPassenger.addEventListener("click", (e) => {
  e.preventDefault();
  createPassenger();
});

flListSelect.addEventListener("change", (e) => {
  const selectedFlight = (e.target as HTMLSelectElement).value;
  updatePassengerList(selectedFlight);
});

closePopup.addEventListener("click", closeEditPopup);
saveEdit.addEventListener("click", saveEditPassenger);
myPassengers.addEventListener("click", updateMyPassengerList);

interface Flights {
  date: string;
  from: string;
  to: string;
  id: string;
}
interface Passenger {
  createdAt: string;
  name: string;
  gender: string;
  flight_id: string;
  agent: string;
  id?: string;
}
