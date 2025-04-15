import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";
import Popup from "../components/Popup";
import "../assets/lost_found.css";
import "../assets/post_user.css";
import { isPriorityPost } from "../utils/priorityClassifier";

const Lost = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [popupData, setPopupData] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  const carouselRef = useRef(null);
  const animationRef = useRef(null);
  const [filters, setFilters] = useState({
    keyword: "",
    date: "",
    location: "",
  });

  const fetchPosts = async (filterParams = null) => {
    try {
      let url = `${import.meta.env.VITE_API_BASE_URL}/api/posts`;
      if (filterParams) {
        url = `${import.meta.env.VITE_API_BASE_URL}/api/posts/filter`;
        const params = new URLSearchParams();
        if (filterParams.keyword) params.append("keyword", filterParams.keyword);
        if (filterParams.date) params.append("date", filterParams.date);
        if (filterParams.location) params.append("location", filterParams.location);
        params.append("type", "lost"); // Always filter for lost items
        url += `?${params.toString()}`;
      }

      const response = await axios.get(url, { withCredentials: true });
      const data = response.data;
      if (!Array.isArray(data)) {
        throw new Error('Expected array of posts');
      }
      // Filter for lost posts and ensure report_type is case-insensitive
      const lostPosts = filterParams ? data : data.filter(post => 
        post && post.report_type && post.report_type.toLowerCase() === "lost"
      );
      setPosts(lostPosts);
    } catch (error) {
      console.error("Error fetching posts:", error);
      setPosts([]); // Set empty array on error
    }
  };

  useEffect(() => {
    fetchPosts();
    const interval = setInterval(() => fetchPosts(), 5000);
    return () => clearInterval(interval);
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const applyFilters = () => {
    // Only include non-empty filters
    const activeFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, value]) => value !== "")
    );
    if (Object.keys(activeFilters).length > 0) {
      fetchPosts(activeFilters);
    }
  };

  const clearFilters = () => {
    setFilters({
      keyword: "",
      date: "",
      location: "",
    });
    fetchPosts(); // Fetch all posts without filters
  };

  const priorityPosts = posts.filter((post) => post && post.description && isPriorityPost(post.description));
  const duplicatedPosts = [...priorityPosts, ...priorityPosts, ...priorityPosts];

  const animateCarousel = () => {
    if (!carouselRef.current || isPaused || priorityPosts.length === 0) {
      animationRef.current = requestAnimationFrame(animateCarousel);
      return;
    }

    const container = carouselRef.current;
    const scrollAmount = 1;
    
    if (container.scrollLeft >= (container.scrollWidth * 2) / 3) {
      container.scrollLeft = container.scrollWidth / 3;
    } else {
      container.scrollLeft += scrollAmount;
    }

    animationRef.current = requestAnimationFrame(animateCarousel);
  };

  useEffect(() => {
    animationRef.current = requestAnimationFrame(animateCarousel);
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [priorityPosts.length, isPaused]);

  const handleMouseDown = () => setIsPaused(true);
  const handleMouseUp = () => setIsPaused(false);

  return (
    <div className="container">
      <Navbar />
      <div className="decorative-circle circle-1"></div>
      <div className="decorative-circle circle-2"></div>
      
      <h1 className="lost-heading">Lost Items</h1>
      
      <div className="content-wrapper">
        <section className="priority-section">
          <h2 className="priority-title">Priority Posts</h2>
          <div
            className="carousel-container"
            ref={carouselRef}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onTouchStart={handleMouseDown}
            onTouchEnd={handleMouseUp}
          >
            {duplicatedPosts.map((post, index) => (
              <div key={`${post.id}-${index}`} className={`carousel-post${isPaused ? " paused" : ""}`} onClick={() => setPopupData(post)}>
                <div className="post-header">
                  <span className="post-date">
                    {new Date(post.date).toLocaleDateString(undefined, {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                  <span className="post-user">
                    {post.user?.username || "Unknown"} posted in Lost & Found · {post.time}
                  </span>
                </div>
                <div className="post-body">
                  <p className="post-title">{post.item_name}</p>
                  <p className="post-description">
                    {post.description.substring(0, 100)}
                    {post.description.length > 100 ? "..." : ""}
                  </p>
                </div>
              </div>
            ))}
          </div>
          
          <h2 className="recent-title">Lost Items</h2>
          <div className="recent-posts-list scrollable">
            {posts.map((post, index) => (
              <div key={index} className="recent-post-card" onClick={() => setPopupData(post)}>
                <div className="recent-post-date">
                  {new Date(post.date).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </div>
                <div className="recent-post-meta">
                  {post.user?.username || "Unknown"} posted in Lost & Found · {post.time}
                </div>
                <div className="recent-post-title">{post.item_name}</div>
                <div className="recent-post-desc">{post.description}</div>
                {post.image_path && (
                  <img
                    src={`${import.meta.env.VITE_API_BASE_URL}/${post.image_path}`}
                    alt="Lost Item"
                    style={{ width: "120px", marginTop: "8px" }}
                  />
                )}
              </div>
            ))}
          </div>
        </section>
        
        <aside className="right-sidebar">
          <div className="filter-section">
            <h3>Filter Posts</h3>
            <input 
              type="text" 
              name="keyword"
              value={filters.keyword}
              onChange={handleFilterChange}
              placeholder="Search by keyword..." 
            />
            <input 
              type="date" 
              name="date"
              value={filters.date}
              onChange={handleFilterChange}
              placeholder="Date Lost" 
            />
            <input 
              type="text" 
              name="location"
              value={filters.location}
              onChange={handleFilterChange}
              placeholder="Location" 
            />
            <button className="filter-btn" onClick={applyFilters}>Apply Filters</button>
            <button className="clear-btn" onClick={clearFilters}>Clear Filters</button>
          </div>
          
          <div className="lost-something">
            <h3>Lost Something?</h3>
            <button onClick={() => navigate("/post")} className="post-here-btn">
              Post Here
            </button>
          </div>
        </aside>
      </div>

      {popupData && <Popup post={popupData} onClose={() => setPopupData(null)} />}
    </div>
  );
};

export default Lost;
