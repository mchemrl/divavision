import React, { useEffect, useState } from "react";
import { Star } from "lucide-react";
import axios from "../axiosConfig";
import { useParams, useNavigate } from "react-router-dom";
import "./UserPage.css";
import Navigation from "../components/Navigation";
import Loader from "../components/Loader";

const MovieCard = ({ title, rating, movie_id, navigate }) => (
  <div className="movie-card">
    <div className="movie-title">
      <span
        onClick={() => navigate(`/movie/${movie_id}`)}
        className="movie-link"
      >
        {title || "Untitled Movie"}
      </span>
    </div>
    <div className="movie-rating">
      <Star className="w-4 h-4 mr-1" /> {rating ?? "N/A"}
    </div>
  </div>
);

const Stat = ({ label, value, onClick, userId, navigate }) => (
  <div className="stat-card" onClick={onClick}>
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
  const [isFollowing, setIsFollowing] = useState(false);
  const [showFollowersPopup, setShowFollowersPopup] = useState(false);
  const [showFollowingPopup, setShowFollowingPopup] = useState(false);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
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
          followersRes,
          followingRes,
        ] = await Promise.all([
          axios.get(`/profile/${targetId}`),
          axios.get(`/profile/${targetId}/stats`),
          axios.get(`/profile/${targetId}/watched`),
          axios.get(`/profile/${targetId}/favorites`),
          axios.get(`/profile/${targetId}/lists`),
          axios.get(`/review/`, { params: { user_id: targetId, limit: 10 } }),
          axios.get(`/profile/${targetId}/followers`),
          axios.get(`/profile/${targetId}/following`),
        ]);

        setUser(userRes.data || null);
        setStats(statsRes.data || {});
        setWatchedMovies(
          Array.isArray(watchedRes.data?.watched?.movies)
            ? watchedRes.data.watched.movies
            : []
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
        setFollowers(followersRes.data || []);
        setFollowing(followingRes.data || []);
        setEditForm({
          username: userRes.data?.username || "",
          tagline: userRes.data?.tagline || "",
          profile_pic_url: userRes.data?.profile_pic_url || "",
        });

        // Check follow status
        if (!isOwnProfile) {
          const followCheck = await axios.get(`/profile/${targetId}/followers`);
          setIsFollowing(
            followCheck.data.some((f) => f.user_id === parseInt(currentUserId))
          );
        }
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

  const handleFollow = async () => {
    try {
      await axios.post(`/profile/${user_id}/follow`);
      setStats({ ...stats, followers: stats.followers + 1 });
      setIsFollowing(true);
    } catch (err) {
      console.error("Failed to follow", err);
    }
  };

  const handleUnfollow = async () => {
    try {
      await axios.delete(`/profile/${user_id}/unfollow`);
      setStats({ ...stats, followers: stats.followers - 1 });
      setIsFollowing(false);
    } catch (err) {
      console.error("Failed to unfollow", err);
    }
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
              <h3 onClick={() => navigate(`/movie/${review.movie_id}`)}>
                {review.title}
              </h3>
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
      <div className="movie-gridd fade-in">
        {dataToRender.map((movie) => (
          <MovieCard
            key={movie.movie_id}
            title={movie.title}
            rating={movie.avg_user_rating || movie.rating}
            movie_id={movie.movie_id}
            navigate={navigate}
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
                  {!isOwnProfile && (
                    <button
                      className={`follow-btn ${isFollowing ? "unfollow" : ""}`}
                      onClick={isFollowing ? handleUnfollow : handleFollow}
                    >
                      {isFollowing ? "Unfollow" : "Follow"}
                    </button>
                  )}
                </>
              )}
            </div>
            <div className="profile-stats">
              <Stat label="Watched" value={stats.watched} navigate={navigate} />
              <Stat
                label="Favorites"
                value={stats.favorites}
                navigate={navigate}
              />
              <Stat label="Reviews" value={stats.reviews} navigate={navigate} />
              <Stat label="Lists" value={stats.lists} navigate={navigate} />
              <Stat
                label="Followers"
                value={stats.followers}
                userId={user_id}
                onClick={() => setShowFollowersPopup(true)}
                navigate={navigate}
              />
              <Stat
                label="Following"
                value={stats.following}
                userId={user_id}
                onClick={() => setShowFollowingPopup(true)}
                navigate={navigate}
              />
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

          {showFollowersPopup && (
            <div
              className="popup-overlay"
              onClick={() => setShowFollowersPopup(false)}
            >
              <div
                className="popup-content"
                onClick={(e) => e.stopPropagation()}
              >
                <h2>Followers</h2>
                <div className="profile-list">
                  {followers.length > 0 ? (
                    followers.map((follower) => (
                      <div key={follower.user_id} className="profile-item">
                        <span
                          onClick={() => navigate(`/user/${follower.user_id}`)}
                        >
                          {follower.username || `User ${follower.user_id}`}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="no-data">No followers yet.</div>
                  )}
                </div>
                <button
                  className="close-btn"
                  onClick={() => setShowFollowersPopup(false)}
                >
                  Close
                </button>
              </div>
            </div>
          )}

          {showFollowingPopup && (
            <div
              className="popup-overlay"
              onClick={() => setShowFollowingPopup(false)}
            >
              <div
                className="popup-content"
                onClick={(e) => e.stopPropagation()}
              >
                <h2>Following</h2>
                <div className="profile-list">
                  {following.length > 0 ? (
                    following.map((followed) => (
                      <div key={followed.id} className="profile-item">
                        <span
                          onClick={() => navigate(`/user/${followed.user_id}`)}
                        >
                          {followed.username || `User ${followed.user_id}`}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="no-data">Not following anyone yet.</div>
                  )}
                </div>
                <button
                  className="close-btn"
                  onClick={() => setShowFollowingPopup(false)}
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </main>
      )}
    </div>
  );
};

export default UserPage;
