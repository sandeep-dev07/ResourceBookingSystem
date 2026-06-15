const REVIEWS_API_BASE_URL = import.meta.env.VITE_REVIEWS_API_URL || "http://localhost:5000";

async function request(endpoint, options = {}) {
  const response = await fetch(`${REVIEWS_API_BASE_URL}${endpoint}`, {
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

export async function fetchReviews() {
  const response = await request("/reviews");
  return response.data || [];
}

export async function createReview(payload) {
  const response = await request("/reviews", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return response.data;
}

export async function updateReview(id, payload) {
  const response = await request(`/reviews/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  return response.data;
}

export async function deleteReview(id) {
  const response = await request(`/reviews/${id}`, {
    method: "DELETE",
  });
  return response;
}
