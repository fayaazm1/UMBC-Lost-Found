import React, { useState, useEffect, useRef } from "react";
import { API_BASE_URL } from "../utils/apiConfig";
import api from "../utils/apiConfig";
import Navbar from "../components/Navbar";
import FilterResultsPopup from "../components/FilterResultsPopup";
import Popup from "../components/Popup";
import "../assets/lost_found.css";
import "../assets/post_user.css";
import { isPriorityPost } from "../utils/priorityClassifier";
import { useNavigate } from "react-router-dom";

const Lost = () => {
  const [posts, setPosts] = useState([]);
  const navigate = useNavigate();
  const [popupData, setPopupData] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  const carouselRef = useRef(null);
  const animationRef = useRef(null);
  const [filters, setFilters] = useState({
    keyword: "",
    date: "", // Keep this in state but hide from UI
    location: "",
  });
  const [showFilterResults, setShowFilterResults] = useState(false);
  const [filterResults, setFilterResults] = useState([]);
  const [filterLoading, setFilterLoading] = useState(false);
  const [filterError, setFilterError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    
    const loadPosts = async () => {
      try {
        const response = await api.get('/api/posts');
        const data = response.data;
        
        if (isMounted) {
          const lostPosts = data.filter(post => 
            post && post.report_type && post.report_type.toLowerCase() === "lost"
          );
          setPosts(lostPosts);
          console.log("Lost posts:", lostPosts);
        }
      } catch (error) {
        console.error("Error fetching posts:", error);
        if (isMounted) {
          setPosts([]); // Set empty array on error
        }
      }
    };

    loadPosts();
    
    const intervalId = setInterval(() => {
      if (isMounted) {
        loadPosts();
      }
    }, 5000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, []);

  const fetchPosts = async (filterParams = null) => {
    let isActive = true;
    
    try {
      let url = '/api/posts';
      if (filterParams) {
        url = '/api/posts/filter';
        const params = new URLSearchParams();
        if (filterParams.keyword) params.append("keyword", filterParams.keyword);
        if (filterParams.date) params.append("date", filterParams.date);
        if (filterParams.location) params.append("location", filterParams.location);
        params.append("type", "lost"); // Always filter for lost items
        url += `?${params.toString()}`;
      }

      const response = await api.get(url);
      const data = response.data;
      if (!Array.isArray(data)) {
        throw new Error('Expected array of posts');
      }
      const lostPosts = filterParams ? data : data.filter(post => 
        post && post.report_type && post.report_type.toLowerCase() === "lost"
      );
      
      if (isActive) {
        setPosts(lostPosts);
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
      if (isActive) {
        setPosts([]); // Set empty array on error
      }
    }
    
    return () => {
      isActive = false;
    };
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const applyFilters = async () => {
    let isActive = true;
    
    setFilterLoading(true);
    setFilterError(null);
    
    try {
      const queryParams = {
        ...filters,
        type: "lost" // Always filter for LOST items only from this page
      };
      
      const queryString = new URLSearchParams(queryParams).toString();
      console.log("Filtering for LOST items:", queryString);
      
      const response = await api.get(
        `/api/posts/filter?${queryString}`
      );
      
      const lostItemsOnly = response.data.filter(item => 
        item.report_type && item.report_type.toLowerCase() === "lost"
      );
      
      if (isActive) {
        setFilterResults(lostItemsOnly);
        setShowFilterResults(true);
        setFilterLoading(false);
      }
    } catch (error) {
      console.error("Filter error:", error);
      if (isActive) {
        setFilterError("Failed to fetch results. Please try again.");
        setFilterLoading(false);
      }
    }
    
    return () => {
      isActive = false;
    };
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
    let isMounted = true;
    animationRef.current = requestAnimationFrame(animateCarousel);
    return () => {
      isMounted = false;
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [priorityPosts.length, isPaused]);

  const handleMouseDown = () => setIsPaused(true);
  const handleMouseUp = () => setIsPaused(false);

  const closeFilterResults = () => {
    setShowFilterResults(false);
  };

  const handleFilterResultClick = (post) => {
    setPopupData(post);
  };

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
                    src={`${API_BASE_URL}/${post.image_path}`}
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
            {/* Date input removed from UI */}
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

      {showFilterResults && (
        <FilterResultsPopup
          results={filterResults}
          loading={filterLoading}
          error={filterError}
          onClose={closeFilterResults}
          onPostClick={handleFilterResultClick}
        />
      )}

      {popupData && <Popup post={popupData} onClose={() => setPopupData(null)} />}
    </div>
  );
};

export default Lost;
