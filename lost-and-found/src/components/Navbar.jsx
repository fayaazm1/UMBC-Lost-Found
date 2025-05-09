import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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

  // Add event listener for clicks outside the menu
  useEffect(() => {
    function handleClickOutside(event) {
      // For profile dropdown
      if (isProfileOpen && !event.target.closest('.profile-section')) {
        setIsProfileOpen(false);
      }
      
      // For mobile menu - only if target is not part of the menu or hamburger button
      if (isMenuOpen && 
          !event.target.closest('.mobile-menu') && 
          !event.target.closest('.hamburger-button')) {
        setIsMenuOpen(false);
      }
    }
    
    // Add the event listener
    document.addEventListener('mousedown', handleClickOutside);
    
    // Clean up
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen, isProfileOpen]);

  const handleSearch = (e) => {
    e.preventDefault();
    const trimmedQuery = searchQuery.trim();
    if (trimmedQuery) {
      navigate(`/search?q=${encodeURIComponent(trimmedQuery)}`);
      setSearchQuery('');
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

  // Toggle mobile menu function
  const toggleMenu = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsMenuOpen(prevState => !prevState);
  };

  // Close mobile menu
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
          <form onSubmit={handleSearch} className="search-container">
            <input 
              type="text" 
              className="search-input" 
              placeholder="Search for items..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="search-button" aria-label="Search">
              <span className="search-icon">🔍</span>
            </button>
          </form>
          
          <div className="nav-links">
            <Link to="/" className="nav-link">Home</Link>
            <Link to="/lost" className="nav-link">Lost</Link>
            <Link to="/found" className="nav-link">Found</Link>
            <Link to="/qr-generator" className="nav-link">QR Code</Link>
            <Link to="/about" className="nav-link">About</Link>
            <Link to="/contact" className="nav-link">Contact</Link>
          </div>
        </div>

        <div className="nav-right desktop-only">
          {currentUser && (
            <>
              <Link 
                to="/messages" 
                className="nav-icon speech-enabled" 
                aria-label="Messages" 
                data-speech="Messages"
                data-speech-enabled="true"
              >
                <span>📧</span>
              </Link>
              <NotificationBell />
              <div className="profile-section">
                <button className="profile-button" onClick={() => setIsProfileOpen(!isProfileOpen)}>
                  <span className="profile-icon">👤</span>
                  <span className="profile-name">{currentUser.displayName || 'User'}</span>
                </button>
                {isProfileOpen && (
                  <div className="profile-dropdown">
                    <Link to="/profile" className="dropdown-item" onClick={() => setIsProfileOpen(false)}>
                      <span className="dropdown-icon">👤</span>
                      Profile
                    </Link>
                    <Link to="/qr-generator" className="dropdown-item" onClick={() => setIsProfileOpen(false)}>
                      <span className="dropdown-icon">📱</span>
                      Generate QR Code
                    </Link>
                    <Link to="/admin/login" className="dropdown-item" onClick={() => setIsProfileOpen(false)}>
                      <span className="dropdown-icon">🔐</span>
                      Admin Panel
                    </Link>
                    <button className="dropdown-item" onClick={handleLogout}>
                      <span className="dropdown-icon">🚪</span>
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <div className="mobile-only">
          <button 
            className="hamburger-button" 
            onClick={toggleMenu} 
            aria-label="Toggle menu"
            style={{
              padding: '10px 15px',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontSize: '28px',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1001,
              position: 'relative'
            }}
          >
            <span>☰</span>
          </button>
        </div>
      </nav>

      {/* Mobile menu with inline styles for better visibility */}
      <div 
        className="mobile-menu" 
        style={{
          display: isMenuOpen ? 'block' : 'none',
          position: 'fixed',
          top: '60px',
          left: '0',
          right: '0',
          backgroundColor: '#1a1a2e',
          padding: '1rem',
          zIndex: '1000',
          boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
          borderTop: '1px solid rgba(255,255,255,0.1)',
          maxHeight: 'calc(100vh - 60px)',
          overflowY: 'auto'
        }}
      >
        <div className="mobile-search" style={{ marginBottom: '1rem' }}>
          <form onSubmit={handleSearch} className="mobile-search-container" style={{ display: 'flex' }}>
            <input 
              type="text" 
              className="mobile-search-input" 
              placeholder="Search for items..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                flex: '1',
                padding: '0.75rem',
                borderRadius: '4px 0 0 4px',
                border: 'none',
                backgroundColor: 'rgba(255,255,255,0.1)',
                color: 'white'
              }}
            />
            <button 
              type="submit" 
              className="search-button" 
              aria-label="Search"
              style={{
                padding: '0.75rem',
                backgroundColor: '#ffd700',
                border: 'none',
                borderRadius: '0 4px 4px 0',
                cursor: 'pointer'
              }}
            >
              <span className="search-icon">🔍</span>
            </button>
          </form>
        </div>

          <div className="mobile-nav-links" style={{ display: 'flex', flexDirection: 'column' }}>
            <Link 
              to="/" 
              className="mobile-nav-link" 
              onClick={closeMenu}
              style={{ padding: '0.75rem', color: 'white', textDecoration: 'none', borderBottom: '1px solid rgba(255,255,255,0.1)' }}
            >
              <span>Home</span>
            </Link>
            <Link 
              to="/lost" 
              className="mobile-nav-link" 
              onClick={closeMenu}
              style={{ padding: '0.75rem', color: 'white', textDecoration: 'none', borderBottom: '1px solid rgba(255,255,255,0.1)' }}
            >
              <span>Lost</span>
            </Link>
            <Link 
              to="/found" 
              className="mobile-nav-link" 
              onClick={closeMenu}
              style={{ padding: '0.75rem', color: 'white', textDecoration: 'none', borderBottom: '1px solid rgba(255,255,255,0.1)' }}
            >
              <span>Found</span>
            </Link>
            <Link 
              to="/qr-generator" 
              className="mobile-nav-link" 
              onClick={closeMenu}
              style={{ padding: '0.75rem', color: 'white', textDecoration: 'none', borderBottom: '1px solid rgba(255,255,255,0.1)' }}
            >
              <span>QR Code</span>
            </Link>
            <Link 
              to="/post" 
              className="mobile-nav-link" 
              onClick={closeMenu}
              style={{ padding: '0.75rem', color: 'white', textDecoration: 'none', borderBottom: '1px solid rgba(255,255,255,0.1)' }}
            >
              <span>Post</span>
            </Link>
            <Link 
              to="/about" 
              className="mobile-nav-link" 
              onClick={closeMenu}
              style={{ padding: '0.75rem', color: 'white', textDecoration: 'none', borderBottom: '1px solid rgba(255,255,255,0.1)' }}
            >
              <span>About</span>
            </Link>
            <Link 
              to="/contact" 
              className="mobile-nav-link" 
              onClick={closeMenu}
              style={{ padding: '0.75rem', color: 'white', textDecoration: 'none', borderBottom: '1px solid rgba(255,255,255,0.1)' }}
            >
              <span>Contact</span>
            </Link>
            
            {currentUser && (
              <>
                <Link 
                  to="/messages" 
                  className="mobile-nav-link" 
                  onClick={closeMenu}
                  aria-label="Messages" 
                  data-speech="Messages"
                  data-speech-enabled="true"
                  style={{ padding: '0.75rem', color: 'white', textDecoration: 'none', borderBottom: '1px solid rgba(255,255,255,0.1)' }}
                >
                  <span>📫 Messages</span>
                </Link>
                <Link 
                  to="/profile" 
                  className="mobile-nav-link" 
                  onClick={closeMenu}
                  style={{ padding: '0.75rem', color: 'white', textDecoration: 'none', borderBottom: '1px solid rgba(255,255,255,0.1)' }}
                >
                  <span>👤 Profile</span>
                </Link>
                <button 
                  className="mobile-nav-link logout-button" 
                  onClick={() => {
                    closeMenu();
                    handleLogout();
                  }}
                  style={{ 
                    padding: '0.75rem', 
                    color: 'white', 
                    textDecoration: 'none', 
                    backgroundColor: 'transparent',
                    border: 'none',
                    textAlign: 'left',
                    cursor: 'pointer',
                    width: '100%',
                    fontSize: '1rem'
                  }}
                >
                  <span>🚪 Logout</span>
                </button>
              </>
            )}
          </div>
        </div>
    </>
  );
}

export default Navbar;
