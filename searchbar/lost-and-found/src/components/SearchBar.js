// src/components/SearchBar.js
import React, { useState } from "react";
import "../styles/search.css"; // Import CSS for styling

const SearchBar = ({ onSearch }) => {
  const [query, setQuery] = useState(""); // Store user input

  const handleSearch = () => {
    onSearch(query); // Send search query to parent component
  };

  return (
    <div className="search-bar">
      <input
        type="text"
        placeholder="Search for lost items..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <button onClick={handleSearch}>Search</button>
    </div>
  );
};

export default SearchBar;
