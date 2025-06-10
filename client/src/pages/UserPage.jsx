import React, { useEffect, useState } from "react";
import { Star } from "lucide-react";
import axios from "../axiosConfig";
import { useNavigate, useParams } from "react-router-dom";
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

const TopRatedMovies = ({ movies }) => (
  <div className="top-rated-section">
    <h2 className="section-title">Top-Rated Movies</h2>
    <div className="movie-grid">
      {movies.map((movie) => (
        <MovieCard key={movie.title} {...movie} />
      ))}
    </div>
  </div>
);

const Stat = ({ label, value }) => (
  <div className="stat-card">
    <div className="stat-value">{value || 0}</div>
    <div className="stat-label">{label}</div>
  </div>
);

const UserPage = () => {
  const { user_id } = useParams();
  const navigate = useNavigate();
  const [loggedInUserId, setLoggedInUserId] = useState(null);
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [watchedMovies, setWatchedMovies] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const isOwnProfile = user?.id === loggedInUserId;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        let profileRes;
        try {
          profileRes = await axios.get("/profile/me");
          setLoggedInUserId(profileRes.data.id);
        } catch (err) {
          const storedUserId = localStorage.getItem('user_id');
          const storedUsername = localStorage.getItem('username');

          if (!storedUserId || !storedUsername) {
            navigate('/login');
            return;
          }

          setLoggedInUserId(parseInt(storedUserId));
          if (!user_id) {
            setUser({
              id: parseInt(storedUserId),
              username: storedUsername
            });
            setStats({ watched: 0, favorites: 0, reviews: 0, lists: 0 });
            setIsLoading(false);
            return;
          }
        }

        const targetId = user_id || profileRes.data.id;

        const [userRes, statsRes, watchedRes, favoritesRes] = await Promise.all([
          axios.get(`/profile/${targetId}`),
          axios.get(`/profile/${targetId}/stats`),
          axios.get(`/profile/${targetId}/watched`),
          axios.get(`/profile/${targetId}/favorites`),
        ]);

        setUser(userRes.data);
        setStats(statsRes.data);
        setWatchedMovies(watchedRes.data.watched || []);
        setFavorites(favoritesRes.data.favorites || []);
      } catch (err) {
        console.error("Failed to fetch user data", err);
        setError("Failed to load user data. Please try again.");

        if (err.response?.status === 401 || err.response?.status === 403) {
          localStorage.clear();
          navigate('/login');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user_id, navigate]);

  if (isLoading) {
    return (
      <div className="user-page-container">
        <Navigation />
        <main className="main-content">
          <Loader />
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="user-page-container">
        <Navigation />
        <main className="main-content">
          <div className="error-message">
            <h2>Error</h2>
            <p>{error}</p>
            <button onClick={() => window.location.reload()}>Try Again</button>
          </div>
        </main>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="user-page-container">
        <Navigation />
        <main className="main-content">
          <div className="error-message">
            <h2>User not found</h2>
            <p>The user profile could not be loaded.</p>
            <button onClick={() => navigate('/login')}>Go to Login</button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="user-page-container">
      <Navigation />
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
            <Stat label="Watched" value={stats?.watched} />
            <Stat label="Favorites" value={stats?.favorites} />
            <Stat label="Reviews" value={stats?.reviews} />
            <Stat label="Lists" value={stats?.lists} />
          </div>
        </div>

        <div className="summary-cards fade-in">
          <div className="summary-card">Favorite Genres</div>
          <div className="summary-card">Movies Watched Over Time</div>
        </div>

        <div className="top-rated-container fade-in">
          <TopRatedMovies
            movies={favorites.map((fav) => ({
              title: fav.title,
              rating: fav.rating,
            }))}
          />
        </div>

        <div className="tabs-section fade-in">
          <div className="tabs">
            <button className="tab-active">Watched Movies</button>
            <button className="tab">Lists</button>
            <button className="tab">Favorites</button>
            <button className="tab">Recent Reviews</button>
          </div>
          <div className="movie-grid fade-in">
            {watchedMovies.map((movie, index) => (
              <MovieCard
                key={movie.title || index}
                title={movie.title}
                rating={movie.rating}
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserPage;