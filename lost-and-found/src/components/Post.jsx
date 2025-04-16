import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { uploadPostImage } from "../utils/storage";
import postImage from "../assets/images/postHere_Image.jpg";
import "../assets/post.css"; 

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
    image: null, 
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

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
      
      // Create and set preview
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle form submission
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

    let imageUrl = null;
    
    try {
      // Upload image to Firebase Storage if provided
      if (formData.image) {
        setUploadProgress(10);
        // Generate a temporary post ID for organizing files in storage
        const tempPostId = new Date().getTime().toString();
        imageUrl = await uploadPostImage(formData.image, currentUser.uid, tempPostId);
        setUploadProgress(50);
      }
      
      // Create request body
      const normalizedReportType = formData.reportType.toLowerCase().trim();
      console.log('Sending report_type:', normalizedReportType); // Debug log
      
      const postData = {
        report_type: normalizedReportType,
        item_name: formData.itemName,
        description: formData.description,
        location: formData.location,
        contact_details: formData.contactDetails,
        date: formData.date,
        time: formData.time,
        user_id: currentUser.email,
        image_url: imageUrl // Now we're sending the URL instead of the file
      };

      // Send the post data to the backend
      setUploadProgress(70);
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/posts`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(postData),
      });

      const data = await response.json();
      setUploadProgress(100);

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
        
        // Reset file input and preview
        setImagePreview(null);
        const fileInput = document.querySelector('input[type="file"]');
        if (fileInput) fileInput.value = '';
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccess(false);
        }, 3000);
      } else {
        setError(data.detail || "Failed to create post");
      }
    } catch (error) {
      console.error("Error submitting post:", error);
      setError("Failed to create post. Please try again.");
    } finally {
      setLoading(false);
      setUploadProgress(0);
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
            <div className="image-upload-container">
              <input
                type="file"
                onChange={handleFileChange}
                accept="image/*"
                className="file-input"
              />
              {imagePreview && (
                <div className="image-preview">
                  <img src={imagePreview} alt="Preview" className="preview-thumbnail" />
                </div>
              )}
              <small className="file-hint">Maximum file size: 5MB</small>
            </div>
          </div>

          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="upload-progress">
              <div className="progress-bar" style={{ width: `${uploadProgress}%` }}></div>
              <span className="progress-text">{uploadProgress}% Uploaded</span>
            </div>
          )}

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
