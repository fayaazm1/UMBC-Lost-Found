import React, { useState, useEffect } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../styles/Auth.css';

function Signup() {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { signup, currentUser } = useAuth();
  const navigate = useNavigate();

  // Clear form when success state changes to true
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        navigate('/welcome');
      }, 3000); // Navigate after 3 seconds
      return () => clearTimeout(timer);
    }
  }, [success, navigate]);

  if (currentUser && currentUser.emailVerified) {
    return <Navigate to="/" replace />;
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }

    try {
      setError('');
      setLoading(true);
      await signup(email, password, displayName);
      setSuccess(true);
      // Clear form data
      setDisplayName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
    } catch (error) {
      setError('Failed to create an account: ' + error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-left-side">
          <div className="auth-form-container">
            <h1 className="auth-title">Sign Up for UMBC Lost & Found</h1>
            <p className="auth-subtitle">Create your account to get started</p>

            {error && <div className="alert alert-error">{error}</div>}
            {success && (
              <div className="alert alert-success">
                Registration successful! Please check your email for verification.
                Redirecting to login page in 3 seconds...
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Display Name</label>
                <div className="input-container">
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Your name"
                    required
                    disabled={success}
                  />
                  <span className="input-icon">👤</span>
                </div>
              </div>

              <div className="form-group">
                <label>E-mail</label>
                <div className="input-container">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="yourname@umbc.edu"
                    required
                    disabled={success}
                  />
                  <span className="input-icon">📧</span>
                </div>
              </div>
              
              <div className="form-group">
                <label>Password</label>
                <div className="input-container">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="6+ strong characters"
                    required
                    disabled={success}
                  />
                  <span className="input-icon">🔒</span>
                </div>
              </div>

              <div className="form-group">
                <label>Confirm Password</label>
                <div className="input-container">
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                    required
                    disabled={success}
                  />
                  <span className="input-icon">🔒</span>
                </div>
              </div>

              <button 
                type="submit" 
                className="auth-button"
                disabled={loading || success}
              >
                {loading ? 'Creating account...' : 'Sign Up'}
              </button>

              <div className="auth-footer">
                <p>Already have an account? <Link to="/welcome" className="auth-link">Log In</Link></p>
              </div>
            </form>
          </div>
        </div>

        <div className="auth-right-side">
          <div className="feature-content">
            <h2>Lost & Found Platform</h2>
            <p className="feature-description">
              See the items and connect with people who found your belongings,
              from anywhere on campus!
            </p>
            <div className="quote">
              "Nothing is lost... Everything is transformed."
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signup;
