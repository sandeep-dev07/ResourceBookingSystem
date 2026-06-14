import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../api/backend";
import { CURRENT_USER_KEY } from "../utils/resourceData";

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!formData.email || !formData.password) {
      setError("Please enter both email and password");
      return;
    }

    try {
      const user = await loginUser({
        email: formData.email,
        password: formData.password,
      });
localStorage.setItem("token", user.token);
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));

      const dashboardPath =
        user.role === "Admin"
          ? "/admin-dashboard"
          : user.role === "Manager"
            ? "/manager-dashboard"
            : "/dashboard";

      navigate(dashboardPath);
    } catch (err) {
      setError(err.message || "Login failed");
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <p className="section-label">Welcome back</p>
        <h1>Login</h1>
        <p className="muted-text">
          Access your bookings, room availability, and team insights with one streamlined login.
        </p>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder="Enter Email"
            value={formData.email}
            onChange={handleChange}
          />

          <input
            type="password"
            name="password"
            placeholder="Enter Password"
            value={formData.password}
            onChange={handleChange}
          />

          {error && <p className="error-message">{error}</p>}

          <button type="submit" className="primary-button">
            Login
          </button>
        </form>

        <p className="auth-footer">
          Don&apos;t have an account?
          <br />
          <Link to="/register" className="secondary-link">
            Create Account
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
