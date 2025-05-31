import React, { useEffect, useState } from "react";
import { Star } from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./UserPage.css";
import Navigation from "../components/Navigation";

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
    <h2 className="section-title">Your Top-Rated Movies</h2>
    <div className="movie-grid">
      {movies.map((movie) => (
        <MovieCard key={movie.title} {...movie} />
      ))}
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
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [watchedMovies, setWatchedMovies] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const profileRes = await axios.get("/profile/me");
        const profileData = profileRes.data;
        setUser(profileData);

        const statsRes = await axios.get(`/profile/${profileData.id}/stats`);
        setStats(statsRes.data);

        const watchedRes = await axios.get(
          `/profile/${profileData.id}/watched`
        );
        setWatchedMovies(watchedRes.data.watched);

        const favoritesRes = await axios.get(
          `/profile/${profileData.id}/favorites`
        );
        setFavorites(favoritesRes.data.favorites);
      } catch (err) {
        console.error("Failed to fetch user data", err);
      }
    };
    fetchData();
  }, []);

  if (!user || !stats) return <div>Loading...</div>;

  return (
    <div className="user-page-container">
      <Navigation />

      <main className="main-content">
        <div className="profile-section">
          <div className="profile-avatar" />
          <div>
            <h1 className="profile-name">{user.username}</h1>
            <p className="profile-bio">
              {user.bio || "Lover of sad indie films 🎬"}
            </p>
            <button className="edit-profile-btn">Edit Profile</button>
          </div>
          <div className="profile-stats">
            <Stat label="Watched" value={stats.watched} />
            <Stat label="Favorites" value={stats.favorites} />
            <Stat label="Reviews" value={stats.reviews} />
            <Stat label="Lists" value={stats.lists} />
          </div>
        </div>

        <div className="summary-cards">
          <div className="summary-card">Favorite Genres</div>
          <div className="summary-card">Movies Watched Over Time</div>
        </div>

        <div className="top-rated-container">
          <TopRatedMovies
            movies={favorites.map((fav) => ({
              title: fav.title,
              rating: fav.rating,
            }))}
          />
        </div>

        <div className="tabs-section">
          <div className="tabs">
            <button className="tab-active">Watched Movies</button>
            <button className="tab">Lists</button>
            <button className="tab">Favorites</button>
            <button className="tab">Recent Reviews</button>
          </div>
          <div className="movie-grid">
            {watchedMovies.map((movie) => (
              <MovieCard
                key={movie.title}
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
