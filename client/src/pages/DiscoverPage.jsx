import React, { useEffect, useState } from "react";
import axios from "../axiosConfig";
import { useNavigate } from "react-router-dom";
import "./DiscoverPage.css";
import Navigation from "../components/Navigation";
import MovieCard from "../components/MovieCard";
import Loader from "../components/Loader";

const Stat = ({ label, value }) => (
  <div className="stat-card bg-gray-100 p-4 rounded-lg">
    <div className="stat-value text-2xl font-bold">{value}</div>
    <div className="stat-label text-gray-600">{label}</div>
  </div>
);

const DiscoverPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [language, setLanguage] = useState("");
  const [sortBy, setSortBy] = useState("rating");
  const [order, setOrder] = useState("desc");
  const [movies, setMovies] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const moviesPerPage = 20;

  const fetchData = async (pageNum = 1) => {
    try {
      setLoading(true);
      const response = await axios.get("/movie", {
        params: {
          sort_by: sortBy,
          order: order,
          language: language || undefined,
          search: searchTerm || undefined,
          limit: moviesPerPage,
          page: pageNum,
        },
      });
      setMovies(pageNum === 1 ? response.data : [...movies, ...response.data]);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch movies", err);
      setError("Failed to load movies. Please try again later.");
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    fetchData(1);
  }, [searchTerm, sortBy, order, language]);

  return (
    <div className="user-page-container min-h-screen bg-gray-50">
      <Navigation />
      <main className="main-content max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Discover Movies</h1>
        <div className="filters">
          <input
            type="text"
            placeholder="Search by title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input"
          />
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="select"
          >
            <option value="">All Languages</option>
            <option value="en">English</option>
            <option value="fr">French</option>
            <option value="es">Spanish</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="select"
          >
            <option value="rating">Rating</option>
            <option value="release_year">Release Year</option>
            <option value="title">Title</option>
          </select>
          <select
            value={order}
            onChange={(e) => setOrder(e.target.value)}
            className="select"
          >
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
          <button
            onClick={() => {
              setPage(1);
              fetchData(1);
            }}
            className="apply-button"
          >
            Apply
          </button>
        </div>

        <div className="stats-section grid grid-cols-1 sm:grid-cols-3 gap-4 mt-12">
          <Stat label="Total Movies" value={movies.length} />
          <Stat
            label="Average Rating"
            value={
              movies.length > 0
                ? (
                    movies.reduce(
                      (sum, movie) =>
                        sum + (movie.avg_user_rating || movie.rating || 0),
                      0
                    ) / movies.length
                  ).toFixed(1)
                : "N/A"
            }
          />
          <Stat
            label="Latest Release"
            value={
              movies.length > 0
                ? Math.max(...movies.map((movie) => movie.release_year || 0))
                : "N/A"
            }
          />
        </div>

        {loading && movies.length === 0 && <Loader></Loader>}

        {error && <div className="text-red-500 text-center py-12">{error}</div>}

        {!error && (
          <div>
            <div className="movie-gridd">
              {movies.map((movie) => (
                <MovieCard
                  key={movie.movie_id}
                  movie_id={movie.movie_id}
                  title={movie.title}
                  rating={movie.avg_user_rating || movie.rating}
                  poster_link={movie.poster_link}
                  genres={movie.genres}
                />
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default DiscoverPage;
