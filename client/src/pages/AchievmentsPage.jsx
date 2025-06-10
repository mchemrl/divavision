import React, { useEffect, useState } from "react";
import axios from "../axiosConfig";
import Loader from "../components/Loader";
import Navigation from "../components/Navigation";
import "./AchievementsPage.css";

const AchievementsPage = () => {
  const [achievements, setAchievements] = useState(
    [
      [1, "Reviewer", "Leave 5 reviews", "https://i.ibb.co/pjHx775B/image.png"],
      [2, "List Maker", "Create a list", "https://i.ibb.co/RGnVW2BT/image.png"],
      [
        3,
        "Socializer",
        "Follow someone",
        "https://i.ibb.co/nqjsmT62/image.png",
      ],
    ].map(([badge_id, name, description, image]) => ({
      badge_id,
      name,
      description,
      image,
    }))
  );
  const [currentUserId, setCurrentUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [userStats, setUserStats] = useState({
    reviews: 0,
    lists: 0,
    follows: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [profileRes] = await Promise.all([axios.get("/profile/me")]);
        const statsRes = await axios.get(
          `/profile/${profileRes.data.id}/stats`
        );
        setCurrentUserId(profileRes.data.id);
        setUserStats({
          reviews: statsRes.data.reviews || 0,
          lists: statsRes.data.lists || 0,
          follows: statsRes.data.following || 0,
        });
      } catch (err) {
        console.error("Failed to fetch user data", err);
        setErrorMsg("Something went wrong. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const isAchievementEarned = (badgeId) => {
    switch (badgeId) {
      case 1: // Reviewer
        return userStats.reviews >= 5;
      case 2: // List Maker
        return userStats.lists >= 1;
      case 3: // Socializer
        return userStats.follows >= 1;
      default:
        return false;
    }
  };

  return (
    <div className="achievements-page-container">
      <Navigation />
      <main className="main-content fade-in">
        <h1 className="achievements-title">Your Achievements</h1>
        {isLoading ? (
          <Loader />
        ) : errorMsg ? (
          <div className="achievements-error">{errorMsg}</div>
        ) : (
          <div className="achievements-list">
            {achievements.length > 0 ? (
              achievements.map((ach) => (
                <div key={ach.badge_id} className="achievement-card">
                  <img
                    src={ach.image}
                    alt={ach.name}
                    className="achievement-image"
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/50";
                    }} // Fallback image
                  />
                  <div>
                    <h3 className="achievement-name">{ach.name}</h3>
                    <p className="achievement-description">{ach.description}</p>
                  </div>
                  <span className="achievement-status">
                    {isAchievementEarned(ach.badge_id)
                      ? "Earned"
                      : "Not Earned"}
                  </span>
                </div>
              ))
            ) : (
              <div className="achievements-error">
                No achievements available.
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default AchievementsPage;
