 import { Link, useLocation, useNavigate } from "react-router-dom";
import { getCurrentUser } from "../utils/resourceData";

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();

  const currentUser = getCurrentUser();
  const role = currentUser?.role || "User";

  const roleLinks = {
    Admin: [
      { to: "/admin-dashboard", label: "Dashboard" },
      { to: "/admin-users", label: "Users" },
      { to: "/admin-resources", label: "Resources" },
      { to: "/admin-bookings", label: "Bookings" },
      { to: "/admin-analytics", label: "Analytics" },
      { to: "/admin-settings", label: "Settings" },
    ],
    Manager: [
      { to: "/manager-dashboard", label: "Dashboard" },
      { to: "/manager-dashboard", label: "Maintenance Schedule" },
      { to: "/manager-availability", label: "Availability" },
      { to: "/manager-reports", label: "Reports" },
    ],
    User: [
      { to: "/dashboard", label: "Dashboard" },
      { to: "/resources", label: "Resources" },
      { to: "/my-bookings", label: "My Bookings" },
    ],
  };

  const links = roleLinks[role] || roleLinks.User;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("resourceBookingCurrentUser");
    navigate("/");
  };

  return (
    <nav className="nav-shell">
      <div className="nav-bar">
        <div className="brand-wrap">
          <div className="brand-mark">🏢</div>
          <div className="brand-copy">
            <p className="brand-title">Resource Booking System</p>
            <p className="brand-subtitle">
              Elegant booking management for modern teams
            </p>
          </div>
        </div>

        <div className="nav-links">
          {links.map((link) => {
            const isActive = location.pathname === link.to;

            return (
              <Link
                key={link.to}
                to={link.to}
                className={`nav-link${isActive ? " active" : ""}`}
                aria-current={isActive ? "page" : undefined}
              >
                {link.label}
              </Link>
            );
          })}

          <button
            type="button"
            className="nav-link logout"
            onClick={handleLogout}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
            }}
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;