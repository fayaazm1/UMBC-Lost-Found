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
        const response = await fetch("http://localhost:8000/api/posts/");
        const data = await response.json();
        const lostPosts = data.filter(post => post.report_type?.toLowerCase() === "lost");
        setPosts(lostPosts);
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
              <div key={index} className={`carousel-post${isPaused ? " paused" : ""}`}>
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
            {posts.filter((post) => !isPriorityPost(post.description)).slice(0, 5).map((post, index) => (
              <div key={index} className="recent-post-card">
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
                    src={`http://localhost:8000/${post.image_path}`}
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
