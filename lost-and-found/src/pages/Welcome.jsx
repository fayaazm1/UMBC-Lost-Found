import React, { useState, useEffect } from 'react';
import { Navigate, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../styles/Auth.css';

function Welcome() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const { login, currentUser, loading } = useAuth();

  // Create particles effect with safe DOM manipulation
  useEffect(() => {
    // Function to safely create particles with null checks
    const createParticle = (x, y) => {
      // Safely get the element
      const authPageElement = document.querySelector('.auth-page');
      
      // Only proceed if the element exists
      if (!authPageElement) return;
      
      try {
        // Create particle with safety checks
        const particle = document.createElement('div');
        if (!particle) return;
        
        particle.className = 'particle';
        particle.style.left = `${x}px`;
        particle.style.top = `${y}px`;
        
        // Safe append
        authPageElement.appendChild(particle);
        
        // Safe removal
        setTimeout(() => {
          // Check if particle still exists before removing
          if (particle && particle.parentNode) {
            particle.parentNode.removeChild(particle);
          }
        }, 1000);
      } catch (error) {
        // Silently handle any DOM errors
        console.log("Suppressed particle effect error:", error);
      }
    };
    
    // Add event with safety
    const handleMouseMove = (e) => {
      if (Math.random() > 0.9) {
        createParticle(e.clientX, e.clientY);
      }
    };
    
    // Add listener with safety delay to ensure DOM is ready
    const timerRef = setTimeout(() => {
      document.addEventListener('mousemove', handleMouseMove);
    }, 500);
    
    // Clean up
    return () => {
      clearTimeout(timerRef);
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  // Redirect if already logged in and email verified
  // useEffect(() => {
  //   if (!loading && currentUser?.emailVerified) {
  //     navigate('/', { replace: true });
  //   }
  // }, [loading, currentUser, navigate]);
  
// Redirect if logged in
  if (currentUser && currentUser.emailVerified) {
    return <Navigate to="/" replace />;
  }
  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setError('');
      setFormLoading(true);
      
      // First authenticate with Firebase
      await login(email, password);
      
      // We won't navigate immediately - we'll let the onAuthStateChanged listener handle it
      // The listener in AuthContext will detect the login and set currentUser
      
    } catch (error) {
      console.error('Login error:', error);
      setFormLoading(false);
      setError(error.message || 'Failed to log in. Please try again.');
    }
  }

  // Set up auth state listener for smoother transitions
  useEffect(() => {
    if (currentUser) {
      // User is authenticated, safe to navigate
      localStorage.setItem('user_id', currentUser.uid);
      
      // Use timeout for smoother transition
      const timer = setTimeout(() => {
        window.location.href = '/';
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [currentUser]);

  return (
    <div className="auth-page">
      <div className="particle-container">
        {[...Array(15)].map((_, i) => (
          <div key={i} className="floating-particle" style={{
            '--delay': `${Math.random() * 5}s`,
            '--duration': `${Math.random() * 10 + 10}s`,
            '--x-end': `${Math.random() * 400 - 200}px`,
            '--y-end': `${Math.random() * 400 - 200}px`,
            '--size': `${Math.random() * 10 + 5}px`,
          }} />
        ))}
      </div>
      <div className="auth-container">
        <div className="auth-left-side">
          <div className="glowing-orbs">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="orb" style={{
                '--delay': `${i * 2}s`,
                '--scale': `${1 + i * 0.2}`,
              }} />
            ))}
          </div>
          <div className="auth-form-container">
            <div className="title-container">
              <h1 className="auth-title">Welcome To UMBC</h1>
              <div className="title-decoration" />
            </div>
            <p className="auth-subtitle">Lost & Found Platform</p>
            <p className="auth-description">
              See the items and connect with people who found your belongings, from anywhere on campus!
            </p>

            {error && (
              <div className="alert alert-error">
                <div className="alert-content">{error}</div>
                <div className="alert-line" />
              </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label htmlFor="email">E-mail</label>
                <div className="input-container">
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="yourname@umbc.edu"
                    required
                  />
                  <span className="input-icon">📧</span>
                  <div className="input-focus-effect" />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <div className="input-container">
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="6+ strong characters"
                    required
                  />
                  <span className="input-icon">🔒</span>
                  <div className="input-focus-effect" />
                </div>
              </div>

              <div className="form-options">
                <label className="checkbox-container">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span className="checkbox-text">Remember for 30 days</span>
                </label>
                <Link to="/forgot-password" className="auth-link">
                  Forgot password?
                </Link>
              </div>

              <button 
                type="submit" 
                className="auth-button"
                disabled={formLoading}
              >
                <span className="button-text">
                  {formLoading ? 'Signing in...' : 'Sign in now'}
                </span>
                <div className="button-shine" />
              </button>

              <div className="auth-footer">
                <p>Don't have an account? <Link to="/signup" className="auth-link">Sign up</Link></p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Welcome;
