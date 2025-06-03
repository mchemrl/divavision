import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Star } from "lucide-react";
import Navigation from "../components/Navigation";
import Loader from "../components/Loader";
import "./MoviePage.css";

const StarRatingInput = ({ rating, setRating }) => {
  const handleClick = (event, index) => {
    const { left, width } = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - left;
    const isHalf = x < width / 2;
    setRating(isHalf ? index + 0.5 : index + 1);
  };

  return (
    <div className="star-input-container">
      {[...Array(5)].map((_, index) => {
        const isFull = rating >= index + 1;
        const isHalf = rating >= index + 0.5 && !isFull;

        return (
          <span
            key={index}
            className="star-wrapper"
            onClick={(e) => handleClick(e, index)}
          >
            <Star
              size={24}
              className={`star-icon ${
                isFull ? "full" : isHalf ? "half" : "empty"
              }`}
            />
          </span>
        );
      })}
    </div>
  );
};

const MoviePage = () => {
  const { movie_id } = useParams();
  const [movie, setMovie] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [submitMessage, setSubmitMessage] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [editingReviewId, setEditingReviewId] = useState(null);

  const navigate = useNavigate();
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [movieRes, reviewRes, profileRes] = await Promise.all([
          axios.get(`/movie/${movie_id}`),
          axios.get(`/review?movie_id=${movie_id}&limit=50`),
          axios.get("/profile/me"),
        ]);
        setMovie(movieRes.data);
        setReviews(reviewRes.data);
        setCurrentUserId(profileRes.data.id);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch data", err);
        setError("Failed to load movie. Please try again later.");
        setLoading(false);
      }
    };
    fetchData();
  }, [movie_id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingReviewId) {
        await axios.put("/review", {
          review_id: editingReviewId,
          rating,
          review_text: reviewText,
        });
        setSubmitMessage("Review updated!");
        setEditingReviewId(null);
      } else {
        await axios.post("/review", {
          user_id: currentUserId,
          movie_id: parseInt(movie_id),
          rating,
          review_text: reviewText,
        });
        setSubmitMessage("Review submitted!");
      }

      setRating(0);
      setReviewText("");
      const updatedReviews = await axios.get(`/review?movie_id=${movie_id}`);
      setReviews(updatedReviews.data);
    } catch (err) {
      console.error("Failed to submit/update review", err);
      setSubmitMessage("Error submitting review.");
    }
  };
  const handleDelete = async (review_id) => {
    try {
      await axios.delete(`/review`, {
        params: { review_id },
      });
      const updatedReviews = await axios.get(`/review?movie_id=${movie_id}`);
      setReviews(updatedReviews.data);
    } catch (err) {
      console.error("Failed to delete review", err);
    }
  };

  return (
    <div className="user-page-container">
      <Navigation />

      <main className="main-content">
        <button onClick={() => navigate("/discover")} className="back-button">
          ← Back to browsing
        </button>

        {isLoading ? (
          <Loader />
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          movie && (
            <>
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
                      {movie.avg_user_rating.toFixed(1)} / 5 (Users) |{" "}
                      {movie.rating.toFixed(1)} (IMDb)
                    </p>
                  </div>
                </div>
              </div>

              <section className="review-form">
                <h2 className="form-heading">Leave a Review</h2>
                <form onSubmit={handleSubmit} className="form-body">
                  <label className="form-label">
                    Rating (0–5):
                    <StarRatingInput rating={rating} setRating={setRating} />
                  </label>

                  <label className="form-label">
                    Your Review:
                    <textarea
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      placeholder="Write your thoughts..."
                      className="form-textarea"
                    />
                  </label>

                  <button type="submit" className="submit-button">
                    Submit Review
                  </button>

                  {submitMessage && (
                    <p className="submit-message">{submitMessage}</p>
                  )}
                </form>
              </section>

              <section className="review-list">
                <h2>User Reviews</h2>
                {reviews.length === 0 ? (
                  <p>No reviews yet.</p>
                ) : (
                  <ul>
                    {reviews.map((rev) => (
                      <li key={rev.review_id} style={{ marginBottom: "1rem" }}>
                        <p>
                          <strong>{rev.username}</strong>
                        </p>
                        <p>
                          <strong>Rating:</strong> {rev.rating} / 5
                        </p>
                        <p>
                          <strong>Review:</strong> {rev.review_text}
                        </p>
                        <p>
                          <strong>Date:</strong> {rev.created_at}
                        </p>

                        {rev.user_id === currentUserId && (
                          <div style={{ marginTop: "0.5rem" }}>
                            <button
                              className="edit-btn"
                              onClick={() => {
                                setRating(rev.rating);
                                setReviewText(rev.review_text);
                                setEditingReviewId(rev.review_id);
                              }}
                            >
                              Edit
                            </button>
                            <button
                              className="delete-btn"
                              onClick={() => handleDelete(rev.review_id)}
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </>
          )
        )}
      </main>
    </div>
  );
};

export default MoviePage;
