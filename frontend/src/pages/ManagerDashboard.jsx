import { useEffect, useMemo, useState } from "react";
import { fetchAllBookings } from "../api/backend";
import {
  getBookings,
  getCurrentUser,
  getMaintenanceRooms,
  getRooms,
  getRoomStatus,
  saveBookings,
} from "../utils/resourceData";

const sectionButtons = [
  { key: "dashboard", label: "Dashboard" },
  { key: "manage-bookings", label: "Manage Bookings" },
  { key: "availability", label: "Availability" },
  { key: "reports", label: "Reports" },
];

function getLocalDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function ManagerDashboard({ defaultSection = "dashboard" }) {
  const currentUser = getCurrentUser();
  const [activeSection, setActiveSection] = useState(defaultSection);
  const [bookings, setBookings] = useState(() => getBookings());
  const [message, setMessage] = useState("");
  const [messageTone, setMessageTone] = useState("success");

  useEffect(() => {
    setActiveSection(defaultSection);
  }, [defaultSection]);

  useEffect(() => {
    let isMounted = true;

    const loadBookings = async () => {
      try {
        const backendBookings = await fetchAllBookings();

        if (!isMounted) {
          return;
        }

        saveBookings(backendBookings);
        setBookings(backendBookings);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setBookings(getBookings());
      }
    };

    loadBookings();

    return () => {
      isMounted = false;
    };
  }, []);

  const rooms = getRooms();
  const maintenanceRooms = getMaintenanceRooms();
  const today = getLocalDateString();

  const pendingBookings = bookings.filter((booking) => booking.status === "Pending");
  const todayBookings = bookings
    .filter((booking) => booking.date === today && booking.status !== "Rejected")
    .sort(
      (a, b) =>
        new Date(`${a.date}T${a.startTime}:00`) -
        new Date(`${b.date}T${b.startTime}:00`)
    );

  const upcomingRoomBookings = rooms.map((room) => {
    const roomBookings = bookings
      .filter((booking) => booking.roomId === room.id && booking.status !== "Rejected")
      .filter((booking) => booking.date >= today)
      .sort(
        (a, b) =>
          new Date(`${a.date}T${a.startTime}:00`) -
          new Date(`${b.date}T${b.startTime}:00`)
      );

    return {
      room,
      roomBookings,
      status: getRoomStatus(room.id, bookings),
    };
  });

  const availableRooms = upcomingRoomBookings.filter((item) => item.status === "Available").length;
  const occupiedRooms = rooms.filter(
    (room) => getRoomStatus(room.id, bookings) === "Booked" || getRoomStatus(room.id, bookings) === "Occupied"
  ).length;
  const maintenanceCount = maintenanceRooms.length;

  const conflictAlerts = useMemo(() => {
    const sortedBookings = bookings
      .filter((booking) => booking.status !== "Rejected")
      .sort(
        (a, b) =>
          new Date(`${a.date}T${a.startTime}:00`) -
          new Date(`${b.date}T${b.startTime}:00`)
      );

    const alerts = [];

    for (let index = 0; index < sortedBookings.length; index += 1) {
      const first = sortedBookings[index];

      for (let nextIndex = index + 1; nextIndex < sortedBookings.length; nextIndex += 1) {
        const second = sortedBookings[nextIndex];

        if (first.roomId !== second.roomId || first.date !== second.date) {
          continue;
        }

        const firstStart = new Date(`${first.date}T${first.startTime}:00`);
        const firstEnd = new Date(`${first.date}T${first.endTime}:00`);
        const secondStart = new Date(`${second.date}T${second.startTime}:00`);
        const secondEnd = new Date(`${second.date}T${second.endTime}:00`);

        if (firstStart < secondEnd && secondStart < firstEnd) {
          alerts.push({
            id: `${first.id}-${second.id}`,
            roomName: first.roomName,
            message: `${first.roomName} double-booking attempt detected between ${first.startTime} and ${first.endTime}`,
            bookings: [first, second],
          });
        }
      }
    }

    return alerts;
  }, [bookings]);

  const analytics = useMemo(() => {
    const roomCounts = rooms.map((room) => ({
      roomId: room.id,
      roomName: room.name,
      count: bookings.filter((booking) => booking.roomId === room.id && booking.status !== "Rejected").length,
    }));

    const sortedRooms = [...roomCounts].sort((a, b) => b.count - a.count);
    const hourCounts = bookings.reduce((accumulator, booking) => {
      accumulator[booking.startTime] = (accumulator[booking.startTime] || 0) + 1;
      return accumulator;
    }, {});
    const peakHour = Object.entries(hourCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "—";

    return {
      mostBookedRoom: sortedRooms[0]?.roomName || "No bookings yet",
      peakHour,
      occupancyPercent: rooms.length ? Math.round((occupiedRooms / rooms.length) * 100) : 0,
    };
  }, [bookings, occupiedRooms, rooms]);

  const approveBooking = (bookingId) => {
    const updatedBookings = bookings.map((booking) =>
      booking.id === bookingId ? { ...booking, status: "Confirmed" } : booking
    );

    saveBookings(updatedBookings);
    setBookings(updatedBookings);
    setMessageTone("success");
    setMessage("Booking approved and moved into confirmed status.");
  };

  const rejectBooking = (bookingId) => {
    const updatedBookings = bookings.map((booking) =>
      booking.id === bookingId ? { ...booking, status: "Rejected" } : booking
    );

    saveBookings(updatedBookings);
    setBookings(updatedBookings);
    setMessageTone("error");
    setMessage("Booking rejected and removed from the approval queue.");
  };

  const PanelCard = ({ title, value, tone = "#93c5fd" }) => (
    <div
      style={{
        backgroundColor: "#111827",
        borderRadius: "20px",
        padding: "20px",
        border: `1px solid ${tone}`,
      }}
    >
      <p style={{ color: "#cbd5e1", marginTop: 0, marginBottom: "10px" }}>{title}</p>
      <h2 style={{ margin: 0, fontSize: "1.8rem" }}>{value}</h2>
    </div>
  );

  const sectionContent = {
    "manage-bookings": (
      <div style={{ display: "grid", gap: "16px" }}>
        {message ? (
          <div
            style={{
              padding: "12px 16px",
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

        <div
          style={{
            backgroundColor: "#111827",
            borderRadius: "22px",
            padding: "24px",
            border: "1px solid rgba(248, 113, 113, 0.2)",
          }}
        >
          <p style={{ color: "#93c5fd", marginTop: 0 }}>Pending Booking Requests</p>
          <h2 style={{ marginTop: "6px", marginBottom: "18px" }}>Approve or reject booking requests</h2>

          {pendingBookings.length === 0 ? (
            <p style={{ color: "#cbd5e1", margin: 0 }}>
              No pending booking requests right now.
            </p>
          ) : (
            <div style={{ display: "grid", gap: "14px" }}>
              {pendingBookings.map((booking) => (
                <div
                  key={booking.id}
                  style={{
                    backgroundColor: "rgba(15, 23, 42, 0.95)",
                    borderRadius: "18px",
                    padding: "18px",
                    border: "1px solid rgba(248, 113, 113, 0.18)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: "18px",
                      flexWrap: "wrap",
                    }}
                  >
                    <div>
                      <h3 style={{ margin: "0 0 6px" }}>{booking.roomName}</h3>
                      <p style={{ margin: 0, color: "#cbd5e1" }}>
                        Requested by {booking.userName}
                      </p>
                      <p style={{ margin: "6px 0 0", color: "#e2e8f0" }}>
                        {booking.date} • {booking.startTime} - {booking.endTime}
                      </p>
                      <p style={{ margin: "8px 0 0", color: "#fef3c7" }}>
                        Purpose: {booking.purpose}
                      </p>
                    </div>

                    <div style={{ display: "flex", gap: "10px", alignItems: "start" }}>
                      <button
                        type="button"
                        onClick={() => approveBooking(booking.id)}
                        style={{
                          border: "none",
                          borderRadius: "999px",
                          padding: "10px 14px",
                          backgroundColor: "#22c55e",
                          color: "#082f49",
                          fontWeight: "800",
                          cursor: "pointer",
                        }}
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => rejectBooking(booking.id)}
                        style={{
                          border: "none",
                          borderRadius: "999px",
                          padding: "10px 14px",
                          backgroundColor: "#ef4444",
                          color: "white",
                          fontWeight: "800",
                          cursor: "pointer",
                        }}
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    ),
    availability: (
      <div style={{ display: "grid", gap: "16px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "16px",
          }}
        >
          <PanelCard title="Available Rooms" value={availableRooms} tone="#86efac" />
          <PanelCard title="Occupied Rooms" value={occupiedRooms} tone="#f9a8d4" />
          <PanelCard title="Maintenance Rooms" value={maintenanceCount} tone="#fef08a" />
        </div>

        <div
          style={{
            backgroundColor: "#111827",
            borderRadius: "22px",
            padding: "24px",
            border: "1px solid rgba(59, 130, 246, 0.24)",
          }}
        >
          <p style={{ color: "#93c5fd", marginTop: 0 }}>Room availability snapshot</p>
          <div style={{ display: "grid", gap: "12px", marginTop: "18px" }}>
            {upcomingRoomBookings.map(({ room, roomBookings, status }) => {
              const unavailableSummary = roomBookings.length
                ? roomBookings
                    .map((booking) => `${booking.date} ${booking.startTime} - ${booking.endTime}`)
                    .join(" • ")
                : "No current conflicts";

              return (
                <div
                  key={room.id}
                  style={{
                    display: "grid",
                    gap: "8px",
                    backgroundColor: "rgba(15, 23, 42, 0.9)",
                    borderRadius: "16px",
                    padding: "16px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: "16px",
                      flexWrap: "wrap",
                    }}
                  >
                    <div>
                      <h3 style={{ margin: "0 0 6px" }}>{room.name}</h3>
                      <p style={{ margin: 0, color: "#cbd5e1" }}>
                        Capacity: {room.capacity} • {room.location}
                      </p>
                    </div>
                    <span
                      style={{
                        alignSelf: "center",
                        padding: "8px 12px",
                        borderRadius: "999px",
                        backgroundColor:
                          status === "Available"
                            ? "rgba(34, 197, 94, 0.18)"
                            : status === "Maintenance"
                              ? "rgba(250, 204, 21, 0.18)"
                              : "rgba(244, 114, 182, 0.18)",
                        color:
                          status === "Available"
                            ? "#86efac"
                            : status === "Maintenance"
                              ? "#fde68a"
                              : "#f9a8d4",
                        fontWeight: "700",
                      }}
                    >
                      {status}
                    </span>
                  </div>

                  <p style={{ margin: 0, color: "#e2e8f0" }}>
                    {status === "Available"
                      ? "Available for booking"
                      : status === "Maintenance"
                        ? "Currently under maintenance"
                        : `Unavailable: ${unavailableSummary}`}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    ),
    reports: (
      <div style={{ display: "grid", gap: "16px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "16px",
          }}
        >
          <PanelCard title="Most booked room" value={analytics.mostBookedRoom} />
          <PanelCard title="Peak hours" value={analytics.peakHour} />
          <PanelCard title="Occupancy %" value={`${analytics.occupancyPercent}%`} />
        </div>

        <div
          style={{
            backgroundColor: "#111827",
            borderRadius: "22px",
            padding: "24px",
            border: "1px solid rgba(59, 130, 246, 0.24)",
          }}
        >
          <p style={{ color: "#93c5fd", marginTop: 0 }}>Conflict Alerts</p>
          {conflictAlerts.length === 0 ? (
            <p style={{ color: "#cbd5e1", marginBottom: 0 }}>
              No conflicts detected right now.
            </p>
          ) : (
            <div style={{ display: "grid", gap: "12px", marginTop: "18px" }}>
              {conflictAlerts.map((alert) => (
                <div
                  key={alert.id}
                  style={{
                    backgroundColor: "rgba(248, 113, 113, 0.12)",
                    borderRadius: "16px",
                    padding: "16px",
                    border: "1px solid rgba(248, 113, 113, 0.2)",
                  }}
                >
                  <h3 style={{ margin: "0 0 6px" }}>{alert.message}</h3>
                  <p style={{ margin: 0, color: "#fca5a5" }}>
                    {alert.bookings[0].userName} and {alert.bookings[1].userName}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    ),
    dashboard: (
      <div style={{ display: "grid", gap: "16px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "16px",
          }}
        >
          <PanelCard title="Pending Requests" value={pendingBookings.length} tone="#fca5a5" />
          <PanelCard title="Today's Reservations" value={todayBookings.length} tone="#93c5fd" />
          <PanelCard title="Available Rooms" value={availableRooms} tone="#86efac" />
          <PanelCard title="Maintenance Rooms" value={maintenanceCount} tone="#fde68a" />
        </div>

        <div
          style={{
            backgroundColor: "#111827",
            borderRadius: "22px",
            padding: "24px",
            border: "1px solid rgba(59, 130, 246, 0.24)",
          }}
        >
          <p style={{ color: "#93c5fd", marginTop: 0 }}>Manager overview</p>
          <h2 style={{ marginTop: "6px" }}>{currentUser?.fullName || currentUser?.email || "Manager"}</h2>
          <p style={{ color: "#cbd5e1", marginBottom: 0 }}>
            Monitor booking flow, approve pending requests, and keep room scheduling under control.
          </p>
        </div>

        <div
          style={{
            backgroundColor: "#111827",
            borderRadius: "22px",
            padding: "24px",
            border: "1px solid rgba(59, 130, 246, 0.24)",
          }}
        >
          <p style={{ color: "#93c5fd", marginTop: 0 }}>Today's Reservations</p>
          {todayBookings.length === 0 ? (
            <p style={{ color: "#cbd5e1", marginBottom: 0 }}>
              No reservations scheduled for today.
            </p>
          ) : (
            <div style={{ display: "grid", gap: "12px", marginTop: "18px" }}>
              {todayBookings.map((booking) => (
                <div
                  key={booking.id}
                  style={{
                    backgroundColor: "rgba(15, 23, 42, 0.95)",
                    borderRadius: "16px",
                    padding: "16px",
                  }}
                >
                  <h3 style={{ margin: "0 0 6px" }}>{booking.roomName}</h3>
                  <p style={{ margin: 0, color: "#cbd5e1" }}>
                    {booking.startTime} - {booking.endTime}
                  </p>
                  <p style={{ margin: "6px 0 0", color: "#e2e8f0" }}>
                    {booking.userName} • {booking.purpose}
                  </p>
                  <p style={{ margin: "8px 0 0", color: "#86efac" }}>Status: {booking.status}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    ),
  };

  return (
    <div
      style={{
        padding: "32px 24px 48px",
        color: "white",
        minHeight: "calc(100vh - 72px)",
        background:
          "radial-gradient(circle at top left, rgba(59, 130, 246, 0.22), transparent 18%), #0f172a",
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ marginBottom: "24px" }}>
          <p style={{ color: "#93c5fd", marginBottom: "8px" }}>Manager Dashboard</p>
          <h1 style={{ margin: 0, fontSize: "2rem" }}>Manage bookings and keep the schedule running</h1>
          <p style={{ color: "#cbd5e1", marginTop: "10px", maxWidth: "760px" }}>
            Approve urgent requests, monitor today’s reservations, and keep room availability under control.
          </p>
        </div>

        <div
          style={{
            display: "flex",
            gap: "12px",
            flexWrap: "wrap",
            marginBottom: "24px",
          }}
        >
          {sectionButtons.map((button) => {
            const isActive = activeSection === button.key;
            return (
              <button
                key={button.key}
                type="button"
                onClick={() => setActiveSection(button.key)}
                style={{
                  borderRadius: "999px",
                  padding: "10px 16px",
                  border: isActive ? "1px solid #93c5fd" : "1px solid transparent",
                  backgroundColor: isActive ? "rgba(59, 130, 246, 0.2)" : "#111827",
                  color: "white",
                  fontWeight: "700",
                  cursor: "pointer",
                }}
              >
                {button.label}
              </button>
            );
          })}
        </div>

        {sectionContent[activeSection] || sectionContent.dashboard}
      </div>
    </div>
  );
}

export default ManagerDashboard;
