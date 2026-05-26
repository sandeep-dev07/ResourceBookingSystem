import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { bookRoom, fetchResources } from "../api/backend";
import { getCurrentUser } from "../utils/resourceData";

function getLocalDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function Booking() {
  const navigate = useNavigate();
  const location = useLocation();
  const currentUser = getCurrentUser();

  const [rooms, setRooms] = useState([]);
  const [isLoadingRooms, setIsLoadingRooms] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    roomId: location.state?.selectedRoomId || "",
    date: "",
    startTime: "09:00",
    endTime: "10:00",
    purpose: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!currentUser) {
      navigate("/");
      return;
    }

    const loadRooms = async () => {
      try {
        const resourceList = await fetchResources();
        setRooms(resourceList);

        if (!formData.roomId && resourceList.length > 0) {
          setFormData((prev) => ({
            ...prev,
            roomId: resourceList[0].id,
          }));
        }
      } catch (err) {
        setError(err.message || "Unable to load resources");
      } finally {
        setIsLoadingRooms(false);
      }
    };

    loadRooms();
  }, [currentUser, formData.roomId, navigate]);

  const selectedRoom = rooms.find((room) => String(room.id) === String(formData.roomId)) || rooms[0];

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!currentUser) {
      navigate("/");
      return;
    }

    const { roomId, date, startTime, endTime, purpose } = formData;

    if (!roomId || !date || !startTime || !endTime || !purpose.trim()) {
      setError("Please complete all booking fields.");
      return;
    }

    setIsSubmitting(true);

    try {
      await bookRoom({
        userEmail: currentUser.email,
        resourceId: String(roomId),
        bookingDate: date,
        startTime,
        endTime,
        purpose: purpose.trim(),
      });

      setSuccess("Booking confirmed successfully.");
      setFormData((prev) => ({
        ...prev,
        purpose: "",
      }));
    } catch (err) {
      setError(err.message || "Booking failed");
    } finally {
      setIsSubmitting(false);
    }
  };

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
          <p style={{ color: "#93c5fd", marginBottom: "8px" }}>Booking Page</p>
          <h1 style={{ margin: 0, fontSize: "2rem" }}>
            Professional reservation system
          </h1>
          <p style={{ color: "#cbd5e1", marginTop: "10px", maxWidth: "700px" }}>
            Reserve the selected room by choosing the date, time slot, and meeting
            purpose that best fits your agenda.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.1fr 0.9fr",
            gap: "18px",
            alignItems: "start",
          }}
        >
          <form
            onSubmit={handleSubmit}
            style={{
              backgroundColor: "#111827",
              borderRadius: "20px",
              padding: "24px",
              border: "1px solid rgba(59, 130, 246, 0.28)",
            }}
          >
            <div
              style={{
                marginBottom: "16px",
                padding: "14px 16px",
                borderRadius: "14px",
                backgroundColor: "rgba(37, 99, 235, 0.12)",
                border: "1px solid rgba(59, 130, 246, 0.25)",
              }}
            >
              <p style={{ margin: 0, color: "#93c5fd", fontWeight: "700" }}>
                Selected room
              </p>
              <p style={{ margin: "6px 0 0", color: "white" }}>
                {isLoadingRooms ? "Loading resources..." : selectedRoom?.name || "Select a room"}
              </p>
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", marginBottom: "8px" }}>Date</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                min={getLocalDateString()}
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "12px",
                  border: "1px solid #334155",
                  backgroundColor: "#0f172a",
                  color: "white",
                }}
              />
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "12px",
                marginBottom: "16px",
              }}
            >
              <div>
                <label style={{ display: "block", marginBottom: "8px" }}>
                  Start Time
                </label>
                <input
                  type="time"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleChange}
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "12px",
                    border: "1px solid #334155",
                    backgroundColor: "#0f172a",
                    color: "white",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "8px" }}>
                  End Time
                </label>
                <input
                  type="time"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleChange}
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "12px",
                    border: "1px solid #334155",
                    backgroundColor: "#0f172a",
                    color: "white",
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", marginBottom: "8px" }}>
                Purpose
              </label>
              <textarea
                name="purpose"
                rows={4}
                value={formData.purpose}
                onChange={handleChange}
                placeholder="Explain the meeting purpose"
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "12px",
                  border: "1px solid #334155",
                  backgroundColor: "#0f172a",
                  color: "white",
                  resize: "vertical",
                }}
              />
            </div>

            {error ? (
              <p style={{ color: "#fca5a5", marginBottom: "16px" }}>{error}</p>
            ) : null}

            {success ? (
              <p style={{ color: "#86efac", marginBottom: "16px" }}>{success}</p>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting || isLoadingRooms}
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: "12px",
                border: "none",
                backgroundColor: isSubmitting || isLoadingRooms ? "#1d4ed8" : "#2563eb",
                color: "white",
                fontWeight: "700",
                cursor: isSubmitting || isLoadingRooms ? "not-allowed" : "pointer",
              }}
            >
              {isSubmitting ? "Saving booking..." : "Confirm Booking"}
            </button>
          </form>

          <div
            style={{
              backgroundColor: "#111827",
              borderRadius: "20px",
              padding: "24px",
              border: "1px solid rgba(59, 130, 246, 0.28)",
            }}
          >
            <p style={{ color: "#93c5fd", marginTop: 0 }}>Booking Summary</p>
            <h2 style={{ marginTop: 0 }}>
              {selectedRoom ? selectedRoom.name : "No room selected"}
            </h2>
            <p style={{ color: "#cbd5e1" }}>
              {selectedRoom
                ? `${selectedRoom.capacity} seats • ${selectedRoom.location}`
                : "Choose a room from the resources page to begin your booking."}
            </p>
            <p style={{ color: "#cbd5e1" }}>
              Your booking is saved in the real backend and protected with overlap checks.
            </p>
            <div
              style={{
                marginTop: "18px",
                padding: "14px 16px",
                borderRadius: "14px",
                backgroundColor: "rgba(59, 130, 246, 0.12)",
                border: "1px solid rgba(59, 130, 246, 0.25)",
              }}
            >
              <p style={{ margin: 0, color: "#93c5fd", fontWeight: "700" }}>
                Need help?
              </p>
              <p style={{ margin: "8px 0 0", color: "white" }}>
                Review room details on the resources page, then return here to confirm your booking.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Booking;
