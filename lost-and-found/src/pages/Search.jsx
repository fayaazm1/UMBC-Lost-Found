import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import './Search.css';
import Navbar from '../components/Navbar';
import Popup from '../components/Popup';

function Search() {
  const [searchParams] = useSearchParams();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [popupData, setPopupData] = useState(null);

  const query = searchParams.get('q');

  useEffect(() => {
    const fetchResults = async () => {
      if (!query) {
        setResults([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/posts/search?q=${encodeURIComponent(query)}`, {
          withCredentials: true
        });

        const data = response.data;
        if (Array.isArray(data)) {
          setResults(data);
        } else {
          console.warn("Expected array but got:", data);
          setResults([]);
        }
        setError(null);
      } catch (err) {
        console.error('Search error:', err);
        setError('Failed to fetch search results. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query]);

  return (
    <div className="page-container">
      <Navbar />
      <div className="search-container">
        {loading ? (
          <div className="loading">Searching...</div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : (
          <>
            <h2>Search Results for "{query}"</h2>
            {results.length === 0 ? (
              <div className="no-results">
                No items found matching your search.
              </div>
            ) : (
              <div className="search-results">
                {results.map((item) => (
                  <div 
                    key={item.id} 
                    className="search-result-item" 
                    data-type={item.type}
                    onClick={() => setPopupData(item)}
                  >
                    <div className="item-type-badge">{item.type}</div>
                    {item.image && (
                      <img 
                        src={`${import.meta.env.VITE_API_BASE_URL}${item.image}`} 
                        alt={item.title} 
                        className="item-image" 
                      />
                    )}
                    <div className="item-details">
                      <h3>{item.title}</h3>
                      <p className="item-description">{item.description}</p>
                      <div className="item-meta">
                        <span className="item-location">📍 {item.location}</span>
                        <span className="item-date">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      {item.user && (
                        <div className="item-user">
                          Posted by {item.user.username}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
      {popupData && (
        <Popup 
          post={popupData} 
          onClose={() => setPopupData(null)}
        />
      )}
    </div>
  );
}

export default Search;
