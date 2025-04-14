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
  const [showResendButton, setShowResendButton] = useState(false);
  const { signup, currentUser, resendVerificationEmail } = useAuth();
  const navigate = useNavigate();

  // Clear form when success state changes to true
  useEffect(() => {
    if (success) {
      setShowResendButton(true);
    }
  }, [success]);

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
      const userCredential = await signup(email, password, displayName);
      
      // Create welcome notification
      if (userCredential?.user?.uid) {
        try {
          const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/notifications/create`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              user_id: userCredential.user.uid,
              title: 'Welcome to UMBC Lost & Found!',
              message: `Welcome ${displayName}! Thank you for joining our community. Start by exploring lost items or reporting a found item.`,
              type: 'welcome'
            })
          });

          if (!response.ok) {
            console.error('Failed to create welcome notification:', await response.text());
          }
        } catch (error) {
          console.error('Error creating welcome notification:', error);
        }
      }
      
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

  async function handleResendVerification() {
    try {
      setLoading(true);
      await resendVerificationEmail();
      setError('');
      setSuccess(true);
    } catch (error) {
      setError('Failed to resend verification email: ' + error.message);
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
                {showResendButton && (
                  <div style={{ marginTop: '10px' }}>
                    <button
                      onClick={handleResendVerification}
                      className="auth-button secondary"
                      disabled={loading}
                      style={{
                        backgroundColor: 'transparent',
                        border: '1px solid #007bff',
                        color: '#007bff',
                        padding: '8px 16px',
                        fontSize: '0.9em',
                        width: 'auto',
                        display: 'inline-block'
                      }}
                    >
                      {loading ? 'Sending...' : 'Resend Verification Email'}
                    </button>
                  </div>
                )}
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
