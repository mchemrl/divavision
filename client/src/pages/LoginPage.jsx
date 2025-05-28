import React from 'react';
import { useNavigate } from 'react-router-dom';
import illustration from '../assets/trolls/jumping_troll.gif';
import './LoginPage.css';

export default function LoginPage() {
  const navigate = useNavigate();
  const handleLoginClick = (e) => {
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
          <h1>Welcome Back</h1>
          <p className="helper-text">Log in to your Divavision</p>
        </div>
        <form className="login-form" onSubmit={handleLoginClick}>
          <div className="form-group">
            <label htmlFor="email">Email or Username</label>
            <input id="email" type="text" placeholder="youremail@divavision.com" />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input id="password" type="password" placeholder="••••••••" />
          </div>
          <button type="submit" className="primary-btn">Log In</button>
        </form>
        <div className="footer-links">
          <div className="divider"><hr /><span>or</span><hr /></div>
          <button className="social-btn google">
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
