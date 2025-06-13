import illustration from "../assets/trolls/jumping_troll.gif";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../axiosConfig";
import "./LoginPage.css";

export default function SignUpPage() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [email, setEmail] = useState("");

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const username = e.target.elements.username.value;
    const emailValue = e.target.elements.email.value;
    const password = e.target.elements.password.value;

    try {
      await axios.post("/auth/register", {
        username,
        email: emailValue,
        password,
      },
      { withCredentials: true });
      setEmail(emailValue);
      setShowVerification(true);
    } catch (err) {
      setError(
        err.response?.data?.error || "An error occurred. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const code = e.target.elements.code.value;

    try {
      await axios.post("/auth/verify", { email, code });
      navigate("/user");
    } catch (err) {
      setError(
        err.response?.data?.error || "An error occurred. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    setLoading(true);
    setError("");
    window.location.href = "/auth/login/google";
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
          <h1>Create Account</h1>
          <p className="helper-text">
            {showVerification
              ? "Verify your email"
              : "Sign up and start vibing"}
          </p>
          {error && <p className="error-text">{error}</p>}
        </div>
        {!showVerification ? (
          <form className="login-form" onSubmit={handleSignUp}>
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input id="username" type="text" placeholder="cinemafan99" />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input id="email" type="email" placeholder="you@example.com" />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input id="password" type="password" placeholder="••••••••" />
            </div>
            <button type="submit" className="primary-btn" disabled={loading}>
              {loading ? "Sending..." : "Sign Up"}
            </button>
          </form>
        ) : (
          <form className="login-form" onSubmit={handleVerifyCode}>
            <div className="form-group">
              <label htmlFor="code">Verification Code</label>
              <input id="code" type="text" placeholder="Enter code" />
            </div>
            <button type="submit" className="primary-btn" disabled={loading}>
              {loading ? "Verifying..." : "Verify"}
            </button>
          </form>
        )}
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
            <span>Already have an account?</span>
            <a href="/login">Log In →</a>
          </div>
        </div>
      </div>
    </div>
  );
}
