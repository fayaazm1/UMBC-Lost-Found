// src/components/SearchPage.js
import React, { useState } from "react";
import SearchBar from "./SearchBar";
import SearchResults from "./SearchResults";
import "../styles/search.css";

const SearchPage = () => {
  const [results, setResults] = useState([]);

  const dummyItems = [
    { name: "Blue Backpack", location: "Library" },
    { name: "iPhone 12", location: "Cafeteria" },
    { name: "Car Keys", location: "Parking Lot" },
  ];

  const handleSearch = (query) => {
    const filteredItems = dummyItems.filter((item) =>
      item.name.toLowerCase().includes(query.toLowerCase())
    );
    setResults(filteredItems);
  };

  return (
    <div className="search-page">
      <h2>Lost and Found Search</h2>
      <SearchBar onSearch={handleSearch} />
      <SearchResults results={results} />
    </div>
  );
};

export default SearchPage;
