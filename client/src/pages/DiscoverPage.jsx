import React, { useEffect, useState } from "react";
import { Star } from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./UserPage.css";
import "./DiscoverPage.css";
import Navigation from "../components/Navigation";

const MovieCard = ({ title, rating, poster_link, movie_id, genres }) => {
  const navigate = useNavigate();

  return (
    <div className="movie-card">
      <div className="movie-poster-container">
        <img
          src={
            poster_link
              ? `https://image.tmdb.org/t/p/w500${poster_link}`
              : "https://via.placeholder.com/150x200"
          }
          alt={title}
          className="movie-poster"
        />
      </div>
      <div className="movie-info">
        <div className="movie-title">{title}</div>
        <div className="movie-genres">
          {genres.map((genre, index) => (
            <span key={index} className={`genre-tag ${genre.toLowerCase()}`}>
              {genre}
            </span>
          ))}
        </div>
        <div className="movie-rating">
          <Star className="w-4 h-4" />
          <span>{rating ? rating.toFixed(1) : "N/A"} / 5</span>
        </div>
        <a
          href={`/movie/${movie_id}`}
          className="see-more"
          onClick={(e) => {
            e.preventDefault();
            navigate(`/movie/${movie_id}`);
          }}
        >
          See more
        </a>
      </div>
    </div>
  );
};

const Stat = ({ label, value }) => (
  <div className="stat-card bg-gray-100 p-4 rounded-lg">
    <div className="stat-value text-2xl font-bold">{value}</div>
    <div className="stat-label text-gray-600">{label}</div>
  </div>
);

const DiscoverPage = () => {
  const [movies, setMovies] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const moviesPerPage = 20;

  const fetchData = async (pageNum) => {
    try {
      setLoading(true);
      const response = await axios.get("/movie", {
        params: {
          sort_by: "rating",
          order: "desc",
          limit: moviesPerPage,
          page: pageNum,
        },
      });
      setMovies((prev) =>
        pageNum === 1 ? response.data : [...prev, ...response.data]
      );
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch movies", err);
      setError("Failed to load movies. Please try again later.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(page);
  }, [page]);

  return (
    <div className="user-page-container min-h-screen bg-gray-50">
      <Navigation />
      <main className="main-content max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Discover Movies</h1>

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

        {loading && movies.length === 0 && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4">Loading movies...</p>
          </div>
        )}

        {error && <div className="text-red-500 text-center py-12">{error}</div>}

        {!error && (
          <div>
            <div className="movie-grid">
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
