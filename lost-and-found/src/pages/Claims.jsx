import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import api from '../utils/apiConfig';
import { getPosts } from '../utils/mockPostApi';
import '../assets/claims.css';

const Claims = () => {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('received'); // 'received' or 'submitted'
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [responseMessage, setResponseMessage] = useState('');
  const [originalPost, setOriginalPost] = useState(null);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    fetchClaims();
  }, [currentUser, navigate]);

  const fetchClaims = async () => {
    try {
      setLoading(true);
      // For testing, we'll use the mock API
      // In production, this would be:
      // const response = await api.get(`/api/claims/user/${currentUser.uid}`);
      // setClaims(response.data);
      
      // Using mock data from localStorage
      const mockClaims = JSON.parse(localStorage.getItem('mockClaims') || '[]');
      setClaims(mockClaims);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching claims:', error);
      setError('Failed to load claims. Please try again.');
      setLoading(false);
    }
  };

  const handleClaimAction = async (claimId, status) => {
    try {
      await api.put(`/api/claims/${claimId}`, {
        status,
        message: responseMessage
      });
      
      // Update the claim in the local state
      setClaims(prevClaims => 
        prevClaims.map(claim => 
          claim.id === claimId 
            ? { ...claim, status, response_message: responseMessage } 
            : claim
        )
      );
      
      setSelectedClaim(null);
      setResponseMessage('');
    } catch (error) {
      console.error('Error updating claim:', error);
      setError('Failed to update claim. Please try again.');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const receivedClaims = claims.filter(claim => claim.role === 'owner');
  const submittedClaims = claims.filter(claim => claim.role === 'claimant');

  return (
    <div className="claims-page">
      <Navbar />
      
      <div className="claims-container">
        <h1>Item Claims</h1>
        
        {error && <div className="error-message">{error}</div>}
        
        <div className="tabs">
          <button 
            className={`tab ${activeTab === 'received' ? 'active' : ''}`}
            onClick={() => setActiveTab('received')}
          >
            Received Claims ({receivedClaims.length})
          </button>
          <button 
            className={`tab ${activeTab === 'submitted' ? 'active' : ''}`}
            onClick={() => setActiveTab('submitted')}
          >
            Submitted Claims ({submittedClaims.length})
          </button>
        </div>
        
        {loading ? (
          <div className="loading">Loading claims...</div>
        ) : (
          <div className="claims-list">
            {activeTab === 'received' ? (
              receivedClaims.length > 0 ? (
                receivedClaims.map(claim => (
                  <div key={claim.id} className={`claim-card ${claim.status}`}>
                    <div className="claim-header">
                      <h3>Claim for Item: {claim.post?.item_name || 'Unknown Item'}</h3>
                      <span className={`status ${claim.status}`}>{claim.status}</span>
                    </div>
                    
                    <div className="claim-details">
                      <p><strong>Submitted:</strong> {formatDate(claim.created_at)}</p>
                      <p><strong>Contact Info:</strong> {claim.contact_info}</p>
                      
                      {claim.answers && claim.answers.length > 0 && (
                        <div className="verification-answers">
                          <h4>Verification Answers:</h4>
                          <ul>
                            {claim.answers.map((answer, index) => (
                              <li key={index}>
                                <strong>Q: {answer.question}</strong>
                                <p>A: {answer.answer}</p>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {claim.status === 'pending' && (
                        <div className="claim-actions">
                          <button 
                            className="approve-button"
                            onClick={() => setSelectedClaim(claim)}
                          >
                            Review Claim
                          </button>
                        </div>
                      )}
                      
                      {claim.status !== 'pending' && claim.response_message && (
                        <div className="response-message">
                          <p><strong>Your Response:</strong> {claim.response_message}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <p>You haven't received any claims for your found items yet.</p>
                </div>
              )
            ) : (
              submittedClaims.length > 0 ? (
                submittedClaims.map(claim => (
                  <div key={claim.id} className={`claim-card ${claim.status}`}>
                    <div className="claim-header">
                      <h3>Your Claim for: {claim.post?.item_name || 'Unknown Item'}</h3>
                      <span className={`status ${claim.status}`}>{claim.status}</span>
                    </div>
                    
                    <div className="claim-details">
                      <p><strong>Submitted:</strong> {formatDate(claim.created_at)}</p>
                      <p><strong>Your Contact Info:</strong> {claim.contact_info}</p>
                      
                      {claim.answers && claim.answers.length > 0 && (
                        <div className="verification-answers">
                          <h4>Your Answers:</h4>
                          <ul>
                            {claim.answers.map((answer, index) => (
                              <li key={index}>
                                <strong>Q: {answer.question}</strong>
                                <p>A: {answer.answer}</p>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {claim.status !== 'pending' && claim.response_message && (
                        <div className="response-message">
                          <p><strong>Finder's Response:</strong> {claim.response_message}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <p>You haven't submitted any claims for found items yet.</p>
                </div>
              )
            )}
          </div>
        )}
      </div>
      
      {selectedClaim && (
        <div className="modal-overlay">
          <div className="claim-review-modal">
            <h2>Review Claim</h2>
            
            <div className="claim-info">
              <p><strong>Item:</strong> {selectedClaim.post?.item_name || 'Unknown Item'}</p>
              <p><strong>Claimant Contact:</strong> {selectedClaim.contact_info}</p>
              
              {selectedClaim.answers && selectedClaim.answers.length > 0 && (
                <div className="verification-answers">
                  <h3>Verification Answers:</h3>
                  <div className="answer-comparison">
                    <table className="comparison-table">
                      <thead>
                        <tr>
                          <th>Question</th>
                          <th>Correct Answer</th>
                          <th>Claimant's Answer</th>
                          <th>Match?</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedClaim.answers.map((answer, index) => {
                          // Find the original question and answer from the post
                          const originalQuestion = selectedClaim.post?.verification_questions?.[index] || {};
                          const isMatch = originalQuestion.answer?.toLowerCase() === answer.answer?.toLowerCase();
                          
                          return (
                            <tr key={index} className={isMatch ? 'match' : 'no-match'}>
                              <td><strong>{answer.question}</strong></td>
                              <td>{originalQuestion.answer || 'N/A'}</td>
                              <td>{answer.answer}</td>
                              <td>
                                <span className={`match-indicator ${isMatch ? 'yes' : 'no'}`}>
                                  {isMatch ? '✓' : '✗'}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
            
            <div className="response-input">
              <label>Response Message (optional):</label>
              <textarea 
                value={responseMessage}
                onChange={(e) => setResponseMessage(e.target.value)}
                placeholder="Add a message to the claimant..."
              />
            </div>
            
            <div className="modal-actions">
              <button className="cancel-button" onClick={() => {
                setSelectedClaim(null);
                setResponseMessage('');
              }}>
                Cancel
              </button>
              <button 
                className="reject-button"
                onClick={() => handleClaimAction(selectedClaim.id, 'rejected')}
              >
                Reject Claim
              </button>
              <button 
                className="approve-button"
                onClick={() => handleClaimAction(selectedClaim.id, 'approved')}
              >
                Approve Claim
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Claims;
