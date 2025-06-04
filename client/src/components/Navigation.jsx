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
import ill from '../assets/trolls/huggin_troll.gif';


const Navigation = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const response = await fetch("/auth/logout", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        navigate("/");
      } else {
        console.error("Logout failed");
      }
    } catch (error) {
      console.error("An error occurred during logout", error);
    }
  };

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
      <img id="troll" src={ill}></img>
      <button className="logout-button" onClick={handleLogout}>
        <LogOut className="icon" /> Log Out
      </button>
    </aside>
  );
};

export default Navigation;
