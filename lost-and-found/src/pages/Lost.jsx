import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
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

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/posts`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (!Array.isArray(data)) {
          throw new Error('Expected array of posts');
        }
        // Filter for lost posts and ensure report_type is case-insensitive
        const lostPosts = data.filter(post => 
          post && post.report_type && post.report_type.toLowerCase() === "lost"
        );
        console.log("Lost posts:", lostPosts); // Debug log
        setPosts(lostPosts);
      } catch (error) {
        console.error("Error fetching posts:", error);
        setPosts([]); // Set empty array on error
      }
    };

    fetchPosts();
    const interval = setInterval(fetchPosts, 5000);
    return () => clearInterval(interval);
  }, []);

  const priorityPosts = posts.filter((post) => post && post.description && isPriorityPost(post.description));
  console.log("Priority posts:", priorityPosts); // Debug log
  
  // Create a seamless infinite scroll by duplicating posts multiple times
  const duplicatedPosts = [...priorityPosts, ...priorityPosts, ...priorityPosts];

  const animateCarousel = () => {
    if (!carouselRef.current || isPaused || priorityPosts.length === 0) {
      animationRef.current = requestAnimationFrame(animateCarousel);
      return;
    }

    const container = carouselRef.current;
    const scrollAmount = 1;
    
    // If we're near the end, jump back to 1/3 of the way through
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
      {/* Decorative elements */}
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
              <div key={`${post.id}-${index}`} className={`carousel-post${isPaused ? " paused" : ""}`}>
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
                  <span className="read-more" onClick={() => setPopupData(post)}>
                    Continue...
                  </span>
                </div>
              </div>
            ))}
          </div>
          
          <h2 className="recent-title">Recent Posts</h2>
          <div className="recent-posts-list scrollable">
            {posts.filter((post) => !isPriorityPost(post.description)).map((post, index) => (
              <div key={post.id || index} className="recent-post-card">
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
                <span className="read-more" onClick={() => setPopupData(post)}>
                  Continue...
                </span>
              </div>
            ))}
          </div>
        </section>
        
        <aside className="right-sidebar">
          <div className="filter-section">
            <h3>Filter Posts</h3>
            <input type="text" placeholder="Search by keyword..." />
            <input type="date" placeholder="Date Lost" />
            <input type="text" placeholder="Location" />
            <button className="filter-btn">Apply Filters</button>
            <button className="clear-btn">Clear Filters</button>
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
