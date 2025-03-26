// src/components/SearchResults.js
import React from "react";
import "../styles/search.css"; // Import CSS for styling

const SearchResults = ({ results }) => {
  return (
    <div className="search-results">
      {results.length > 0 ? (
        results.map((item, index) => (
          <div key={index} className="result-item">
            <h3>{item.name}</h3>
            <p>Found at: {item.location}</p>
          </div>
        ))
      ) : (
        <p>No items found.</p>
      )}
    </div>
  );
};

export default SearchResults;
