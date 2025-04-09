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

  // Create particles effect
  useEffect(() => {
    const createParticle = (x, y) => {
      const particle = document.createElement('div');
      particle.className = 'particle';
      particle.style.left = `${x}px`;
      particle.style.top = `${y}px`;
      document.querySelector('.auth-page').appendChild(particle);

      setTimeout(() => {
        particle.remove();
      }, 1000);
    };

    const handleMouseMove = (e) => {
      if (Math.random() > 0.9) {
        createParticle(e.clientX, e.clientY);
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
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
      const result = await login(email, password);

      if (!result.user.emailVerified) {
        setError('Please verify your email before logging in.');
        return;
      }

      await new Promise(resolve => setTimeout(resolve, 1000));

      navigate('/', { replace: true });
    } catch (error) {
      console.error('Login error:', error);
      setError('Failed to log in: ' + (error.message || 'Please try again'));
    } finally {
      setFormLoading(false);
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
