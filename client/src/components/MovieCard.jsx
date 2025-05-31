import React from "react";
import { useNavigate } from "react-router-dom";
import "./MovieCard.css";
import { Star } from "lucide-react";

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

export default MovieCard;
