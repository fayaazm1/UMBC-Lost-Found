import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import postImage from "../assets/images/postHere_Image.jpg";
import "../assets/post.css";
import api from "../utils/apiConfig";
import { FaPlus, FaTrash } from 'react-icons/fa';

const Post = () => {
  const { currentUser } = useAuth();
  // Always enable verification questions in all environments
  const [showVerificationQuestions] = useState(true);
  
  const [formData, setFormData] = useState({
    reportType: "",
    itemName: "",
    description: "",
    location: "",
    contactDetails: "",
    date: "",
    time: "",
    verificationQuestions: [{ question: "", answer: "" }],
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
      // Log form data for debugging
      console.log('Submitting form data:', formData);
      
      // Create FormData with the exact field names expected by the backend
      const formDataToSend = new FormData();
      
      // Add all required fields with exact names expected by the backend
      formDataToSend.append('report_type', formData.reportType.toLowerCase().trim());
      formDataToSend.append('item_name', formData.itemName);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('location', formData.location);
      formDataToSend.append('contact_details', formData.contactDetails);
      formDataToSend.append('date', formData.date);
      formDataToSend.append('time', formData.time);
      formDataToSend.append('user_id', currentUser.uid);
      
      // Log the FormData entries for debugging
      console.log('FormData entries:');
      for (let pair of formDataToSend.entries()) {
        console.log(pair[0] + ': ' + pair[1]);
      }
      
      // Always include verification questions if they exist and are valid
      const validQuestions = formData.verificationQuestions.filter(q => q.question.trim() && q.answer.trim());
      if (validQuestions.length > 0) {
        // Ensure verification questions are properly formatted for the backend
        formDataToSend.append('verification_questions', JSON.stringify(validQuestions));
        console.log('Sending verification questions:', validQuestions);
      }

      setUploadProgress(50);
      // When using FormData, let Axios set the Content-Type header automatically
      // This ensures the correct boundary parameter is included
      const response = await api.post('/api/posts/', formDataToSend);
      console.log('API Response:', response.data);
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
        verificationQuestions: [{ question: "", answer: "" }],
      });
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (error) {
      console.error("Error submitting post:", error);
      
      // Improved error handling
      if (error.response) {
        console.log('Error response:', error.response);
        
        // Handle validation errors (422)
        if (error.response.status === 422) {
          const data = error.response.data;
          
          if (data && typeof data === 'object') {
            // Format validation errors in a user-friendly way
            let errorMessage = "Validation errors:\n";
            
            if (Array.isArray(data)) {
              // Handle array of errors
              errorMessage += data.map(err => `- ${err.msg || JSON.stringify(err)}`).join('\n');
            } else if (typeof data.detail === 'object') {
              // Handle nested error object
              try {
                const detailStr = JSON.stringify(data.detail);
                errorMessage = `Validation error: ${detailStr}`;
              } catch (e) {
                errorMessage = "Failed to create post. Validation error.";
              }
            } else {
              // Handle simple error message
              errorMessage = data.detail || "Failed to create post";
            }
            
            setError(errorMessage);
          } else {
            setError("Invalid form data. Please check all required fields.");
          }
        } else {
          // Handle other HTTP errors
          setError(`Server error (${error.response.status}): ${error.response.statusText || "Failed to create post"}`);
        }
      } else if (error.request) {
        // Request was made but no response received
        setError("No response from server. Please check your internet connection and try again.");
      } else {
        // Something else caused the error
        setError("Failed to create post: " + error.message);
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

          {/* Always show verification questions section */}
          <div className="form-group verification-questions-section" style={{ display: showVerificationQuestions ? 'block' : 'block' }}>
            <label>Verification Questions <span className="optional-text">(Optional)</span></label>
            <p className="verification-help-text">Add questions only the real owner would know the answer to (e.g., "What color is inside the wallet?")</p>
            
            {formData.verificationQuestions.map((q, index) => (
              <div key={index} className="verification-question-group">
                <div className="question-answer-pair">
                  <div className="question-input">
                    <input
                      type="text"
                      placeholder="Question"
                      value={q.question}
                      onChange={(e) => {
                        const newQuestions = [...formData.verificationQuestions];
                        newQuestions[index].question = e.target.value;
                        setFormData({ ...formData, verificationQuestions: newQuestions });
                      }}
                    />
                  </div>
                  <div className="answer-input">
                    <input
                      type="text"
                      placeholder="Answer"
                      value={q.answer}
                      onChange={(e) => {
                        const newQuestions = [...formData.verificationQuestions];
                        newQuestions[index].answer = e.target.value;
                        setFormData({ ...formData, verificationQuestions: newQuestions });
                      }}
                    />
                  </div>
                  {formData.verificationQuestions.length > 1 && (
                    <button 
                      type="button" 
                      className="remove-question-btn"
                      onClick={() => {
                        const newQuestions = formData.verificationQuestions.filter((_, i) => i !== index);
                        setFormData({ ...formData, verificationQuestions: newQuestions });
                      }}
                    >
                      <FaTrash />
                    </button>
                  )}
                </div>
              </div>
            ))}
            
            {formData.verificationQuestions.length < 3 && (
              <button 
                type="button" 
                className="add-question-btn"
                onClick={() => {
                  if (formData.verificationQuestions.length < 3) {
                    setFormData({
                      ...formData,
                      verificationQuestions: [...formData.verificationQuestions, { question: "", answer: "" }]
                    });
                  }
                }}
              >
                <FaPlus /> Add Question
              </button>
            )}
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
