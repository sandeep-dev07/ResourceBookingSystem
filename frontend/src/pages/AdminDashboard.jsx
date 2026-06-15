import { useEffect, useMemo, useState } from "react";
import {
  fetchAllBookings,
  fetchAllUsers,
  registerUser,
} from "../api/backend";
import {
  getBookings,
  getCurrentUser,
  getMaintenanceRooms,
  getRooms,
  getRoomStatus,
  getRoomStatusOverrides,
  saveBookings,
  saveMaintenanceRooms,
  saveRooms,
  saveRoomStatusOverrides,
} from "../utils/resourceData";

const sectionButtons = [
  { key: "dashboard", label: "Dashboard" },
  { key: "users", label: "Users" },
  { key: "resources", label: "Resources" },
  { key: "bookings", label: "Bookings" },
  { key: "analytics", label: "Analytics" },
  { key: "settings", label: "Settings" },
];

const USERS_KEY = "resourceBookingUsers";

function AdminDashboard({ defaultSection = "dashboard" }) {
  const currentUser = getCurrentUser();
  const [activeSection, setActiveSection] = useState(defaultSection);
const [users, setUsers] = useState([]);
  const [rooms, setRooms] = useState(() => getRooms());
  const [bookings, setBookings] = useState(() => getBookings());
  const [maintenanceRooms, setMaintenanceRooms] = useState(() => getMaintenanceRooms());
  const [roomStatuses, setRoomStatuses] = useState(() => getRoomStatusOverrides());
  const [message, setMessage] = useState("");
  const [messageTone, setMessageTone] = useState("success");
  const [userForm, setUserForm] = useState({ fullName: "", email: "", password: "", role: "User" });
  const [roomForm, setRoomForm] = useState({
    name: "",
    capacity: "",
    location: "",
    projector: true,
    wifi: true,
    ac: true,
  });
  const [editingRoomId, setEditingRoomId] = useState("");

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

  useEffect(() => {
  let isMounted = true;

  const loadUsers = async () => {
    try {
      const backendUsers = await fetchAllUsers();

      if (!isMounted) {
        return;
      }

      setUsers(backendUsers);
    } catch (error) {
      console.error("Failed to load users", error);
    }
  };

  loadUsers();

  return () => {
    isMounted = false;
  };
}, []);

  const saveUsers = (nextUsers) => {
    setUsers(nextUsers);
    localStorage.setItem(USERS_KEY, JSON.stringify(nextUsers));
  };

  const totals = useMemo(() => {
    const roomCounts = rooms.map((room) => ({
      roomId: room.id,
      roomName: room.name,
      count: bookings.filter((booking) => booking.roomId === room.id && booking.status !== "Rejected").length,
    }));

    const sortedRooms = [...roomCounts].sort((a, b) => b.count - a.count);
    const systemUtilization = rooms.length ? Math.round((bookings.length / rooms.length) * 100) : 0;

    return {
      totalUsers: users.length,
      totalBookings: bookings.length,
      mostUsedRoom: sortedRooms[0]?.roomName || "No bookings yet",
      systemUtilization,
    };
  }, [bookings, rooms, users.length]);

  const saveRoomSet = (nextRooms) => {
    setRooms(nextRooms);
    saveRooms(nextRooms);
  };

  const setRoomStatus = (roomId, nextStatus) => {
    const nextOverrides = { ...roomStatuses };
    const nextMaintenanceRooms =
      nextStatus === "Maintenance"
        ? [...new Set([...maintenanceRooms, roomId])]
        : maintenanceRooms.filter((id) => id !== roomId);

    if (nextStatus === "Maintenance") {
      nextOverrides[roomId] = "Maintenance";
    } else if (nextStatus === "Occupied" || nextStatus === "Available") {
      nextOverrides[roomId] = nextStatus;
    } else {
      delete nextOverrides[roomId];
    }

    setMaintenanceRooms(nextMaintenanceRooms);
    saveMaintenanceRooms(nextMaintenanceRooms);
    setRoomStatuses(nextOverrides);
    saveRoomStatusOverrides(nextOverrides);
  };

  const handleAddUser = async (event) => {
  event.preventDefault();

  if (!userForm.fullName || !userForm.email || !userForm.password) {
    setMessageTone("error");
    setMessage("Please complete all fields before adding a user.");
    return;
  }

  try {
    const createdUser = await registerUser({
  fullName: userForm.fullName,
  email: userForm.email,
  password: userForm.password,
  confirmPassword: userForm.password,
  role: userForm.role,
});

    setUsers((prev) => [...prev, createdUser]);

    setUserForm({
      fullName: "",
      email: "",
      password: "",
      role: "User",
    });

    setMessageTone("success");
    setMessage("User added successfully.");
  } catch (error) {
    setMessageTone("error");
    setMessage(error.message || "Failed to create user.");
  }
};

  const handleRoleChange = (email, role) => {
    const nextUsers = users.map((user) =>
      user.email === email ? { ...user, role } : user
    );

    saveUsers(nextUsers);
    setMessageTone("success");
    setMessage(`Role updated for ${email}.`);
  };

  const handleRemoveUser = (email) => {
    if (currentUser?.email === email) {
      setMessageTone("error");
      setMessage("You cannot remove the currently logged-in admin.");
      return;
    }

    const nextUsers = users.filter((user) => user.email !== email);
    saveUsers(nextUsers);
    setMessageTone("success");
    setMessage(`Removed ${email} from the system.`);
  };

  const handleAddRoom = (event) => {
    event.preventDefault();

    if (!roomForm.name || !roomForm.capacity || !roomForm.location) {
      setMessageTone("error");
      setMessage("Please fill in the room details.");
      return;
    }

    const newRoom = {
      id: roomForm.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") || `room-${Date.now()}`,
      name: roomForm.name,
      capacity: Number(roomForm.capacity),
      location: roomForm.location,
      projector: roomForm.projector,
      wifi: roomForm.wifi,
      ac: roomForm.ac,
      image:
        "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=900&q=80",
    };

    saveRoomSet([...rooms, newRoom]);
    setRoomForm({
      name: "",
      capacity: "",
      location: "",
      projector: true,
      wifi: true,
      ac: true,
    });
    setMessageTone("success");
    setMessage("Room added successfully.");
  };

  const handleDeleteRoom = (roomId) => {
    const nextRooms = rooms.filter((room) => room.id !== roomId);
    saveRoomSet(nextRooms);
    setMessageTone("success");
    setMessage("Room deleted successfully.");
  };

  const handleSaveRoom = (roomId) => {
    const currentRoom = rooms.find((room) => room.id === roomId);

    if (!currentRoom) {
      return;
    }

    const nextRooms = rooms.map((room) =>
      room.id === roomId
        ? {
            ...room,
            capacity: currentRoom.capacity,
            projector: currentRoom.projector,
            wifi: currentRoom.wifi,
            ac: currentRoom.ac,
          }
        : room
    );

    saveRoomSet(nextRooms);
    setEditingRoomId("");
    setMessageTone("success");
    setMessage("Room updates saved.");
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
    dashboard: (
      <div style={{ display: "grid", gap: "16px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "16px",
          }}
        >
          <PanelCard title="Total Users" value={totals.totalUsers} tone="#93c5fd" />
          <PanelCard title="Total Bookings" value={totals.totalBookings} tone="#86efac" />
          <PanelCard title="Most Used Room" value={totals.mostUsedRoom} tone="#f9a8d4" />
          <PanelCard title="System Utilization" value={`${totals.systemUtilization}%`} tone="#fde68a" />
        </div>

        <div
          style={{
            backgroundColor: "#111827",
            borderRadius: "22px",
            padding: "24px",
            border: "1px solid rgba(59, 130, 246, 0.24)",
          }}
        >
          <p style={{ color: "#93c5fd", marginTop: 0 }}>Admin control center</p>
          <h2 style={{ marginTop: "6px" }}>{currentUser?.fullName || currentUser?.email || "Admin"}</h2>
          <p style={{ color: "#cbd5e1", marginBottom: 0 }}>
            Manage users, oversee rooms, and monitor system-wide booking activity from a single control panel.
          </p>
        </div>
      </div>
    ),
    users: (
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
            border: "1px solid rgba(59, 130, 246, 0.24)",
          }}
        >
          <p style={{ color: "#93c5fd", marginTop: 0 }}>User Management</p>
          <h2 style={{ marginTop: "6px" }}>Add User • Remove User • Update Roles</h2>

          <form onSubmit={handleAddUser} style={{ display: "grid", gap: "12px", marginTop: "18px" }}>
            <input
              value={userForm.fullName}
              onChange={(event) => setUserForm((prev) => ({ ...prev, fullName: event.target.value }))}
              placeholder="Full Name"
              style={inputStyle}
            />
            <input
              value={userForm.email}
              onChange={(event) => setUserForm((prev) => ({ ...prev, email: event.target.value }))}
              placeholder="Email"
              style={inputStyle}
            />
            <input
              type="password"
              value={userForm.password}
              onChange={(event) => setUserForm((prev) => ({ ...prev, password: event.target.value }))}
              placeholder="Password"
              style={inputStyle}
            />
            <select
              value={userForm.role}
              onChange={(event) => setUserForm((prev) => ({ ...prev, role: event.target.value }))}
              style={inputStyle}
            >
              <option>User</option>
              <option>Manager</option>
              <option>Admin</option>
            </select>
            <button type="submit" style={primaryButtonStyle}>
              Add User
            </button>
          </form>
        </div>

        <div style={{ display: "grid", gap: "12px" }}>
          {users.map((user) => (
            <div
              key={user.email}
              style={{
                backgroundColor: "#111827",
                borderRadius: "18px",
                padding: "18px",
                border: "1px solid rgba(59, 130, 246, 0.24)",
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
                  <h3 style={{ margin: "0 0 6px" }}>{user.fullName}</h3>
                  <p style={{ margin: 0, color: "#cbd5e1" }}>{user.email}</p>
                </div>

                <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
                  <select
                    value={user.role}
                    onChange={(event) => handleRoleChange(user.email, event.target.value)}
                    style={{
                      ...inputStyle,
                      minWidth: "150px",
                    }}
                  >
                    <option>User</option>
                    <option>Manager</option>
                    <option>Admin</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => handleRemoveUser(user.email)}
                    style={{
                      border: "none",
                      borderRadius: "999px",
                      padding: "10px 14px",
                      backgroundColor: "#ef4444",
                      color: "white",
                      fontWeight: "700",
                      cursor: "pointer",
                    }}
                  >
                    Remove User
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
    resources: (
      <div style={{ display: "grid", gap: "16px" }}>
        <div
          style={{
            backgroundColor: "#111827",
            borderRadius: "22px",
            padding: "24px",
            border: "1px solid rgba(59, 130, 246, 0.24)",
          }}
        >
          <p style={{ color: "#93c5fd", marginTop: 0 }}>Resource Management</p>
          <h2 style={{ marginTop: "6px" }}>Add Room • Delete Room • Update Capacity & Facilities</h2>

          <form onSubmit={handleAddRoom} style={{ display: "grid", gap: "12px", marginTop: "18px" }}>
            <input
              value={roomForm.name}
              onChange={(event) => setRoomForm((prev) => ({ ...prev, name: event.target.value }))}
              placeholder="Room Name"
              style={inputStyle}
            />
            <input
              value={roomForm.capacity}
              onChange={(event) => setRoomForm((prev) => ({ ...prev, capacity: event.target.value }))}
              placeholder="Capacity"
              type="number"
              style={inputStyle}
            />
            <input
              value={roomForm.location}
              onChange={(event) => setRoomForm((prev) => ({ ...prev, location: event.target.value }))}
              placeholder="Location"
              style={inputStyle}
            />
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <label style={{ color: "#e2e8f0" }}>
                <input
                  type="checkbox"
                  checked={roomForm.projector}
                  onChange={(event) => setRoomForm((prev) => ({ ...prev, projector: event.target.checked }))}
                />
                Projector
              </label>
              <label style={{ color: "#e2e8f0" }}>
                <input
                  type="checkbox"
                  checked={roomForm.wifi}
                  onChange={(event) => setRoomForm((prev) => ({ ...prev, wifi: event.target.checked }))}
                />
                WiFi
              </label>
              <label style={{ color: "#e2e8f0" }}>
                <input
                  type="checkbox"
                  checked={roomForm.ac}
                  onChange={(event) => setRoomForm((prev) => ({ ...prev, ac: event.target.checked }))}
                />
                AC
              </label>
            </div>
            <button type="submit" style={primaryButtonStyle}>
              Add Room
            </button>
          </form>
        </div>

        <div style={{ display: "grid", gap: "12px" }}>
          {rooms.map((room) => {
            const currentStatus = getRoomStatus(room.id, bookings);

            return (
              <div
                key={room.id}
                style={{
                  backgroundColor: "#111827",
                  borderRadius: "18px",
                  padding: "18px",
                  border: "1px solid rgba(59, 130, 246, 0.24)",
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
                    <h3 style={{ margin: "0 0 6px" }}>{room.name}</h3>
                    <p style={{ margin: 0, color: "#cbd5e1" }}>
                      {room.location} • Capacity {room.capacity}
                    </p>
                    <p style={{ margin: "8px 0 0", color: "#e2e8f0" }}>
                      Projector: {room.projector ? "Yes" : "No"} • WiFi: {room.wifi ? "Yes" : "No"} • AC: {room.ac ? "Yes" : "No"}
                    </p>
                  </div>

                  <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
                    <span
                      style={{
                        padding: "8px 12px",
                        borderRadius: "999px",
                        backgroundColor:
                          currentStatus === "Maintenance"
                            ? "rgba(250, 204, 21, 0.18)"
                            : currentStatus === "Occupied"
                              ? "rgba(244, 114, 182, 0.18)"
                              : "rgba(34, 197, 94, 0.18)",
                        color:
                          currentStatus === "Maintenance"
                            ? "#fde68a"
                            : currentStatus === "Occupied"
                              ? "#f9a8d4"
                              : "#86efac",
                        fontWeight: "700",
                      }}
                    >
                      {currentStatus}
                    </span>
                    <button
                      type="button"
                      onClick={() => setEditingRoomId(room.id)}
                      style={{
                        border: "none",
                        borderRadius: "999px",
                        padding: "10px 14px",
                        backgroundColor: "#2563eb",
                        color: "white",
                        fontWeight: "700",
                        cursor: "pointer",
                      }}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteRoom(room.id)}
                      style={{
                        border: "none",
                        borderRadius: "999px",
                        padding: "10px 14px",
                        backgroundColor: "#ef4444",
                        color: "white",
                        fontWeight: "700",
                        cursor: "pointer",
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {editingRoomId === room.id ? (
                  <div style={{ marginTop: "16px", display: "grid", gap: "12px" }}>
                    <input
                      value={room.capacity}
                      onChange={(event) => {
                        const nextRooms = rooms.map((value) =>
                          value.id === room.id ? { ...value, capacity: Number(event.target.value) || 0 } : value
                        );
                        saveRoomSet(nextRooms);
                      }}
                      type="number"
                      style={inputStyle}
                    />
                    <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                      <label style={{ color: "#e2e8f0" }}>
                        <input
                          type="checkbox"
                          checked={room.projector}
                          onChange={(event) => {
                            const nextRooms = rooms.map((value) =>
                              value.id === room.id ? { ...value, projector: event.target.checked } : value
                            );
                            saveRoomSet(nextRooms);
                          }}
                        />
                        Projector
                      </label>
                      <label style={{ color: "#e2e8f0" }}>
                        <input
                          type="checkbox"
                          checked={room.wifi}
                          onChange={(event) => {
                            const nextRooms = rooms.map((value) =>
                              value.id === room.id ? { ...value, wifi: event.target.checked } : value
                            );
                            saveRoomSet(nextRooms);
                          }}
                        />
                        WiFi
                      </label>
                      <label style={{ color: "#e2e8f0" }}>
                        <input
                          type="checkbox"
                          checked={room.ac}
                          onChange={(event) => {
                            const nextRooms = rooms.map((value) =>
                              value.id === room.id ? { ...value, ac: event.target.checked } : value
                            );
                            saveRoomSet(nextRooms);
                          }}
                        />
                        AC
                      </label>
                    </div>
                    <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                      <button type="button" onClick={() => handleSaveRoom(room.id)} style={primaryButtonStyle}>
                        Save Changes
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingRoomId("")}
                        style={{
                          border: "none",
                          borderRadius: "999px",
                          padding: "10px 14px",
                          backgroundColor: "#334155",
                          color: "white",
                          fontWeight: "700",
                          cursor: "pointer",
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    ),
    bookings: (
      <div style={{ display: "grid", gap: "16px" }}>
        <div
          style={{
            backgroundColor: "#111827",
            borderRadius: "22px",
            padding: "24px",
            border: "1px solid rgba(59, 130, 246, 0.24)",
          }}
        >
          <p style={{ color: "#93c5fd", marginTop: 0 }}>Booking Monitoring</p>
          <h2 style={{ marginTop: "6px" }}>Who booked what, when, and what is the current status</h2>

          <div style={{ display: "grid", gap: "12px", marginTop: "18px" }}>
            {bookings.map((booking) => (
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
                  {booking.userName} • {booking.date} • {booking.startTime} - {booking.endTime}
                </p>
                <p style={{ margin: "6px 0 0", color: "#e2e8f0" }}>{booking.purpose}</p>
                <p style={{ margin: "8px 0 0", color: "#86efac" }}>Status: {booking.status}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    analytics: (
      <div style={{ display: "grid", gap: "16px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "16px",
          }}
        >
          <PanelCard title="Total Users" value={totals.totalUsers} />
          <PanelCard title="Total Bookings" value={totals.totalBookings} />
          <PanelCard title="Most Used Room" value={totals.mostUsedRoom} />
          <PanelCard title="System Utilization" value={`${totals.systemUtilization}%`} />
        </div>

        <div style={{ display: "grid", gap: "12px" }}>
          {rooms.map((room) => (
            <div
              key={room.id}
              style={{
                backgroundColor: "#111827",
                borderRadius: "18px",
                padding: "18px",
                border: "1px solid rgba(59, 130, 246, 0.24)",
              }}
            >
              <h3 style={{ margin: "0 0 6px" }}>{room.name}</h3>
              <p style={{ margin: 0, color: "#cbd5e1" }}>
                Usage: {bookings.filter((booking) => booking.roomId === room.id && booking.status !== "Rejected").length} bookings
              </p>
            </div>
          ))}
        </div>
      </div>
    ),
    settings: (
      <div style={{ display: "grid", gap: "16px" }}>
        <div
          style={{
            backgroundColor: "#111827",
            borderRadius: "22px",
            padding: "24px",
            border: "1px solid rgba(59, 130, 246, 0.24)",
          }}
        >
          <p style={{ color: "#93c5fd", marginTop: 0 }}>Maintenance Control</p>
          <h2 style={{ marginTop: "6px" }}>Set room as AVAILABLE • OCCUPIED • MAINTENANCE</h2>

          <div style={{ display: "grid", gap: "12px", marginTop: "18px" }}>
            {rooms.map((room) => {
              const currentStatus = getRoomStatus(room.id, bookings);

              return (
                <div
                  key={room.id}
                  style={{
                    backgroundColor: "rgba(15, 23, 42, 0.95)",
                    borderRadius: "16px",
                    padding: "16px",
                    display: "flex",
                    justifyContent: "space-between",
                    gap: "16px",
                    flexWrap: "wrap",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <h3 style={{ margin: "0 0 6px" }}>{room.name}</h3>
                    <p style={{ margin: 0, color: "#cbd5e1" }}>{currentStatus}</p>
                  </div>
                  <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                    <button
                      type="button"
                      onClick={() => setRoomStatus(room.id, "Available")}
                      style={{
                        border: "none",
                        borderRadius: "999px",
                        padding: "10px 14px",
                        backgroundColor: "#22c55e",
                        color: "#082f49",
                        fontWeight: "700",
                        cursor: "pointer",
                      }}
                    >
                      Available
                    </button>
                    <button
                      type="button"
                      onClick={() => setRoomStatus(room.id, "Occupied")}
                      style={{
                        border: "none",
                        borderRadius: "999px",
                        padding: "10px 14px",
                        backgroundColor: "#f472b6",
                        color: "#111827",
                        fontWeight: "700",
                        cursor: "pointer",
                      }}
                    >
                      Occupied
                    </button>
                    <button
                      type="button"
                      onClick={() => setRoomStatus(room.id, "Maintenance")}
                      style={{
                        border: "none",
                        borderRadius: "999px",
                        padding: "10px 14px",
                        backgroundColor: "#facc15",
                        color: "#111827",
                        fontWeight: "700",
                        cursor: "pointer",
                      }}
                    >
                      Maintenance
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
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
          "radial-gradient(circle at top left, rgba(244, 114, 182, 0.18), transparent 18%), #0f172a",
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ marginBottom: "24px" }}>
          <p style={{ color: "#f9a8d4", marginBottom: "8px" }}>Admin Dashboard</p>
          <h1 style={{ margin: 0, fontSize: "2rem" }}>Full system control for users, resources, and bookings</h1>
          <p style={{ color: "#cbd5e1", marginTop: "10px", maxWidth: "760px" }}>
            Manage users, rooms, reservations, and operational controls from one administration panel.
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
                  border: isActive ? "1px solid #f9a8d4" : "1px solid transparent",
                  backgroundColor: isActive ? "rgba(244, 114, 182, 0.18)" : "#111827",
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

const inputStyle = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: "12px",
  border: "1px solid #334155",
  backgroundColor: "#0f172a",
  color: "white",
  boxSizing: "border-box",
};

const primaryButtonStyle = {
  border: "none",
  borderRadius: "999px",
  padding: "12px 16px",
  backgroundColor: "#2563eb",
  color: "white",
  fontWeight: "800",
  cursor: "pointer",
};

export default AdminDashboard;
