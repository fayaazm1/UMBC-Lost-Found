import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import postImage from "../assets/images/postHere_Image.jpg";
import "../assets/post.css"; 

const Post = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    reportType: "",
    itemName: "",
    description: "",
    location: "",
    contactDetails: "",
    date: "",
    time: "",
    image: null, 
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Set default date to today
    const today = new Date().toISOString().split('T')[0];
    setFormData(prev => ({ ...prev, date: today }));
  }, []);

  // Function to handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError("File size should be less than 5MB");
        return;
      }
      setFormData({ ...formData, image: file });
      setError("");
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    if (!currentUser) {
      setError("You must be logged in to create a post");
      setLoading(false);
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append("report_type", formData.reportType.toLowerCase());
    formDataToSend.append("item_name", formData.itemName);
    formDataToSend.append("description", formData.description);
    formDataToSend.append("location", formData.location);
    formDataToSend.append("contact_details", formData.contactDetails);
    formDataToSend.append("date", formData.date);
    formDataToSend.append("time", formData.time);
    formDataToSend.append("user_id", currentUser.uid);

    if (formData.image) {
      formDataToSend.append("image", formData.image);
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/posts`, {
        method: "POST",
        body: formDataToSend,
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setFormData({
          reportType: "",
          itemName: "",
          description: "",
          location: "",
          contactDetails: "",
          date: new Date().toISOString().split('T')[0],
          time: "",
          image: null,
        });
        
        // Reset file input
        const fileInput = document.querySelector('input[type="file"]');
        if (fileInput) fileInput.value = '';

        // Navigate to home page after successful post
        setTimeout(() => {
          navigate('/');
        }, 2000);
        
      } else {
        setError(data.detail || "Failed to create post");
      }
    } catch (error) {
      console.error("Error submitting post:", error);
      setError("Failed to create post. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="content-wrapper">
      {/* Add particles */}
      <div className="particle"></div>
      <div className="particle"></div>
      <div className="particle"></div>
      <div className="particle"></div>
      <div className="particle"></div>
      
      <div className="image-section">
        <img src={postImage} alt="Lost Item" className="post-image" />
      </div>

      <div className="form-section">
        <h2 className="section-title">Post Here!!</h2>
        
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">Post Created Successfully!</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Report Type</label>
            <select 
              value={formData.reportType} 
              onChange={(e) => setFormData({ ...formData, reportType: e.target.value })}
              required
            >
              <option value="">Select</option>
              <option value="lost">Lost</option>
              <option value="found">Found</option>
            </select>
          </div>

          <div className="form-group">
            <label>Item Name</label>
            <input
              type="text"
              value={formData.itemName}
              onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
              placeholder="Enter the name of the item"
              required
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Provide detailed description of the item"
              required
            />
          </div>

          <div className="form-group">
            <label>Location</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="Where was it lost/found?"
              required
            />
          </div>

          <div className="form-group">
            <label>Contact Details</label>
            <input
              type="text"
              value={formData.contactDetails}
              onChange={(e) => setFormData({ ...formData, contactDetails: e.target.value })}
              placeholder="How can people contact you?"
              required
            />
          </div>

          <div className="form-group">
            <label>Date</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              max={new Date().toISOString().split('T')[0]}
              required
            />
          </div>

          <div className="form-group">
            <label>Time</label>
            <input
              type="time"
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Image (Optional)</label>
            <input
              type="file"
              onChange={handleFileChange}
              accept="image/*"
              className="file-input"
            />
            <small className="file-hint">Maximum file size: 5MB</small>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className={loading ? 'loading' : ''}
          >
            {loading ? "Creating Post..." : "Create Post"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Post;
