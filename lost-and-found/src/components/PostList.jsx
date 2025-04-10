import React, { useEffect, useState } from "react";

const PostList = () => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/posts`);
        const data = await response.json();
        console.log("🚀 Posts received:", data);
        setPosts(data);
      } catch (error) {
        console.error("Error fetching posts:", error);
      }
    };

    fetchPosts();
  }, []);

  return (
    <div className="post-list">
      <h2>All Posts</h2>
      {posts.length === 0 ? (
        <p>No posts found.</p>
      ) : (
        posts.map((post) => (
          <div key={post.id} className="post-card">
            <h3>{post.item_name} ({post.report_type})</h3>
            <p><strong>Posted by:</strong> {post.user?.username || "Unknown"}</p>
            <p>{post.description}</p>
            <p><strong>Location:</strong> {post.location}</p>
            <p><strong>Contact:</strong> {post.contact_details}</p>
            <p><strong>Date:</strong> {new Date(post.date).toLocaleDateString()}</p>
            {post.image_path && (
              <img
              src={`${import.meta.env.VITE_API_BASE_URL}/${post.image_path}`}
                alt="Uploaded"
                width="150"
              />
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default PostList;
