import React, { useEffect, useState } from "react";
import axios from "../axiosConfig";
import { useNavigate } from "react-router-dom";
import Navigation from "../components/Navigation";
import Loader from "../components/Loader";
import "./ListsPage.css";

const ListsPage = () => {
  const [lists, setLists] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [newList, setNewList] = useState({
    title: "",
    description: "",
    picture_url: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchLists = async () => {
      setIsLoading(true);
      try {
        const profileRes = await axios.get(`/profile/me`);
        const res = await axios.get(`/list/?user_id=${profileRes.data.id}`);
        setLists(res.data);
      } catch (err) {
        console.error("Failed to fetch lists", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLists();
  }, []);

  const handleDelete = async (list_id) => {
    setIsLoading(true);
    try {
      await axios.delete(`http://localhost:5000/list/${list_id}`);
      setLists(lists.filter((list) => list.list_id !== list_id));
    } catch (err) {
      console.error("Failed to delete list", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async () => {
    setIsLoading(true);
    try {
      const profileRes = await axios.get(`/profile/me`);
      await axios.post("http://localhost:3000/list/", newList);
      const res = await axios.get(`/list/?user_id=${profileRes.data.id}`);
      setLists(res.data);
      setNewList({ title: "", description: "", picture_url: "" });
      setShowPopup(false);
    } catch (err) {
      console.error("Failed to create list", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="list-page">
      <Navigation />
      {isLoading ? (
        <main className="main-content">
          <Loader />
        </main>
      ) : (
        <main className="main-content fade-in">
          <h1 className="list-header">My Lists</h1>
          <div className="list-grid">
            {lists.map((list) => (
              <div key={list.list_id} className="list-card">
                <img
                  src={list.picture_url}
                  alt={list.title}
                  className="list-image"
                />
                <h2 className="list-title">{list.title}</h2>
                <p className="list-description">{list.description}</p>
                <div className="list-actions">
                  <button onClick={() => navigate(`/list/${list.list_id}`)}>
                    View
                  </button>
                  <button onClick={() => handleDelete(list.list_id)}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
            <button
              className="create-button"
              onClick={() => setShowPopup(true)}
            >
              ＋ Create New List
            </button>
          </div>

          {showPopup && (
            <div className="popup-overlay">
              <div className="popup">
                <h2>Create New List</h2>
                <input
                  type="text"
                  placeholder="Title"
                  value={newList.title}
                  onChange={(e) =>
                    setNewList({ ...newList, title: e.target.value })
                  }
                />
                <textarea
                  placeholder="Description"
                  value={newList.description}
                  onChange={(e) =>
                    setNewList({ ...newList, description: e.target.value })
                  }
                />
                <input
                  type="text"
                  placeholder="Image URL"
                  value={newList.picture_url}
                  onChange={(e) =>
                    setNewList({ ...newList, picture_url: e.target.value })
                  }
                />
                <div className="popup-buttons">
                  <button onClick={handleCreate}>Create</button>
                  <button onClick={() => setShowPopup(false)}>Cancel</button>
                </div>
              </div>
            </div>
          )}
        </main>
      )}
    </div>
  );
};

export default ListsPage;
