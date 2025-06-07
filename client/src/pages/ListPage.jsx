import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import Navigation from "../components/Navigation";
import MovieCard from "../components/MovieCard";
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

  useEffect(() => {
    const fetchList = async () => {
      try {
        const res = await axios.get(`/list/${list_id}`);
        setList(res.data.list);
        setFormData({
          title: res.data.list.title,
          description: res.data.list.description,
          picture_url: res.data.list.picture_url,
        });
      } catch (err) {
        console.error("Failed to fetch list", err);
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

  if (!list) return <div>Loading...</div>;

  return (
    <div className="list-page">
      <Navigation />
      <main className="list-detail-content">
        {isEditing ? (
          <div className="edit-form">
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="Title"
            />
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Description"
            />
            <input
              type="text"
              value={formData.picture_url}
              onChange={(e) =>
                setFormData({ ...formData, picture_url: e.target.value })
              }
              placeholder="Image URL"
            />
            <button onClick={handleUpdate}>Save</button>
            <button onClick={() => setIsEditing(false)}>Cancel</button>
          </div>
        ) : (
          <div className="list-detail-header">
            <img
              src={list.picture_url}
              alt={list.title}
              className="list-detail-image"
            />
            <h1>{list.title}</h1>
            <p>{list.description}</p>
            <button onClick={() => setIsEditing(true)} className="primary-btn">
              Edit
            </button>
          </div>
        )}

        {showMoviePopup && (
          <div className="movie-popup">
            <div className="movie-popup-content">
              <input
                type="text"
                placeholder="Search movies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button onClick={handleSearchMovies}>Search</button>
              <button onClick={() => setShowMoviePopup(false)}>Close</button>
              {loading ? (
                <p>Loading...</p>
              ) : (
                <div className="movie-grid">
                  {searchResults.map((movie) => (
                    <div key={movie.movie_id}>
                      <MovieCard {...movie} />
                      <button onClick={() => handleAddMovie(movie.movie_id)}>
                        Add to List
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="movie-grid">
          {list.movies.map((movie) => (
            <div key={movie.movie_id} className="movie-card-wrapper">
              <MovieCard {...movie} />
              <button
                className="remove-movie-btn"
                onClick={() => handleRemoveMovie(movie.movie_id)}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
        <div className="add-movie-form">
          <button
            onClick={() => setShowMoviePopup(true)}
            className="primary-btn"
          >
            Add Movie
          </button>
        </div>
      </main>
    </div>
  );
};

export default ListPage;
