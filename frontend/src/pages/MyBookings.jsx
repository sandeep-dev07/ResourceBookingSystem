 import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { cancelBooking, fetchMyBookings } from "../api/backend";
import { getCurrentUser } from "../utils/resourceData";

function getLocalDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getCurrentLocalTimeString(date = new Date()) {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${hours}:${minutes}`;
}

function isBookingCompleted(booking) {
  if (!booking?.date || !booking?.endTime) {
    return false;
  }

  const today = getLocalDateString();
  const now = getCurrentLocalTimeString();

  if (booking.date < today) {
    return true;
  }

  if (booking.date > today) {
    return false;
  }

  return booking.endTime <= now;
}

function getBookingStatusLabel(booking) {
  if (isBookingCompleted(booking)) {
    return "Completed";
  }

  return booking?.status || "CONFIRMED";
}

function MyBookings() {
  const currentUser = getCurrentUser();

  const [bookings, setBookings] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser?.email) {
      setLoading(false);
      return;
    }

    const loadBookings = async () => {
      setError("");

      try {
        const response = await fetchMyBookings(currentUser.email);
        setBookings(response);
      } catch (err) {
        setError(err.message || "Unable to load bookings");
      } finally {
        setLoading(false);
      }
    };

    loadBookings();
  }, [currentUser]);

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) {
      return;
    }

    if (!currentUser?.email) {
      return;
    }

    try {
      await cancelBooking(bookingId, currentUser.email);

      setMessage("Booking cancelled successfully.");

      const response = await fetchMyBookings(currentUser.email);

      setBookings(response);
    } catch (err) {
      setError(err.message || "Unable to cancel booking");
    }
  };

  const sortedBookings = [...bookings].sort((firstBooking, secondBooking) => {
    const firstCompleted = isBookingCompleted(firstBooking);
    const secondCompleted = isBookingCompleted(secondBooking);

    if (firstCompleted !== secondCompleted) {
      return firstCompleted ? 1 : -1;
    }

    const firstSortKey = `${firstBooking.date}T${firstBooking.startTime}`;
    const secondSortKey = `${secondBooking.date}T${secondBooking.startTime}`;

    return firstSortKey.localeCompare(secondSortKey);
  });

  return (
    <div
      style={{
        padding: "32px 24px 48px",
        color: "white",
        minHeight: "calc(100vh - 72px)",
        background: "linear-gradient(180deg, #0f172a 0%, #111827 100%)",
      }}
    >
      <div style={{ maxWidth: "960px", margin: "0 auto" }}>
        <div style={{ marginBottom: "24px" }}>
          <p style={{ color: "#93c5fd", marginBottom: "8px" }}>
            My Bookings
          </p>

          <h1 style={{ margin: 0, fontSize: "2rem" }}>
            Your reservations
          </h1>

          <p style={{ color: "#cbd5e1", marginTop: "10px" }}>
            Track your upcoming meetings and completed room events in one place.
          </p>
        </div>

        {message && (
          <div
            style={{
              marginBottom: "16px",
              padding: "12px 16px",
              borderRadius: "14px",
              backgroundColor: "rgba(34, 197, 94, 0.18)",
              color: "#86efac",
              border: "1px solid rgba(34, 197, 94, 0.28)",
            }}
          >
            {message}
          </div>
        )}

        {error && (
          <div
            style={{
              marginBottom: "16px",
              padding: "12px 16px",
              borderRadius: "14px",
              backgroundColor: "rgba(248, 113, 113, 0.18)",
              color: "#fca5a5",
              border: "1px solid rgba(248, 113, 113, 0.28)",
            }}
          >
            {error}
          </div>
        )}

        {!currentUser ? (
          <div
            style={{
              backgroundColor: "#111827",
              padding: "24px",
              borderRadius: "20px",
              border: "1px solid rgba(248, 113, 113, 0.28)",
            }}
          >
            <p>Please log in to view your bookings.</p>

            <Link
              to="/"
              style={{
                color: "#93c5fd",
                textDecoration: "none",
                fontWeight: "700",
              }}
            >
              Go to login
            </Link>
          </div>
        ) : loading ? (
          <p style={{ color: "#cbd5e1" }}>
            Loading bookings from the backend...
          </p>
        ) : sortedBookings.length === 0 ? (
          <div
            style={{
              backgroundColor: "#111827",
              padding: "24px",
              borderRadius: "20px",
              border: "1px solid rgba(59, 130, 246, 0.28)",
            }}
          >
            <h2>No bookings found</h2>

            <p style={{ color: "#cbd5e1" }}>
              You don&apos;t have any bookings yet.
            </p>

            <Link
              to="/resources"
              style={{
                color: "#93c5fd",
                textDecoration: "none",
                fontWeight: "700",
              }}
            >
              Browse rooms
            </Link>
          </div>
        ) : (
          <div style={{ display: "grid", gap: "16px" }}>
            {sortedBookings.map((booking) => {
              const completed = isBookingCompleted(booking);

              return (
                <div
                  key={booking.id}
                  style={{
                    backgroundColor: "#111827",
                    borderRadius: "20px",
                    padding: "22px",
                    border: "1px solid rgba(59, 130, 246, 0.28)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: "16px",
                      flexWrap: "wrap",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <h2 style={{ margin: "0 0 8px" }}>
                        {booking.roomName}
                      </h2>

                      <p style={{ color: "#cbd5e1", margin: 0 }}>
                        {booking.date} • {booking.startTime} - {booking.endTime}
                      </p>

                      <p style={{ color: "#e2e8f0", margin: "8px 0 0" }}>
                        Purpose: {booking.purpose}
                      </p>

                      {completed && (
                        <p
                          style={{
                            color: "#86efac",
                            margin: "10px 0 0",
                            fontWeight: "700",
                          }}
                        >
                          Event completed
                        </p>
                      )}
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        flexWrap: "wrap",
                      }}
                    >
                      <span
                        style={{
                          padding: "8px 12px",
                          borderRadius: "999px",
                          backgroundColor: completed
                            ? "rgba(249, 115, 22, 0.18)"
                            : "rgba(34, 197, 94, 0.18)",
                          color: completed ? "#fdba74" : "#86efac",
                          fontWeight: "700",
                        }}
                      >
                        {getBookingStatusLabel(booking)}
                      </span>

                      {!completed && (
                        <button
                          type="button"
                          onClick={() => handleCancelBooking(booking.id)}
                          style={{
                            backgroundColor: "#ef4444",
                            color: "white",
                            border: "none",
                            borderRadius: "999px",
                            padding: "10px 14px",
                            fontWeight: "700",
                            cursor: "pointer",
                          }}
                        >
                          Cancel Booking
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyBookings;