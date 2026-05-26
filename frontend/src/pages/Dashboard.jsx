import { useState } from "react";
import { Link } from "react-router-dom";
import {
  getAverageReview,
  getBookings,
  getCurrentUser,
  getReviews,
  getRooms,
  getRoomStatus,
  getUpcomingUserBookings,
  saveReviews,
} from "../utils/resourceData";

function Dashboard({ roleLabel } = {}) {
  const currentUser = getCurrentUser();
  const effectiveRole = roleLabel || currentUser?.role || "User";
  const roleConfig = {
    Admin: {
      title: "Admin",
      description:
        "Monitor the platform, review bookings, and keep resource operations running smoothly.",
    },
    Manager: {
      title: "Manager",
      description:
        "Coordinate team schedules, review room usage, and keep your department on track.",
    },
    User: {
      title: "User",
      description:
        "Manage your meeting rooms, view availability, and keep every booking on schedule.",
    },
  };

  const roleCopy = roleConfig[effectiveRole] || roleConfig.User;
  const rooms = getRooms();
  const bookings = getBookings();
  const userBookings = getUpcomingUserBookings(currentUser?.email || "", bookings);
  const totalRooms = rooms.length;
  const availableRooms = rooms.filter(
    (room) => getRoomStatus(room.id, bookings) === "Available"
  ).length;

  const [reviews, setReviews] = useState(() => getReviews());
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [message, setMessage] = useState("");
  const [messageTone, setMessageTone] = useState("success");

  const nextBooking = userBookings[0];
  const averageReview = getAverageReview(reviews);
  const reviewCount = reviews.length;

  const handleReviewSubmit = (event) => {
    event.preventDefault();

    if (!currentUser) {
      setMessageTone("error");
      setMessage("Please log in to submit a review.");
      return;
    }

    if (!comment.trim()) {
      setMessageTone("error");
      setMessage("Please enter a review before submitting.");
      return;
    }

    const newReview = {
      id: `${Date.now()}`,
      userName: currentUser.fullName || currentUser.email,
      userEmail: currentUser.email,
      rating,
      comment: comment.trim(),
      createdAt: new Date().toISOString(),
    };

    const updatedReviews = [newReview, ...reviews];
    saveReviews(updatedReviews);
    setReviews(updatedReviews);
    setRating(5);
    setComment("");
    setMessageTone("success");
    setMessage("Thanks for sharing your feedback!");
  };

  const renderStars = (value) =>
    Array.from({ length: 5 }, (_, index) => (
      <span
        key={`${value}-${index}`}
        style={{
          color: index < value ? "#facc15" : "#475569",
          fontSize: "1.35rem",
          cursor: "pointer",
        }}
        onClick={() => setRating(index + 1)}
      >
        ★
      </span>
    ));

  return (
    <div
      style={{
        padding: "32px 24px 48px",
        color: "white",
        minHeight: "calc(100vh - 72px)",
        background:
          "radial-gradient(circle at top left, rgba(37, 99, 235, 0.28), transparent 18%), #0f172a",
      }}
    >
      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "24px",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <div>
            <p style={{ color: "#93c5fd", marginBottom: "8px" }}>
              Welcome {roleCopy.title} 👋
            </p>
            <h1 style={{ fontSize: "2rem", margin: 0 }}>
              {currentUser?.fullName || currentUser?.email || "Guest"}
            </h1>
            <p style={{ color: "#cbd5e1", marginTop: "10px", maxWidth: "640px" }}>
              {roleCopy.description}
            </p>
          </div>

          <div
            style={{
              background: "linear-gradient(135deg, #1d4ed8, #0f172a)",
              padding: "20px 24px",
              borderRadius: "20px",
              minWidth: "260px",
              boxShadow: "0 18px 40px rgba(15, 23, 42, 0.35)",
            }}
          >
            <p style={{ margin: 0, color: "#bfdbfe" }}>Next reservation</p>
            {nextBooking ? (
              <div>
                <h2 style={{ margin: "10px 0 6px", fontSize: "1.25rem" }}>
                  {nextBooking.roomName}
                </h2>
                <p style={{ margin: 0, color: "#e2e8f0" }}>
                  {nextBooking.date} • {nextBooking.startTime} - {nextBooking.endTime}
                </p>
              </div>
            ) : (
              <p style={{ margin: "12px 0 0", color: "#e2e8f0" }}>
                No upcoming reservations yet.
              </p>
            )}
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "18px",
            marginTop: "28px",
          }}
        >
          {[
            { title: "Total Rooms", value: totalRooms, tone: "#93c5fd" },
            { title: "Available Rooms", value: availableRooms, tone: "#86efac" },
            { title: "My Active Bookings", value: userBookings.length, tone: "#f9a8d4" },
            { title: "Upcoming Reservations", value: userBookings.length, tone: "#fde68a" },
          ].map((item) => (
            <div
              key={item.title}
              style={{
                backgroundColor: "#111827",
                borderRadius: "18px",
                padding: "22px",
                border: `1px solid ${item.tone}`,
              }}
            >
              <p style={{ color: "#cbd5e1", margin: 0 }}>{item.title}</p>
              <h2 style={{ fontSize: "2rem", margin: "12px 0 0" }}>{item.value}</h2>
            </div>
          ))}
        </div>

        <div
          style={{
            marginTop: "28px",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "18px",
          }}
        >
          <Link
            to="/resources"
            style={{
              textDecoration: "none",
              color: "white",
              backgroundColor: "#0f172a",
              padding: "24px",
              borderRadius: "18px",
              border: "1px solid rgba(59, 130, 246, 0.4)",
            }}
          >
            <h3 style={{ marginTop: 0 }}>Book Room</h3>
            <p style={{ color: "#cbd5e1", marginBottom: 0 }}>
              Browse available meeting rooms and reserve the best fit for your team.
            </p>
          </Link>

          <Link
            to="/resources"
            style={{
              textDecoration: "none",
              color: "white",
              backgroundColor: "#0f172a",
              padding: "24px",
              borderRadius: "18px",
              border: "1px solid rgba(14, 165, 233, 0.4)",
            }}
          >
            <h3 style={{ marginTop: 0 }}>View Availability</h3>
            <p style={{ color: "#cbd5e1", marginBottom: 0 }}>
              Check which rooms are open and choose your preferred time slot.
            </p>
          </Link>

          <Link
            to="/my-bookings"
            style={{
              textDecoration: "none",
              color: "white",
              backgroundColor: "#0f172a",
              padding: "24px",
              borderRadius: "18px",
              border: "1px solid rgba(20, 184, 166, 0.4)",
            }}
          >
            <h3 style={{ marginTop: 0 }}>My Bookings</h3>
            <p style={{ color: "#cbd5e1", marginBottom: 0 }}>
              Review your current reservations and keep track of upcoming meetings.
            </p>
          </Link>
        </div>

        <div
          style={{
            marginTop: "28px",
            display: "grid",
            gridTemplateColumns: "1fr 1.5fr",
            gap: "18px",
            alignItems: "start",
          }}
        >
          {/* Schedule Card */}
          <div
            style={{
              backgroundColor: "#111827",
              borderRadius: "24px",
              padding: "24px",
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
                marginBottom: "18px",
              }}
            >
              <div>
                <p style={{ color: "#93c5fd", margin: 0 }}>Booking schedule</p>
                <h2 style={{ margin: "8px 0 0" }}>Your upcoming events</h2>
                <p style={{ color: "#cbd5e1", margin: "8px 0 0" }}>
                  A quick overview of your confirmed bookings and meeting times.
                </p>
              </div>
              <div
                style={{
                  padding: "10px 14px",
                  borderRadius: "999px",
                  backgroundColor: "rgba(59, 130, 246, 0.16)",
                  color: "#bfdbfe",
                  fontWeight: "700",
                }}
              >
                {userBookings.length} upcoming event{userBookings.length === 1 ? "" : "s"}
              </div>
            </div>

            {!currentUser ? (
              <div
                style={{
                  backgroundColor: "rgba(15, 23, 42, 0.9)",
                  borderRadius: "18px",
                  padding: "18px 20px",
                  border: "1px solid rgba(248, 113, 113, 0.24)",
                }}
              >
                <p style={{ margin: 0, color: "#fca5a5" }}>
                  Log in to view your personal booking schedule.
                </p>
              </div>
            ) : userBookings.length === 0 ? (
              <div
                style={{
                  backgroundColor: "rgba(15, 23, 42, 0.9)",
                  borderRadius: "18px",
                  padding: "18px 20px",
                  border: "1px solid rgba(59, 130, 246, 0.28)",
                }}
              >
                <p style={{ margin: 0, color: "#cbd5e1" }}>
                  You do not have any upcoming bookings right now. Head to the booking page to reserve a room.
                </p>
              </div>
            ) : (
              <div style={{ display: "grid", gap: "12px" }}>
                {userBookings.map((booking) => (
                  <div
                    key={booking.id}
                    style={{
                      backgroundColor: "rgba(15, 23, 42, 0.92)",
                      borderRadius: "18px",
                      padding: "18px 20px",
                      border: "1px solid rgba(59, 130, 246, 0.26)",
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
                        <h3 style={{ margin: "0 0 6px" }}>{booking.roomName}</h3>
                        <p style={{ margin: 0, color: "#cbd5e1" }}>
                          {booking.date} • {booking.startTime} - {booking.endTime}
                        </p>
                        <p style={{ margin: "8px 0 0", color: "#e2e8f0" }}>
                          Purpose: {booking.purpose}
                        </p>
                      </div>
                      <div
                        style={{
                          minWidth: "110px",
                          textAlign: "right",
                        }}
                      >
                        <p style={{ margin: 0, color: "#86efac", fontWeight: "700" }}>
                          {booking.status}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Review Card (wider) */}
          <div
            style={{
              background: "linear-gradient(135deg, rgba(59, 130, 246, 0.22), rgba(15, 23, 42, 0.92))",
              borderRadius: "24px",
              padding: "32px 32px 28px 32px",
              border: "1px solid rgba(96, 165, 250, 0.3)",
              minWidth: 0,
            }}
          >
            <div style={{ marginBottom: "24px" }}>
              <p style={{ color: "#93c5fd", marginBottom: "8px" }}>Customer reviews</p>
              <h2 style={{ margin: "0 0 8px", fontSize: "2.1rem" }}>
                {averageReview.toFixed(1)} / 5
              </h2>
              <p style={{ color: "#cbd5e1", marginTop: 0 }}>
                Based on {reviewCount} customer review{reviewCount === 1 ? "" : "s"}
              </p>
              <div style={{ marginTop: "12px", display: "flex", gap: "4px" }}>
                {renderStars(Math.round(averageReview))}
              </div>
              <p style={{ color: "#e2e8f0", marginTop: "12px", lineHeight: 1.7 }}>
                Hear from teams using our booking platform and share your experience.
              </p>
            </div>
            <div style={{ marginBottom: "0" }}>
              <h2 style={{ margin: "0 0 6px" }}>Leave a review</h2>
              <p style={{ color: "#cbd5e1", margin: 0 }}>
                Share your experience and rate the room booking experience.
              </p>
              {message ? (
                <div
                  style={{
                    marginBottom: "14px",
                    padding: "10px 12px",
                    borderRadius: "14px",
                    backgroundColor:
                      messageTone === "error"
                        ? "rgba(248, 113, 113, 0.18)"
                        : "rgba(34, 197, 94, 0.18)",
                    color: messageTone === "error" ? "#fca5a5" : "#86efac",
                    border:
                      messageTone === "error"
                        ? "1px solid rgba(248, 113, 113, 0.28)"
                        : "1px solid rgba(34, 197, 94, 0.28)",
                  }}
                >
                  {message}
                </div>
              ) : null}
              <form onSubmit={handleReviewSubmit}>
                <div style={{ marginBottom: "14px" }}>
                  <p style={{ margin: "0 0 8px", color: "#e2e8f0" }}>Your rating</p>
                  <div style={{ display: "flex", gap: "6px" }}>{renderStars(rating)}</div>
                </div>
                <label
                  style={{
                    display: "block",
                    color: "#e2e8f0",
                    marginBottom: "8px",
                    fontWeight: "700",
                  }}
                >
                  Your feedback
                </label>
                <textarea
                  value={comment}
                  onChange={(event) => setComment(event.target.value)}
                  placeholder={
                    currentUser
                      ? "Tell us how your booking experience was..."
                      : "Log in to share your experience"
                  }
                  disabled={!currentUser}
                  rows={5}
                  style={{
                    width: "100%",
                    resize: "vertical",
                    borderRadius: "14px",
                    border: "1px solid rgba(96, 165, 250, 0.4)",
                    backgroundColor: "#0f172a",
                    color: "white",
                    padding: "12px",
                    boxSizing: "border-box",
                    marginBottom: "14px",
                  }}
                />
                <button
                  type="submit"
                  disabled={!currentUser}
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    borderRadius: "999px",
                    border: "none",
                    backgroundColor: currentUser ? "#2563eb" : "#334155",
                    color: "white",
                    fontWeight: "700",
                    cursor: currentUser ? "pointer" : "not-allowed",
                  }}
                >
                  {currentUser ? "Submit review" : "Login to submit review"}
                </button>
              </form>
            </div>
          </div>
        </div>

        <div
          style={{
            marginTop: "28px",
            display: "grid",
            gap: "16px",
          }}
        >
          {reviews.map((review) => (
            <div
              key={review.id}
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
                  <h3 style={{ margin: "0 0 6px" }}>{review.userName}</h3>
                  <p style={{ margin: 0, color: "#cbd5e1" }}>
                    {new Date(review.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <div style={{ display: "flex", gap: "4px" }}>
                  {Array.from({ length: 5 }, (_, index) => (
                    <span
                      key={`${review.id}-${index}`}
                      style={{
                        color: index < review.rating ? "#facc15" : "#475569",
                        fontSize: "1.1rem",
                      }}
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>
              <p style={{ color: "#e2e8f0", marginBottom: 0, marginTop: "14px", lineHeight: 1.7 }}>
                “{review.comment}”
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;