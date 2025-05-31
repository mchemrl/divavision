import React from "react";
import { useNavigate } from "react-router-dom";
import "./Navigation.css";
import {
  Star,
  Home,
  Compass,
  Layers,
  User,
  Trophy,
  LogOut,
} from "lucide-react";

const Navigation = () => {
  const navigate = useNavigate();

  return (
    <aside className="sidebar">
      <div>
        <h1 className="sidebar-title">
          <Star className="icon" /> DivaVision
        </h1>
        <nav className="nav-menu">
          <button className="nav-button">
            <Home className="icon" /> Feed
          </button>
          <button onClick={() => navigate("/discover")} className="nav-button">
            <Compass className="icon" /> Discover
          </button>
          <button className="nav-button">
            <Layers className="icon" /> Lists
          </button>
          <button className="nav-button" onClick={() => navigate("/user")}>
            <User className="icon" /> Profile
          </button>
          <button className="nav-button">
            <Trophy className="icon" /> Achievements
          </button>
        </nav>
      </div>
      <button className="logout-button">
        <LogOut className="icon" /> Log Out
      </button>
    </aside>
  );
};

export default Navigation;
