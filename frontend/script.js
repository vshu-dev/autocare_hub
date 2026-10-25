const API = "http://localhost:5000/api";
  if (data._id) {
    alert("Service booked successfully");
  }


function checkAdmin() {
  if (currentUser && currentUser.isAdmin) {
    document.getElementById("adminSection").classList.remove("hidden");
    fetchBookings();
  }
}

async function addService() {
  const serviceName = document.getElementById("serviceName").value;
  const price = document.getElementById("servicePrice").value;
  const image = document.getElementById("serviceImage").value;
  const description = document.getElementById("serviceDescription").value;

  const res = await fetch(`${API}/services/add`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token
    },
    body: JSON.stringify({
      serviceName,
      price,
      image,
      description
    })
  });

  const data = await res.json();

  alert("Service Added");

  fetchServices();
}

async function fetchBookings() {
  const res = await fetch(`${API}/bookings/all`, {
    headers: {
      Authorization: token
    }
  });

  const bookings = await res.json();

  const container = document.getElementById("bookingsContainer");

  container.innerHTML = "";

  bookings.forEach(item => {
    container.innerHTML += `
      <div class="booking-item">
        <h4>${item.userName}</h4>
        <p>Vehicle Number: ${item.vehicleNumber}</p>
        <p>Vehicle Brand: ${item.vehicleBrand}</p>
        <p>Service: ${item.selectedService}</p>
        <p>Date: ${item.bookingDate}</p>
      </div>
    `;
  });
}

fetchServices();
checkAdmin();