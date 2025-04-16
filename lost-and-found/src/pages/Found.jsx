import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Popup from "../components/Popup";
import "../assets/lost_found.css";
import "../assets/post_user.css";
import "../assets/found.css";
import { isPriorityPost } from "../utils/priorityClassifier";

const Found = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [popupData, setPopupData] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  const carouselRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/posts/`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log("All posts:", data); // Debug log

        if (!Array.isArray(data)) {
          throw new Error('Expected array of posts');
        }

        // Filter for found posts and ensure report_type is case-insensitive
        const foundPosts = data.filter(post => 
          post && post.report_type && post.report_type.toLowerCase() === "found"
        );
        // Debug log to check user information
        foundPosts.forEach(post => {
          console.log("Post user info:", post.user);
          console.log("Post ID:", post.id);
        });
        console.log("Found posts:", foundPosts); // Debug log
        setPosts(foundPosts);
      } catch (error) {
        console.error("Error fetching posts:", error);
      }
    };

    fetchPosts();
    const interval = setInterval(fetchPosts, 5000);
    return () => clearInterval(interval);
  }, []);

  const priorityPosts = posts.filter((post) => isPriorityPost(post.description));
  const duplicatedPosts = [...priorityPosts, ...priorityPosts];

  const animateCarousel = () => {
    if (!carouselRef.current || isPaused) {
      animationRef.current = requestAnimationFrame(animateCarousel);
      return;
    }
    const container = carouselRef.current;
    const scrollAmount = 1;
    container.scrollLeft += scrollAmount;
    if (container.scrollLeft >= container.scrollWidth / 2) {
      container.scrollLeft = 0;
    }
    animationRef.current = requestAnimationFrame(animateCarousel);
  };

  useEffect(() => {
    if (priorityPosts.length === 0) return;
    animationRef.current = requestAnimationFrame(animateCarousel);
    return () => cancelAnimationFrame(animationRef.current);
  }, [priorityPosts, isPaused]);

  const handleMouseDown = () => setIsPaused(true);
  const handleMouseUp = () => setIsPaused(false);

  return (
    <div className="found-container">
      <Navbar />
      <h1 className="lost-heading">Found Items</h1>
      <div className="content-wrapper">
        <div className="priority-section">
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
              <div key={index} className={`carousel-post${isPaused ? " paused" : ""}`} onClick={() => setPopupData(post)}>
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
          <h2 className="recent-title">Found Items</h2>
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
                    alt="Found Item"
                    style={{ width: "120px", marginTop: "8px" }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="right-sidebar">
          <div className="filter-section">
            <h2>Filter Posts</h2>
            <div className="filter-input">
              <input
                type="text"
                id="filterKeyword"
                placeholder="Search by keyword..."
              />
            </div>
            {/* Date filter input removed */}
            <div className="filter-input">
              <input
                type="text"
                id="filterLocation"
                placeholder="Location"
              />
            </div>
            <button className="filter-btn">Apply Filters</button>
            <button className="clear-btn">Clear Filters</button>
          </div>

          <div className="lost-something">
            <h3>Found Something?</h3>
            <button onClick={() => navigate("/post")} className="post-here-btn">
              Post Here
            </button>
          </div>
        </div>
      </div>

      {popupData && <Popup post={popupData} onClose={() => setPopupData(null)} />}
    </div>
  );
};

export default Found;
