import React from 'react';
import { useNavigate } from 'react-router-dom';
import './FilterResultsPopup.css';

const FilterResultsPopup = ({ results, loading, error, onClose, onPostClick }) => {
  const navigate = useNavigate();

  const handlePostClick = (post) => {
    if (onPostClick) {
      onPostClick(post);
    } else {
      navigate(`/post/${post.id}`);
    }
    onClose();
  };

  return (
    <div className="filter-popup-overlay">
      <div className="filter-popup-content">
        <div className="filter-popup-header">
          <h2>Filter Results</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="filter-popup-body">
          {loading ? (
            <div className="loading-spinner">Loading...</div>
          ) : error ? (
            <div className="error-message">{error}</div>
          ) : results.length === 0 ? (
            <div className="no-results">No items found matching your criteria.</div>
          ) : (
            <div className="filter-results-list">
              {results.map((post) => (
                <div 
                  key={post.id} 
                  className="filter-result-item" 
                  onClick={() => handlePostClick(post)}
                >
                  <div className="result-header">
                    <span className={`result-type ${post.report_type.toLowerCase()}`}>
                      {post.report_type}
                    </span>
                    <span className="result-date">
                      {new Date(post.date).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="result-title">{post.item_name}</h3>
                  <p className="result-description">{post.description.slice(0, 100)}
                    {post.description.length > 100 ? '...' : ''}
                  </p>
                  <div className="result-location">
                    <strong>Location:</strong> {post.location}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FilterResultsPopup;
