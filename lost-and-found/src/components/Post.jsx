import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import postImage from "../assets/images/postHere_Image.jpg";
import "../assets/post.css";
import api from "../utils/apiConfig";

const Post = () => {
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState({
    reportType: "",
    itemName: "",
    description: "",
    location: "",
    contactDetails: "",
    date: "",
    time: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setFormData(prev => ({ ...prev, date: today }));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);
    setUploadProgress(0);

    if (!currentUser) {
      setError("You must be logged in to create a post");
      setLoading(false);
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('report_type', formData.reportType.toLowerCase().trim());
      formDataToSend.append('item_name', formData.itemName);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('location', formData.location);
      formDataToSend.append('contact_details', formData.contactDetails);
      formDataToSend.append('date', formData.date);
      formDataToSend.append('time', formData.time);
      // Send Firebase UID instead of email for consistent user identification
      formDataToSend.append('user_id', currentUser.uid);

      setUploadProgress(50);
      const response = await api.post('/api/posts/', formDataToSend);
      setUploadProgress(100);

      // Success - axios automatically throws for non-2xx responses
      setSuccess(true);
      setFormData({
        reportType: "",
        itemName: "",
        description: "",
        location: "",
        contactDetails: "",
        date: new Date().toISOString().split('T')[0],
        time: "",
      });
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (error) {
      console.error("Error submitting post:", error);
      if (error.response && error.response.data) {
        const data = error.response.data;
        if (typeof data.detail === 'object') {
          try {
            setError(JSON.stringify(data.detail));
          } catch (e) {
            setError("Failed to create post. Validation error.");
          }
        } else {
          setError(data.detail || "Failed to create post");
        }
      } else {
        setError("Failed to create post. Please try again.");
      }
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="content-wrapper">
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
              required>
              <option value="">Select</option>
              <option value="lost">Lost</option>
              <option value="found">Found</option>
            </select>
          </div>

          <div className="form-group">
            <label>Item Name</label>
            <input type="text" value={formData.itemName} onChange={(e) => setFormData({ ...formData, itemName: e.target.value })} placeholder="Enter the name of the item" required />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Provide detailed description of the item" required />
          </div>

          <div className="form-group">
            <label>Location</label>
            <input type="text" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} placeholder="Where was it lost/found?" required />
          </div>

          <div className="form-group">
            <label>Contact Details</label>
            <input type="text" value={formData.contactDetails} onChange={(e) => setFormData({ ...formData, contactDetails: e.target.value })} placeholder="How can people contact you?" required />
          </div>

          <div className="form-group">
            <label>Date</label>
            <input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} max={new Date().toISOString().split('T')[0]} required />
          </div>

          <div className="form-group">
            <label>Time</label>
            <input type="time" value={formData.time} onChange={(e) => setFormData({ ...formData, time: e.target.value })} required />
          </div>

          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="upload-progress">
              <div className="progress-bar" style={{ width: `${uploadProgress}%` }}></div>
              <span className="progress-text">{uploadProgress}% Uploaded</span>
            </div>
          )}

          <button type="submit" disabled={loading} className={loading ? 'loading' : ''}>
            {loading ? "Creating Post..." : "Create Post"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Post;
