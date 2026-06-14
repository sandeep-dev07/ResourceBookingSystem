import { normalizeBooking } from "../utils/resourceData";

const API_BASE_URL = "http://localhost:8080";

async function request(endpoint, options = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  const contentType = response.headers.get("content-type") || "";
  const responseData = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const message = typeof responseData === "string"
      ? responseData
      : responseData?.message || "Request failed";
    throw new Error(message);
  }

  return responseData;
}

export async function registerUser(payload) {
  return request("/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function loginUser(payload) {
  return request("/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function fetchResources() {
  return request("/resources");
}

export async function bookRoom(payload) {
  return request("/book-room", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function fetchAllBookings() {
  const response = await request("/bookings");
  return response.map((booking) => normalizeBooking(booking));
}

export async function fetchMyBookings(email) {
  return request(`/my-bookings?email=${encodeURIComponent(email)}`);
}

export async function cancelBooking(bookingId, email) {
  return request(`/bookings/${bookingId}?email=${encodeURIComponent(email)}`, {
    method: "DELETE",
  });
}

export async function scheduleMaintenance(payload) {
  return request("/maintenance/schedule", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function fetchAllMaintenance() {
  return request("/maintenance/all");
}

export async function fetchMaintenanceByResource(resourceId) {
  return request(`/maintenance/resource/${resourceId}`);
}

export async function fetchMaintenanceByResourceAndDate(resourceId, date) {
  return request(`/maintenance/resource/${resourceId}/date?date=${date}`);
}

export async function cancelMaintenance(maintenanceId) {
  return request(`/maintenance/${maintenanceId}/cancel`, {
    method: "PUT",
  });
}

export async function completeMaintenance(maintenanceId) {
  return request(`/maintenance/${maintenanceId}/complete`, {
    method: "PUT",
  });
}
