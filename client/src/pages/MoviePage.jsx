import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Star } from "lucide-react";
import Navigation from "../components/Navigation";
import Loader from "../components/Loader";
import "./MoviePage.css";

const MoviePage = () => {
  const { movie_id } = useParams();
  const [movie, setMovie] = useState(null);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/movie/${movie_id}`);
        setMovie(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch movie", err);
        setError("Failed to load movie. Please try again later.");
        setLoading(false);
      }
    };
    fetchData();
  }, [movie_id]);

  return (
    <div className="user-page-container">
      <Navigation />

      <main className="main-content">
        <button
          onClick={() => navigate("/discover")}
          className="back-button"
          style={{}}
        >
          ← Back to browsing
        </button>
        {isLoading ? (
          <Loader />
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          movie && (
            <div className="movie-details">
              <img
                src={`https://image.tmdb.org/t/p/w500${movie.poster_link}`}
                alt={movie.title}
                className="movie-posterr"
              />
              <div>
                <h1 className="movie-titlee">{movie.title}</h1>
                <p className="movie-tagline">{movie.tagline}</p>
                <p className="movie-description">{movie.description}</p>
                <div className="movie-meta">
                  <p>
                    <strong>Year:</strong> {movie.release_year}
                  </p>
                  <p>
                    <strong>Runtime:</strong> {movie.runtime} min
                  </p>
                  <p>
                    <strong>Language:</strong> {movie.original_language}
                  </p>
                  <p>
                    <strong>Genres:</strong> {movie.genres?.join(", ")}
                  </p>
                  <p>
                    <strong>Production:</strong> {movie.production_companies}
                  </p>
                  <p className="movie-rating">
                    <Star className="text-yellow-500" size={20} />
                    {movie.avg_user_rating.toFixed(1)} / 10 (Users) |{" "}
                    {movie.rating.toFixed(1)} (IMDb)
                  </p>
                </div>
              </div>
            </div>
          )
        )}
      </main>
    </div>
  );
};

export default MoviePage;
