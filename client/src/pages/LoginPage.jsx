import illustration from "../assets/trolls/jumping_troll.gif";
import "./LoginPage.css";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function LoginPage() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      navigate("/user");
    }
  }, [navigate]);

  const handleLoginClick = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const identifier = e.target.elements.email.value;
    const password = e.target.elements.password.value;

    try {
      const response = await axios.post("/auth/login", {
        email: identifier,
        password,
      });
      navigate("/user");
    } catch (err) {
      err.response?.data?.error === "user logged in"
        ? navigate("/user")
        : setError(
            err.response?.data?.error || "An error occurred. Please try again."
          );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = "/login/google";
  };

  return (
    <div className="login-container">
      <div className="side-panel">
        <div className="illustration-wrapper">
          <img
            src={illustration}
            alt="Illustration"
            className="illustration-img"
          />
        </div>
      </div>

      <div className="form-panel">
        <div className="header">
          <h1>Welcome Back</h1>
          <p className="helper-text">Log in to your Divavision</p>
          {error && <p className="error-text">{error}</p>}
        </div>

        <form className="login-form" onSubmit={handleLoginClick}>
          <div className="form-group">
            <label htmlFor="email">Email or Username</label>
            <input
              id="email"
              type="text"
              placeholder="youremail@divavision.com"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input id="password" type="password" placeholder="••••••••" />
          </div>

          <button type="submit" className="primary-btn" disabled={loading}>
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>

        <div className="footer-links">
          <div className="divider">
            <hr />
            <span>or</span>
            <hr />
          </div>

          <button className="social-btn google" onClick={handleGoogleLogin}>
            <i className="icon-google" /> Continue with Google
          </button>

          <div className="signup-link">
            <span>Don't have an account?</span>
            <a href="/signup">Sign Up →</a>
          </div>
        </div>
      </div>
    </div>
  );
}
