import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";
import "../assets/search.css";
import "../assets/post_user.css";

const FilterResults = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFilteredResults = async () => {
      try {
        setLoading(true);
        const url = `${import.meta.env.VITE_API_BASE_URL}/api/posts/filter${location.search}`;
        console.log("Fetching from URL:", url); // Debug log
        const response = await axios.get(url, { 
          withCredentials: true,
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });
        console.log("Response data:", response.data); // Debug log
        setResults(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching filtered results:", err);
        setError("Failed to fetch results. Please try again.");
        setLoading(false);
      }
    };

    if (location.search) { // Only fetch if there are search params
      fetchFilteredResults();
    } else {
      setLoading(false);
    }
  }, [location.search]);

  const handlePostClick = (post) => {
    navigate(`/post/${post.id}`);
  };

  if (loading) {
    return (
      <div className="container">
        <Navbar />
        <div className="loading">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <Navbar />
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div className="container">
      <Navbar />
      <div className="search-container">
        <h1 className="search-title">Filter Results</h1>
        <div className="search-results">
          {results.length === 0 ? (
            <div className="no-results">No items found matching your filters.</div>
          ) : (
            results.map((post) => (
              <div
                key={post.id}
                className="result-card"
                onClick={() => handlePostClick(post)}
              >
                <div className="result-header">
                  <span className={`result-type ${post.report_type.toLowerCase()}`}>
                    {post.report_type}
                  </span>
                  <span className="result-date">
                    {new Date(post.date).toLocaleDateString()}
                  </span>
                </div>
                <h2 className="result-title">{post.item_name}</h2>
                <p className="result-description">{post.description}</p>
                <div className="result-location"> {post.location}</div>
                {post.image_path && (
                  <img
                    src={`${import.meta.env.VITE_API_BASE_URL}/${post.image_path}`}
                    alt={post.item_name}
                    className="result-image"
                  />
                )}
                <div className="result-user">
                  Posted by {post.user?.username || "Anonymous"}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default FilterResults;
