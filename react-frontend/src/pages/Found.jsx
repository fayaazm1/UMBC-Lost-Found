import React from "react";
import Navbar from "../components/Navbar";

const FoundPage = () => {
  return (
    <div style={{ backgroundColor: "#01303f", minHeight: "100vh", color: "#d4f0fc" }}>
      <div className="container py-5">
        <h1 className="text-center mb-4" style={{ color: "#02a9f7" }}>🔍 Found Items</h1>

        {/* Placeholder for found item cards */}
        <div className="row g-4">
          <div className="col-md-4">
            <div className="card bg-dark text-light border border-info shadow-lg">
              <div className="card-body">
                <h5 className="card-title">🧢 Found Cap</h5>
                <p className="card-text">Blue Nike cap found near the Retriever Activity Center.</p>
                <button className="btn btn-outline-info btn-sm">View Details</button>
              </div>
            </div>
          </div>

          {/* More found items will go here */}
        </div>
      </div>
    </div>
  );
};

export default FoundPage;
