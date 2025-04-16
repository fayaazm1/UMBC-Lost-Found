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
  if (currentUser && currentUser.emailVerified) {
    return <Navigate to="/" replace />;
  }

  // Effect to handle navigation when user state changes
  useEffect(() => {
    if (currentUser) {
      // User is authenticated, store ID
      localStorage.setItem('user_id', currentUser.uid);
      
      // Give time for Firebase to fully stabilize the auth state
      const timer = setTimeout(() => {
        // Use navigate instead of direct href for better UX
        navigate('/', { replace: true });
      }, 800);
      
      return () => clearTimeout(timer);
    }
  }, [currentUser, navigate]);

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setError('');
      setFormLoading(true);
      
      // Call login which now includes user.reload() for force-refreshing
      const userCredential = await login(email, password);
      console.log("Login successful:", userCredential.user.email);
      
      // We'll keep form loading active until navigation completes
      // The useEffect above will handle the navigation
      
    } catch (error) {
      console.error('Login error:', error);
      setFormLoading(false);
      setError(error.message || 'Failed to log in. Please try again.');
    }
  }

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
          <div className="logo">UMBC Lost & Found</div>
          <div className="welcome-text">
            <h1>Welcome To UMBC</h1>
            <div className="divider"></div>
            <p>Lost & Found Platform</p>
            <div className="subtext">
              See the items and connect with people who found your belongings, from anywhere on campus!
            </div>
          </div>
        </div>
        <div className="auth-right-side">
          <div className="auth-form-container">
            <div className="auth-form-header">
              <h2>Get Started</h2>
            </div>
            
            {error && (
              <div className="auth-error">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label htmlFor="email">E-MAIL</label>
                <div className="input-field">
                  <span className="input-icon">✉️</span>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="username@umbc.edu"
                    required
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="password">PASSWORD</label>
                <div className="input-field">
                  <span className="input-icon">🔒</span>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="strong characters"
                    required
                  />
                </div>
              </div>
              
              <div className="form-options">
                <div className="checkbox-container">
                  <input
                    type="checkbox"
                    id="rememberMe"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <label htmlFor="rememberMe">Remember for 30 days</label>
                </div>
                <Link to="/forgot-password" className="forgot-password">
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                className="auth-button"
                disabled={formLoading}
              >
                {formLoading ? (
                  <span className="loading-text">Signing in...</span>
                ) : (
                  <span>Sign in now</span>
                )}
              </button>

              <div className="auth-footer">
                <p>Don't have an account? <Link to="/signup">Sign Up</Link></p>
              </div>
            </form>
          </div>
        </div>
      </div>
      {/* Login loading overlay */}
      {formLoading && (
        <div className="login-success-overlay">
          <div className="login-success-content">
            <div className="loader-spinner"></div>
            <h3>Authenticating...</h3>
            <p>Preparing your dashboard...</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default Welcome;
