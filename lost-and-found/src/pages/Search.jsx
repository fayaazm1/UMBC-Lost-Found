import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import './Search.css';

function Search() {
  const [searchParams] = useSearchParams();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
        const response = await axios.get(`/api/search?q=${encodeURIComponent(query)}`);
        setResults(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch search results. Please try again.');
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query]);

  if (loading) {
    return (
      <div className="search-container">
        <div className="loading">Searching...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="search-container">
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div className="search-container">
      <h2>Search Results for "{query}"</h2>
      {results.length === 0 ? (
        <div className="no-results">
          No items found matching your search.
        </div>
      ) : (
        <div className="search-results">
          {results.map((item) => (
            <div key={item.id} className="search-result-item">
              {item.image && (
                <img src={item.image} alt={item.title} className="item-image" />
              )}
              <div className="item-details">
                <h3>{item.title}</h3>
                <p className="item-description">{item.description}</p>
                <div className="item-meta">
                  <span className="item-type">{item.type}</span>
                  <span className="item-date">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Search;
