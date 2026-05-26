import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../api/backend";

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "User",
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

    if (!formData.fullName || !formData.email || !formData.password) {
      setError("Please fill in all required fields");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      await registerUser({
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        role: formData.role,
      });

      navigate("/");
    } catch (err) {
      setError(err.message || "Registration failed");
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <p className="section-label">Create your account</p>
        <h1>Create Account</h1>
        <p className="muted-text">
          Set up your profile and start managing rooms, schedules, and bookings in a polished workspace.
        </p>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="fullName"
            placeholder="Enter Full Name"
            value={formData.fullName}
            onChange={handleChange}
          />

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

          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
          />

          <select name="role" value={formData.role} onChange={handleChange}>
            <option>User</option>
            <option>Manager</option>
            <option>Admin</option>
          </select>

          {error && <p className="error-message">{error}</p>}

          <button type="submit" className="primary-button">
            Register
          </button>
        </form>

        <p className="auth-footer">
          Already have an account?
          <br />
          <Link to="/" className="secondary-link">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
