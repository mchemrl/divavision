import React from 'react';
import { useNavigate } from 'react-router-dom';
import illustration from '../assets/trolls/jumping_troll.gif';
import './LoginPage.css';

export default function SignUpPage() {
  const navigate = useNavigate();
  const handleSignUp = (e) => {
    e.preventDefault();
    navigate('/discover');
  };

  return (
    <div className="login-container">
      <div className="side-panel">
        <div className="illustration-wrapper">
          <img src={illustration} alt="Illustration" className="illustration-img" />
        </div>
      </div>

      <div className="form-panel">
        <div className="header">
          <h1>Create Account</h1>
          <p className="helper-text">Sign up and start vibing</p>
        </div>
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
          <button type="submit" className="primary-btn">Sign Up</button>
        </form>
        <div className="footer-links">
          <div className="divider"><hr /><span>or</span><hr /></div>
          <button className="social-btn google">
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
