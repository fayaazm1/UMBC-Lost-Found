import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../styles/Auth.css';
import './Login.css'; // For the loading animation styles

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      // Call login function from AuthContext
      const user = await login(email, password);
      
      if (user) {
        // Success - store user ID and show success message
        localStorage.setItem('user_id', user.uid);
        setSuccess(true);
        
        // Delay redirect to ensure authentication state is fully ready
        setTimeout(() => {
          // Try to use React Router first for a smoother experience
          navigate('/', { replace: true });
          
          // Fallback to window.location if navigation fails
          setTimeout(() => {
            if (window.location.pathname !== '/') {
              window.location.href = '/';
            }
          }, 1000);
        }, 1500);
      } else {
        setError('Login failed - please try again');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message || 'Failed to log in. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-left-side">
          <div className="auth-form-container">
            <h1 className="auth-title">Welcome Back</h1>
            <p className="auth-subtitle">Sign in to your account</p>

            {error && <div className="alert alert-error">{error}</div>}
            {success && (
              <div className="alert alert-success">
                <div className="login-success-container">
                  <div className="login-success-message">Login successful!</div>
                  <div className="login-loader">
                    <div className="login-loader-spinner"></div>
                  </div>
                  <div className="login-redirect-message">Redirecting you to dashboard...</div>
                </div>
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>E-mail</label>
                <div className="input-container">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="yourname@umbc.edu"
                    required
                    disabled={loading || success}
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
                    disabled={loading || success}
                  />
                  <span className="input-icon">🔒</span>
                </div>
              </div>

              <div className="form-options">
                <Link to="/forgot-password" className="auth-link">
                  Forgot password?
                </Link>
              </div>

              <button 
                type="submit" 
                className="auth-button"
                disabled={loading || success}
              >
                {loading ? (
                  <span className="button-loader-container">
                    <span className="button-loader"></span>
                    <span>Signing in...</span>
                  </span>
                ) : success ? 'Signed in!' : 'Sign in'}
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

export default Login;
