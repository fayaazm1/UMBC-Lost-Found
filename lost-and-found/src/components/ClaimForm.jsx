import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/apiConfig';
import '../assets/claim.css';

const ClaimForm = ({ postId, onClose, onSuccess }) => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [post, setPost] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [contactInfo, setContactInfo] = useState('');

  // Fetch post details including verification questions
  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/api/posts/${postId}`);
        setPost(response.data);
        
        // Initialize answers array based on questions
        if (response.data.verification_questions && response.data.verification_questions.length > 0) {
          setAnswers(response.data.verification_questions.map(() => ''));
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching post:', error);
        setError('Failed to load post details. Please try again.');
        setLoading(false);
      }
    };

    if (postId) {
      fetchPost();
    }
  }, [postId]);

  const handleAnswerChange = (index, value) => {
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    if (!currentUser) {
      setError('You must be logged in to claim an item');
      setLoading(false);
      return;
    }

    if (!contactInfo.trim()) {
      setError('Please provide your contact information');
      setLoading(false);
      return;
    }

    try {
      // Create claim data
      const claimData = {
        post_id: postId,
        user_id: currentUser.uid,
        contact_info: contactInfo,
        answers: post.verification_questions.map((q, index) => ({
          question: q.question,
          answer: answers[index]
        }))
      };

      // Submit claim
      const response = await api.post('/api/claims/', claimData);
      
      setSuccess(true);
      if (onSuccess) {
        onSuccess(response.data);
      }
      
      // Auto-close after success
      setTimeout(() => {
        if (onClose) {
          onClose();
        }
      }, 3000);
    } catch (error) {
      console.error('Error submitting claim:', error);
      if (error.response && error.response.data) {
        setError(error.response.data.detail || 'Failed to submit claim');
      } else {
        setError('Failed to submit claim. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading && !post) {
    return <div className="claim-form loading">Loading...</div>;
  }

  if (!post) {
    return <div className="claim-form error">Post not found</div>;
  }

  return (
    <div className="claim-form-container">
      <div className="claim-form">
        <h2>Claim Item: {post.item_name}</h2>
        <p className="claim-description">
          To claim this item, please answer the verification questions below and provide your contact information.
        </p>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">Claim submitted successfully! The finder will contact you if your answers match.</div>}

        <form onSubmit={handleSubmit}>
          {post.verification_questions && post.verification_questions.length > 0 ? (
            <div className="verification-section">
              <h3>Verification Questions</h3>
              <p className="verification-help">Please answer these questions to verify you are the owner:</p>
              
              {post.verification_questions.map((question, index) => (
                <div key={index} className="form-group">
                  <label>{question.question}</label>
                  <input
                    type="text"
                    value={answers[index] || ''}
                    onChange={(e) => handleAnswerChange(index, e.target.value)}
                    required
                  />
                </div>
              ))}
            </div>
          ) : (
            <p className="no-questions">No verification questions for this item. Please provide your contact information to claim.</p>
          )}

          <div className="form-group">
            <label>Your Contact Information</label>
            <textarea
              value={contactInfo}
              onChange={(e) => setContactInfo(e.target.value)}
              placeholder="Please provide your phone number or email so the finder can contact you"
              required
            />
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="cancel-button">Cancel</button>
            <button type="submit" disabled={loading} className="submit-button">
              {loading ? 'Submitting...' : 'Submit Claim'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClaimForm;
