import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaSearch, FaUser, FaCog, FaSignOutAlt } from 'react-icons/fa';
import './Navbar.css';
import { useAuth } from '../contexts/AuthContext';

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setIsMenuOpen(false);
    setIsProfileOpen(false);
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/welcome');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    setIsProfileOpen(false);
  };

  const toggleProfile = () => {
    setIsProfileOpen(!isProfileOpen);
    setIsMenuOpen(false);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
    setIsProfileOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="nav-left">
        <Link to="/" className="logo" onClick={closeMenu}>
          <div className="logo-text">
            <span className="logo-letter">L</span>
            <span>OST</span>
            <span className="logo-and">&</span>
            <span>FOUND</span>
          </div>
        </Link>
      </div>

      <div className="nav-center">
        <div className="search-container">
          <input 
            type="text" 
            className="search-input" 
            placeholder="Search for items..." 
          />
          <FaSearch className="search-icon" />
        </div>
        
        <div className="nav-links">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/lost" className="nav-link">Lost</Link>
          <Link to="/found" className="nav-link">Found</Link>
          <Link to="/about" className="nav-link">About</Link>
          <Link to="/contact" className="nav-link">Contact</Link>
        </div>
      </div>

      <div className="nav-right">
        <div className="notification-icons">
          <Link to="/messages" className="icon-link">
            <div className="icon-container">
              <span className="icon">💬</span>
              <span className="badge">2</span>
            </div>
          </Link>
          <Link to="/notifications" className="icon-link">
            <div className="icon-container">
              <span className="icon">🔔</span>
              <span className="badge">3</span>
            </div>
          </Link>
        </div>

        {currentUser && (
          <div className="profile-section">
            <button className="profile-button" onClick={toggleProfile}>
              <span className="profile-name">{currentUser.displayName || 'User'}</span>
              <FaUser className="profile-icon" />
            </button>
            
            {isProfileOpen && (
              <div className="profile-dropdown">
                <Link to="/profile" className="dropdown-item" onClick={closeMenu}>
                  <FaUser className="item-icon" />
                  <span>Profile</span>
                </Link>
                <Link to="/settings" className="dropdown-item" onClick={closeMenu}>
                  <FaCog className="item-icon" />
                  <span>Settings</span>
                </Link>
                <button className="dropdown-item logout" onClick={handleLogout}>
                  <FaSignOutAlt className="item-icon" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <button
        className={`hamburger-menu ${isMenuOpen ? 'active' : ''}`}
        onClick={toggleMenu}
        aria-label="Toggle menu"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      <div className={`mobile-menu ${isMenuOpen ? 'active' : ''}`}>
        <div className="search-container">
          <input 
            type="text" 
            className="search-input" 
            placeholder="Search for items..." 
          />
          <FaSearch className="search-icon" />
        </div>

        <div className="nav-links">
          <Link to="/" className="nav-link" onClick={closeMenu}>Home</Link>
          <Link to="/lost" className="nav-link" onClick={closeMenu}>Lost</Link>
          <Link to="/found" className="nav-link" onClick={closeMenu}>Found</Link>
          <Link to="/about" className="nav-link" onClick={closeMenu}>About</Link>
          <Link to="/contact" className="nav-link" onClick={closeMenu}>Contact</Link>
        </div>

        <div className="notification-icons">
          <Link to="/messages" className="icon-link" onClick={closeMenu}>
            <div className="icon-container">
              <span className="icon">💬</span>
              <span className="badge">2</span>
            </div>
          </Link>
          <Link to="/notifications" className="icon-link" onClick={closeMenu}>
            <div className="icon-container">
              <span className="icon">🔔</span>
              <span className="badge">3</span>
            </div>
          </Link>
        </div>

        {currentUser && (
          <div className="mobile-profile-section">
            <Link to="/profile" className="nav-link" onClick={closeMenu}>Profile</Link>
            <Link to="/settings" className="nav-link" onClick={closeMenu}>Settings</Link>
            <button className="nav-link logout-button" onClick={handleLogout}>Logout</button>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
