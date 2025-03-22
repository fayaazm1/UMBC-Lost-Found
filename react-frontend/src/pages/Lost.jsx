import React from "react";
import Navbar from "../components/Navbar";

const LostPage = () => {
  return (
    <div style={{ backgroundColor: "#01303f", minHeight: "100vh", color: "#d4f0fc" }}>
      <div className="container py-5">
        <h1 className="text-center mb-4" style={{ color: "#02a9f7" }}>📦 Lost Items</h1>

        {/* Placeholder for lost item cards */}
        <div className="row g-4">
          <div className="col-md-4">
            <div className="card bg-dark text-light border border-info shadow-lg">
              <div className="card-body">
                <h5 className="card-title">🎒 Lost Backpack</h5>
                <p className="card-text">Black backpack with UMBC logo last seen in ITE building.</p>
                <button className="btn btn-outline-info btn-sm">View Details</button>
              </div>
            </div>
          </div>

          {/* More items can be dynamically listed here */}
        </div>
      </div>
    </div>
  );
};

export default LostPage;
