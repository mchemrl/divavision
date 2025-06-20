import React, { useEffect, useState } from "react";
import axios from "../axiosConfig";
import { useParams } from "react-router-dom";
import Navigation from "../components/Navigation";
import MovieCard from "../components/MovieCard";
import Loader from "../components/Loader";
import "./ListPage.css";

const ListPage = () => {
  const { list_id } = useParams();
  const [list, setList] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    picture_url: "",
  });
  const [showMoviePopup, setShowMoviePopup] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loggedInUserId, setLoggedInUserId] = useState(null);

  useEffect(() => {
    const fetchList = async () => {
      try {
        const profileRes = await axios.get("/profile/me");
        const currentUserId = profileRes.data?.id;
        if (!currentUserId)
          throw new Error("Failed to fetch logged-in user ID");
        setLoggedInUserId(currentUserId);
        setInitialLoading(true);
        const res = await axios.get(`/list/${list_id}`);
        setList(res.data.list);
        setFormData({
          title: res.data.list.title,
          description: res.data.list.description,
          picture_url: res.data.list.picture_url,
        });
      } catch (err) {
        console.error("Failed to fetch list", err);
      } finally {
        setInitialLoading(false);
      }
    };
    fetchList();
  }, [list_id]);

  const handleUpdate = async () => {
    try {
      await axios.put(`/list/${list_id}`, formData);
      const res = await axios.get(`/list/${list_id}`);
      setList(res.data.list);
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to update list", err);
    }
  };

  const handleAddMovie = async (movieId) => {
    try {
      await axios.post(`/list/${list_id}/movies`, { movie_id: movieId });
      const res = await axios.get(`/list/${list_id}`);
      setList(res.data.list);
    } catch (err) {
      console.error("Failed to add movie", err);
    }
  };

  const handleRemoveMovie = async (movieId) => {
    try {
      await axios.delete(`/list/${list_id}/movies/${movieId}`);
      const res = await axios.get(`/list/${list_id}`);
      setList(res.data.list);
    } catch (err) {
      console.error("Failed to remove movie", err);
    }
  };

  const handleSearchMovies = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/movie", {
        params: { search: searchTerm, limit: 10 },
      });
      setSearchResults(res.data);
      setLoading(false);
    } catch (err) {
      console.error("Failed to search movies", err);
      setLoading(false);
    }
  };
  const isOwner = list?.user_id === loggedInUserId;

  return (
    <div className="listt-page">
      <Navigation />
      {initialLoading ? (
        <main className="main-content">
          <Loader />
        </main>
      ) : (
        <main className="main-content">
          <section className="listt-header-section">
            {isEditing ? (
              <div className="edit-form">
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="Title"
                  className="edit-input"
                />
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Description"
                  className="edit-textarea"
                />
                <input
                  type="text"
                  value={formData.picture_url}
                  onChange={(e) =>
                    setFormData({ ...formData, picture_url: e.target.value })
                  }
                  placeholder="Image URL"
                  className="edit-input"
                />
                <div className="edit-buttons">
                  <button onClick={handleUpdate} className="save-btn">
                    Save
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="cancel-btn"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="listt-header">
                <img
                  src={list.picture_url}
                  alt={list.title}
                  className="listt-image"
                />
                <div className="listt-info">
                  <h1 className="listt-title">{list.title}</h1>
                  <p className="listt-description">{list.description}</p>
                  {isOwner && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="edit-btnn"
                    >
                      Edit
                    </button>
                  )}
                  {isOwner && (
                    <button
                      onClick={() => setShowMoviePopup(true)}
                      className="add-movie-btn"
                    >
                      Add Movie
                    </button>
                  )}
                </div>
              </div>
            )}
          </section>

          <section className="movie-section">
            <div className="movie-grid">
              {list.movies.map((movie) => (
                <div key={movie.movie_id} className="movie-card-wrapper">
                  <MovieCard {...movie} />
                  <button
                    className="remove-btn"
                    onClick={() => handleRemoveMovie(movie.movie_id)}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </section>

          {showMoviePopup && (
            <div className="movie-popup-overlay">
              <div className="movie-popup-content">
                <div className="search-bar">
                  <input
                    type="text"
                    placeholder="Search movies..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                  />
                  <button onClick={handleSearchMovies} className="search-btn">
                    Search
                  </button>
                  <button
                    onClick={() => setShowMoviePopup(false)}
                    className="close-btn"
                  >
                    Close
                  </button>
                </div>
                {loading ? (
                  <Loader />
                ) : (
                  <div className="movie-grid">
                    {searchResults.map((movie) => (
                      <div key={movie.movie_id} className="movie-search-card">
                        <MovieCard {...movie} />
                        {list.movies.some(
                          (m) => m.movie_id === movie.movie_id
                        ) && <span className="added-badge">Added</span>}
                        <button
                          onClick={() => handleAddMovie(movie.movie_id)}
                          disabled={list.movies.some(
                            (m) => m.movie_id === movie.movie_id
                          )}
                          className="add-btn"
                        >
                          Add to List
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      )}
    </div>
  );
};

export default ListPage;
