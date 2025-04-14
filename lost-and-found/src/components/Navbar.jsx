import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaSearch, FaUser, FaCog, FaSignOutAlt, FaEnvelope, FaBars, FaBell, FaShieldAlt } from 'react-icons/fa';
import './Navbar.css';
import { useAuth } from '../contexts/AuthContext';
import NotificationBell from './NotificationBell';

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setIsMenuOpen(false);
    setIsProfileOpen(false);
  }, [navigate]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMenuOpen && !event.target.closest('.mobile-menu') && !event.target.closest('.hamburger-menu')) {
        setIsMenuOpen(false);
      }
      if (isProfileOpen && !event.target.closest('.profile-section')) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isMenuOpen, isProfileOpen]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/welcome');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  const toggleMenu = (e) => {
    e.stopPropagation();
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <>
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

        <div className="nav-center desktop-only">
          <div className="search-container">
            <input 
              type="text" 
              className="search-input" 
              placeholder="Search for items..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch(e)}
            />
            <FaSearch className="search-icon" onClick={handleSearch} />
          </div>
          
          <div className="nav-links">
            <Link to="/" className="nav-link">Home</Link>
            <Link to="/lost" className="nav-link">Lost</Link>
            <Link to="/found" className="nav-link">Found</Link>
            <Link to="/about" className="nav-link">About</Link>
            <Link to="/contact" className="nav-link">Contact</Link>
          </div>
        </div>

        <div className="nav-right desktop-only">
          {currentUser && (
            <>
              <Link to="/messages" className="nav-icon">
                <FaEnvelope />
              </Link>
              <NotificationBell />
              <div className="profile-section">
                <button className="profile-button" onClick={() => setIsProfileOpen(!isProfileOpen)}>
                  <FaUser className="profile-icon" />
                  <span className="profile-name">{currentUser.displayName || 'User'}</span>
                </button>
                {isProfileOpen && (
                  <div className="profile-dropdown">
                    <Link to="/profile" className="dropdown-item" onClick={() => setIsProfileOpen(false)}>
                      <FaUser className="dropdown-icon" />
                      Profile
                    </Link>
                    <Link to="/admin/login" className="dropdown-item" onClick={() => setIsProfileOpen(false)}>
                      <FaShieldAlt className="dropdown-icon" />
                      Admin Panel
                    </Link>
                    <button className="dropdown-item" onClick={handleLogout}>
                      <FaSignOutAlt className="dropdown-icon" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <div className="mobile-only">
          <button className="hamburger-menu" onClick={toggleMenu} aria-label="Toggle menu">
            <FaBars />
          </button>
        </div>
      </nav>

      <div className={`mobile-menu ${isMenuOpen ? 'show' : ''}`}>
        <div className="mobile-search">
          <input 
            type="text" 
            className="search-input" 
            placeholder="Search for items..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch(e)}
          />
          <FaSearch className="search-icon" onClick={handleSearch} />
        </div>

        <div className="mobile-nav-links">
          <Link to="/" className="mobile-nav-link" onClick={closeMenu}>
            <span>Home</span>
          </Link>
          <Link to="/lost" className="mobile-nav-link" onClick={closeMenu}>
            <span>Lost</span>
          </Link>
          <Link to="/found" className="mobile-nav-link" onClick={closeMenu}>
            <span>Found</span>
          </Link>
          <Link to="/about" className="mobile-nav-link" onClick={closeMenu}>
            <span>About</span>
          </Link>
          <Link to="/contact" className="mobile-nav-link" onClick={closeMenu}>
            <span>Contact</span>
          </Link>
        </div>

        {currentUser && (
          <div className="mobile-user-section">
            <div className="mobile-user-header">
              <FaUser className="mobile-user-icon" />
              <span className="mobile-user-name">{currentUser.displayName || 'User'}</span>
            </div>
            <div className="mobile-user-links">
              <Link to="/messages" className="mobile-nav-link" onClick={closeMenu}>
                <FaEnvelope />
                <span>Messages</span>
              </Link>
              <Link to="/notifications" className="mobile-nav-link" onClick={closeMenu}>
                <FaBell />
                <span>Notifications</span>
              </Link>
              <Link to="/profile" className="mobile-nav-link" onClick={closeMenu}>
                <FaUser />
                <span>Profile</span>
              </Link>
              <Link to="/admin/login" className="mobile-nav-link" onClick={closeMenu}>
                <FaShieldAlt />
                <span>Admin Panel</span>
              </Link>
              <button className="mobile-nav-link logout-button" onClick={handleLogout}>
                <FaSignOutAlt />
                <span>Logout</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default Navbar;
