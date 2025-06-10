import React, { useEffect, useState } from "react";
import { Star } from "lucide-react";
import axios from "../axiosConfig";
import { useParams, useNavigate } from "react-router-dom";
import "./UserPage.css";
import Navigation from "../components/Navigation";
import Loader from "../components/Loader";

const MovieCard = ({ title, rating }) => (
  <div className="movie-card">
    <div className="movie-title">{title || "Untitled Movie"}</div>
    <div className="movie-rating">
      <Star className="w-4 h-4 mr-1" /> {rating ?? "N/A"}
    </div>
  </div>
);

const Stat = ({ label, value }) => (
  <div className="stat-card">
    <div className="stat-value">{value ?? 0}</div>
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
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    username: "",
    tagline: "",
    profile_pic_url: "",
  });
  const [editError, setEditError] = useState(null);
  const navigate = useNavigate();
  const isOwnProfile = user?.id === loggedInUserId;

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const profileRes = await axios.get("/profile/me");
        const currentUserId = profileRes.data?.id;
        if (!currentUserId)
          throw new Error("Failed to fetch logged-in user ID");
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
          axios.get(`http://localhost:5000/review/`, {
            params: { user_id: targetId, limit: 10 },
          }),
        ]);

        setUser(userRes.data || null);
        setStats(statsRes.data || {});
        setWatchedMovies(
          Array.isArray(watchedRes.data?.watched) ? watchedRes.data.watched : []
        );
        setFavorites(
          Array.isArray(favoritesRes.data?.favorites)
            ? favoritesRes.data.favorites
            : []
        );
        setLists(
          Array.isArray(listsRes.data?.lists) ? listsRes.data.lists : []
        );
        setReviews(Array.isArray(reviewsRes.data) ? reviewsRes.data : []);
        setEditForm({
          username: userRes.data?.username || "",
          tagline: userRes.data?.tagline || "",
          profile_pic_url: userRes.data?.profile_pic_url || "",
        });
      } catch (err) {
        console.error(err);
        setError("Failed to load user data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user_id]);

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editForm.username.trim()) {
      setEditError("Username cannot be empty");
      return;
    }
    try {
      await axios.put("/profile/me", editForm);
      setUser({ ...user, ...editForm });
      setIsEditing(false);
      setEditError(null);
    } catch (err) {
      console.error(err);
      setEditError("Failed to update profile. Please try again.");
    }
  };

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

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

    if (dataToRender.length === 0) {
      return <div className="no-data">No {activeTab} found.</div>;
    }

    if (activeTab === "lists") {
      return (
        <div className="list-grid">
          {dataToRender.map((list) => (
            <div key={list.list_id || list.title} className="list-card">
              <h3 onClick={() => navigate(`/list/${list.list_id}`)}>
                {list.title || "Untitled List"}
              </h3>
              <img
                src={list.picture_url}
                alt={list.title}
                className="list-image"
              />
              <p>{list.description || "No description available"}</p>
            </div>
          ))}
        </div>
      );
    }

    if (activeTab === "reviews") {
      return (
        <div className="review-grid">
          {dataToRender.map((review) => (
            <div key={review.review_id} className="review-card">
              <h3
                onClick={() => navigate(`/movie/${review.movie_id}`)}
              >{`Movie ID: ${review.movie_id}`}</h3>
              <p>
                <strong>Rating:</strong> {review.rating ?? "N/A"}
              </p>
              <p>{review.review_text || "No review text"}</p>
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
      ) : error ? (
        <main className="main-content">
          <div className="error-message">{error}</div>
        </main>
      ) : !user || !stats ? (
        <main className="main-content">
          <div className="error-message">No user data available.</div>
        </main>
      ) : (
        <main className="main-content">
          <div className="profile-section fade-in">
            <div className="profile-avatar">
              {user.profile_pic_url ? (
                <img
                  src={user.profile_pic_url}
                  alt="Profile"
                  className="avatar-image"
                />
              ) : (
                <div className="avatar-placeholder" />
              )}
            </div>
            <div>
              {isEditing && isOwnProfile ? (
                <div className="edit-form">
                  <form onSubmit={handleEditSubmit}>
                    <input
                      type="text"
                      name="username"
                      value={editForm.username}
                      onChange={handleEditChange}
                      placeholder="Username"
                      className="edit-input"
                    />
                    <input
                      type="text"
                      name="tagline"
                      value={editForm.tagline}
                      onChange={handleEditChange}
                      placeholder="Tagline"
                      className="edit-input"
                    />
                    <input
                      type="url"
                      name="profile_pic_url"
                      value={editForm.profile_pic_url}
                      onChange={handleEditChange}
                      placeholder="Profile Picture URL"
                      className="edit-input"
                    />
                    {editError && <div className="edit-error">{editError}</div>}
                    <button type="submit" className="save-btn">
                      Save
                    </button>
                    <button
                      type="button"
                      className="cancel-btn"
                      onClick={() => setIsEditing(false)}
                    >
                      Cancel
                    </button>
                  </form>
                </div>
              ) : (
                <>
                  <h1 className="profile-name">
                    {user.username || "Unknown User"}
                  </h1>
                  <p className="profile-bio">
                    {user.tagline || "Lover of sad indie films 🎬"}
                  </p>
                  {isOwnProfile && (
                    <button
                      className="edit-profile-btn"
                      onClick={() => setIsEditing(true)}
                    >
                      Edit Profile
                    </button>
                  )}
                </>
              )}
            </div>
            <div className="profile-stats">
              <Stat label="Watched" value={stats.watched} />
              <Stat label="Favorites" value={stats.favorites} />
              <Stat label="Reviews" value={stats.reviews} />
              <Stat label="Lists" value={stats.lists} />
              <Stat label="Followers" value={stats.followers} />
              <Stat label="Following" value={stats.following} />
            </div>
          </div>

          <div className="summary-cards fade-in">
            <div className="summary-card">
              <h3>Favorite Genres</h3>
              <p>Not enough data</p>
            </div>
            <div className="summary-card">
              <h3>Movies Watched Over Time</h3>
              <p>
                {stats.watched
                  ? `${stats.watched} movies watched`
                  : "No data available"}
              </p>
            </div>
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
