import React, { useEffect, useState } from "react";
import axios from "axios";
import Loader from "../components/Loader";
import Navigation from "../components/Navigation";
import "./FeedPage.css";

export default function FeedPage() {
  const [feed, setFeed] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        const [feedRes, profileRes] = await Promise.all([
          axios.get("http://localhost:5000/feed/"),
          axios.get("http://localhost:5000/profile/me"),
        ]);

        if (typeof feedRes.data === "string") {
          setErrorMsg(feedRes.data);
        } else {
          setFeed(feedRes.data);
        }

        setCurrentUserId(profileRes.data.id);
      } catch (err) {
        console.error("Failed to fetch feed data", err);
        setErrorMsg("Something went wrong. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="feed-page-container">
      <Navigation />
      <main className="main-content">
        <h1 className="feed-title">Your Feed</h1>

        {isLoading ? (
          <Loader />
        ) : errorMsg ? (
          <div className="feed-error">{errorMsg}</div>
        ) : (
          <div className="feed-list">
            {feed.map((event) => (
              <div key={event.event_id} className="feed-card">
                <p className="feed-date">{event.created_at}</p>
                <p className="feed-message">{event.message}</p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
