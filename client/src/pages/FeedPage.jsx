import React, { useEffect, useState } from "react";
import axios from "../axiosConfig";
import Loader from "../components/Loader";
import Navigation from "../components/Navigation";
import "./FeedPage.css";

export default function FeedPage() {
  const [feed, setFeed] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [activeTab, setActiveTab] = useState("feed");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        const [feedRes, profileRes, recRes] = await Promise.all([
          axios.get("/feed/"),
          axios.get("/profile/me"),
          axios.get("/rec"),
        ]);

        if (typeof feedRes.data === "string") {
          setErrorMsg(feedRes.data);
        } else {
          setFeed(feedRes.data);
        }

        setCurrentUserId(profileRes.data.id);

        if (recRes.data && !recRes.data.error) {
          setRecommendations(recRes.data);
        } else {
          setRecommendations([]);
          setErrorMsg(recRes.data?.error || "Failed to load recommendations.");
        }
      } catch (err) {
        console.error("Failed to fetch data", err);
        setErrorMsg("Something went wrong. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const renderActiveTabContent = () => {
    switch (activeTab) {
      case "feed":
        return feed.length > 0 ? (
          <div className="feed-list">
            {feed.map((event) => (
              <div key={event.event_id} className="feed-card">
                <p className="feed-date">{event.created_at}</p>
                <p className="feed-message">{event.message}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="feed-error">No feed items available.</div>
        );
      case "recommendations":
        return recommendations.length > 0 ? (
          <div className="feed-list">
            {recommendations.map((rec) => (
              <div key={rec.id} className="feed-card rec-card">
                <p className="feed-message">{rec.title || `Movie ${rec.id}`}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="feed-error">No recommendations available.</div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="feed-page-container">
      <Navigation />
      <main className="main-content fade-in">
        <h1 className="feed-title">Your Feed</h1>
        <div className="tabs-section">
          <div className="tabs">
            <button
              className={activeTab === "feed" ? "tab-active" : "tab"}
              onClick={() => setActiveTab("feed")}
            >
              Feed
            </button>
            <button
              className={activeTab === "recommendations" ? "tab-active" : "tab"}
              onClick={() => setActiveTab("recommendations")}
            >
              Recommendations
            </button>
          </div>
          {isLoading ? (
            <Loader />
          ) : errorMsg ? (
            <div className="feed-error">{errorMsg}</div>
          ) : (
            renderActiveTabContent()
          )}
        </div>
      </main>
    </div>
  );
}
