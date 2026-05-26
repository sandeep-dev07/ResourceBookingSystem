import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchResources } from "../api/backend";
import { getCurrentUser } from "../utils/resourceData";

function Resources() {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadResources = async () => {
      try {
        const resourceList = await fetchResources();
        setRooms(resourceList);
      } catch (err) {
        setError(err.message || "Unable to load resources");
      } finally {
        setLoading(false);
      }
    };

    loadResources();
  }, []);

  return (
    <div
      style={{
        padding: "32px 24px 48px",
        color: "white",
        minHeight: "calc(100vh - 72px)",
        background: "linear-gradient(180deg, #0f172a 0%, #111827 100%)",
      }}
    >
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <div style={{ marginBottom: "28px" }}>
          <p style={{ color: "#93c5fd", marginBottom: "8px" }}>Resources Page</p>
          <h1 style={{ margin: 0, fontSize: "2rem" }}>Book the right room for every meeting</h1>
          <p style={{ color: "#cbd5e1", maxWidth: "760px", marginTop: "10px" }}>
            Explore room capacity, features, and availability to find a space that
            fits your meeting style.
          </p>
        </div>

        {loading ? (
          <p style={{ color: "#cbd5e1" }}>Loading resources from the backend...</p>
        ) : error ? (
          <p style={{ color: "#fca5a5" }}>{error}</p>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "18px",
            }}
          >
            {rooms.map((room) => {
              const isBooked = room.status === "BOOKED";
              const nextBooking = room.nextBooking;
              const isCurrentUserBooking =
                nextBooking?.userEmail === currentUser?.email;
              const features = [
                room.projector ? "Projector" : null,
                room.wifi ? "WiFi" : null,
                room.ac ? "AC" : null,
              ].filter(Boolean);

              return (
                <div
                  key={room.id}
                  style={{
                    backgroundColor: "#111827",
                    borderRadius: "20px",
                    overflow: "hidden",
                    border: "1px solid rgba(59, 130, 246, 0.28)",
                  }}
                >
                  <img
                    src={room.imageUrl}
                    alt={room.name}
                    style={{ width: "100%", height: "180px", objectFit: "cover" }}
                  />

                  <div style={{ padding: "20px" }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: "12px",
                        alignItems: "start",
                      }}
                    >
                      <div>
                        <h2 style={{ margin: "0 0 8px", fontSize: "1.2rem" }}>
                          {room.name}
                        </h2>
                        <p style={{ color: "#cbd5e1", margin: 0 }}>
                          Capacity: {room.capacity}
                        </p>
                      </div>

                      <span
                        style={{
                          padding: "6px 10px",
                          borderRadius: "999px",
                          fontSize: "0.85rem",
                          fontWeight: "700",
                          backgroundColor: isBooked
                            ? "rgba(248, 113, 113, 0.18)"
                            : "rgba(34, 197, 94, 0.18)",
                          color: isBooked ? "#fca5a5" : "#86efac",
                        }}
                      >
                        {room.status === "BOOKED" ? "Booked" : "Available"}
                      </span>
                    </div>

                    <p style={{ color: "#cbd5e1", margin: "12px 0" }}>
                      Location: {room.location}
                    </p>

                    <p style={{ color: "#e2e8f0", margin: "8px 0" }}>
                      Features: {features.join(" • ")}
                    </p>

                    {isBooked && nextBooking && !isCurrentUserBooking ? (
                      <p style={{ color: "#fca5a5", margin: "8px 0 12px" }}>
                        Booked by {nextBooking.userName} • {nextBooking.date} {nextBooking.startTime} - {nextBooking.endTime}
                      </p>
                    ) : isBooked ? (
                      <p style={{ color: "#fca5a5", margin: "8px 0 12px" }}>
                        This room is booked for your upcoming meeting.
                      </p>
                    ) : (
                      <p style={{ color: "#86efac", margin: "8px 0 12px" }}>
                        Available for booking.
                      </p>
                    )}

                    {isBooked && (
                      <p style={{ color: "#cbd5e1", margin: "0 0 12px" }}>
                        You can still book a different time slot for this room.
                      </p>
                    )}

                    <button
                      type="button"
                      onClick={() =>
                        navigate("/booking", { state: { selectedRoomId: room.id } })
                      }
                      style={{
                        marginTop: "10px",
                        width: "100%",
                        padding: "12px",
                        borderRadius: "12px",
                        border: "none",
                        backgroundColor: "#2563eb",
                        color: "white",
                        fontWeight: "700",
                        cursor: "pointer",
                      }}
                    >
                      Book Now
                    </button>
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

export default Resources;
