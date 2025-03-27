import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";

const LostPage = () => {
  const [lostItems, setLostItems] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios.get("http://localhost:8000/lost") // ✅ already correct
      .then((response) => {
        setLostItems([response.data]);
      })
      .catch((error) => {
        console.error("❌ Error fetching lost items:", error);
        setError("Failed to fetch lost items");
      });
  }, []);
  

  return (
    <div style={{ backgroundColor: "#01303f", minHeight: "100vh", color: "#d4f0fc" }}>
      <Navbar />
      <div className="container py-5">
        <h1 className="text-center mb-4" style={{ color: "#02a9f7" }}>📦 Lost Items</h1>
        {error && <p className="text-danger text-center">{error}</p>}
        <div className="row g-4">
          {lostItems.length > 0 ? (
            lostItems.map((item, index) => (
              <div className="col-md-4" key={index}>
                <div className="card bg-dark text-light border border-info shadow-lg">
                  <div className="card-body">
                    <h5 className="card-title">🎒 {item.title || "Lost Item"}</h5>
                    <p className="card-text">{item.description || "Item description..."}</p>
                    <button className="btn btn-outline-info btn-sm">View Details</button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center">Loading lost items...</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default LostPage;
