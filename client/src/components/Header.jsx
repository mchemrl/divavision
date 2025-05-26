import React from "react";
import { Link } from "react-router-dom";
import './Header.css';

export default function Header() {
  return (
      <div class="header">
    <nav className="nav">
      <div className="nav-logo">🎬 Divavision</div>
      <ul className="nav-links">
        <li><Link to="/movies">Movies</Link></li>
        <li><Link to="/lists">Lists</Link></li>
        <li><Link to="/discover">Discover</Link></li>
        <li><Link to="/feed">Feed</Link></li>
      </ul>
      <div className="nav-actions">
        <Link to="/profile" className="btn-profile-icon" aria-label="Profile">
          👤
        </Link>
      </div>
    </nav>
          </div>
  );
}
