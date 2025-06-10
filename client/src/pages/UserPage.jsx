import React, { useEffect, useState } from "react";
import { Star } from "lucide-react";
import axios from "../axiosConfig";
import { useParams } from "react-router-dom";
import "./UserPage.css";
import Navigation from "../components/Navigation";
import Loader from "../components/Loader";

const MovieCard = ({ title, rating }) => (
  <div className="movie-card">
    <div className="movie-title">{title}</div>
    <div className="movie-rating">
      <Star className="w-4 h-4 mr-1" /> {rating}
    </div>
  </div>
);

const Stat = ({ label, value }) => (
  <div className="stat-card">
    <div className="stat-value">{value}</div>
    <div className="stat-label">{label}</div>
  </div>
);

const UserPage = () => {
  const { user_id } = useParams();
  const [loggedInUserId, setLoggedInUserId] = useState(null);
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [watchedMovies, setWatchedMovies] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [lists, setLists] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [activeTab, setActiveTab] = useState("watched");
  const [isLoading, setIsLoading] = useState(true);

  const isOwnProfile = user?.id === loggedInUserId;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const profileRes = await axios.get("/profile/me");
        const currentUserId = profileRes.data.id;
        setLoggedInUserId(currentUserId);

        const targetId = user_id || currentUserId;

        const [
          userRes,
          statsRes,
          watchedRes,
          favoritesRes,
          listsRes,
          reviewsRes,
        ] = await Promise.all([
          axios.get(`http://localhost:5000/profile/${targetId}`),
          axios.get(`http://localhost:5000/profile/${targetId}/stats`),
          axios.get(`http://localhost:5000/profile/${targetId}/watched`),
          axios.get(`http://localhost:5000/profile/${targetId}/favorites`),
          axios.get(`http://localhost:5000/profile/${targetId}/lists`),
          axios.get(`http://localhost:5000/review/`),
        ]);

        setUser(userRes.data);
        setStats(statsRes.data);
        setWatchedMovies(watchedRes.data.watched || []);
        setFavorites(favoritesRes.data.favorites || []);
        setLists(listsRes.data.lists || []);
        setReviews(reviewsRes.data.reviews || []);
      } catch (err) {
        console.error("Failed to fetch user data", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user_id]);

  const renderActiveTabContent = () => {
    let dataToRender = [];

    switch (activeTab) {
      case "watched":
        dataToRender = watchedMovies;
        break;
      case "favorites":
        dataToRender = favorites;
        break;
      case "lists":
        dataToRender = lists;
        break;
      case "reviews":
        dataToRender = reviews;
        break;
      default:
        dataToRender = [];
    }

    if (activeTab === "lists") {
      return (
        <div className="list-grid">
          {dataToRender.map((list) => (
            <div key={list.id} className="list-card">
              <h3>{list.name}</h3>
              <p>{list.description}</p>
            </div>
          ))}
        </div>
      );
    }

    if (activeTab === "reviews") {
      return (
        <div className="review-grid">
          {dataToRender.map((review) => (
            <div key={review.id} className="review-card">
              <h3>{review.movieTitle}</h3>
              <p>
                <strong>Rating:</strong> {review.rating}
              </p>
              <p>{review.content}</p>
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className="movie-grid fade-in">
        {dataToRender.map((movie) => (
          <MovieCard
            key={movie.id || movie.title}
            title={movie.title}
            rating={movie.rating}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="user-page-container">
      <Navigation />
      {isLoading ? (
        <main className="main-content">
          <Loader />
        </main>
      ) : !user || !stats ? (
        <main className="main-content">
          <div className="error-message">Failed to load user data.</div>
        </main>
      ) : (
        <main className="main-content">
          <div className="profile-section fade-in">
            <div className="profile-avatar" />
            <div>
              <h1 className="profile-name">{user.username}</h1>
              <p className="profile-bio">
                {user.bio || "Lover of sad indie films 🎬"}
              </p>
              {isOwnProfile && (
                <button className="edit-profile-btn">Edit Profile</button>
              )}
            </div>
            <div className="profile-stats">
              <Stat label="Watched" value={stats.watched} />
              <Stat label="Favorites" value={stats.favorites} />
              <Stat label="Reviews" value={stats.reviews} />
              <Stat label="Lists" value={stats.lists} />
            </div>
          </div>

          <div className="summary-cards fade-in">
            <div className="summary-card">Favorite Genres</div>
            <div className="summary-card">Movies Watched Over Time</div>
          </div>

          <div className="tabs-section fade-in">
            <div className="tabs">
              <button
                className={activeTab === "watched" ? "tab-active" : "tab"}
                onClick={() => setActiveTab("watched")}
              >
                Watched Movies
              </button>
              <button
                className={activeTab === "lists" ? "tab-active" : "tab"}
                onClick={() => setActiveTab("lists")}
              >
                Lists
              </button>
              <button
                className={activeTab === "favorites" ? "tab-active" : "tab"}
                onClick={() => setActiveTab("favorites")}
              >
                Favorites
              </button>
              <button
                className={activeTab === "reviews" ? "tab-active" : "tab"}
                onClick={() => setActiveTab("reviews")}
              >
                Recent Reviews
              </button>
            </div>
            {renderActiveTabContent()}
          </div>
        </main>
      )}
    </div>
  );
};

export default UserPage;
