import React from 'react';
import './Logo.css';

function Logo() {
  return (
    <div className="logo-container">
      <div className="logo-l">
        <div className="l-vertical"></div>
        <div className="l-horizontal"></div>
      </div>
      <div className="logo-text-container">
        <span className="logo-text">OST</span>
        <span className="logo-and">&</span>
        <span className="logo-text">FOUND</span>
      </div>
    </div>
  );
}

export default Logo;
