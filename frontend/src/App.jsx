import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Register from "./pages/Register";
import Navbar from "./components/Navbar";
import "./App.css";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import ManagerDashboard from "./pages/ManagerDashboard";
import Resources from "./pages/Resources";
import Booking from "./pages/Booking";
import MyBookings from "./pages/MyBookings";

function Layout() {
  const location = useLocation();

  const hideNavbar =
    location.pathname === "/" ||
    location.pathname === "/register";

  return (
    <div className="app-shell">
      {!hideNavbar && (
        <header className="topbar">
          <Navbar />
        </header>
      )}

      <main className="app-main">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/admin-users" element={<AdminDashboard defaultSection="users" />} />
          <Route path="/admin-resources" element={<AdminDashboard defaultSection="resources" />} />
          <Route path="/admin-bookings" element={<AdminDashboard defaultSection="bookings" />} />
          <Route path="/admin-analytics" element={<AdminDashboard defaultSection="analytics" />} />
          <Route path="/admin-settings" element={<AdminDashboard defaultSection="settings" />} />
          <Route path="/manager-dashboard" element={<ManagerDashboard />} />
          <Route path="/manager-bookings" element={<ManagerDashboard defaultSection="manage-bookings" />} />
          <Route path="/manager-availability" element={<ManagerDashboard defaultSection="availability" />} />
          <Route path="/manager-reports" element={<ManagerDashboard defaultSection="reports" />} />
          <Route path="/resources" element={<Resources />} />
          <Route path="/booking" element={<Booking />} />
          <Route path="/my-bookings" element={<MyBookings />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  );
}

export default App;