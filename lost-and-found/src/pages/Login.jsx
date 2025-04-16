import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getUserByEmail } from '../utils/api';
import '../styles/Auth.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setError('');
      setLoading(true);
      
      // Attempt to login
      const result = await login(email, password);
      
      if (!result) {
        setError('Login failed - no user returned');
        return;
      }
      
      if (!result.user.emailVerified) {
        setError('Please verify your email before logging in.');
        return;
      }

      // Store user ID in localStorage
      localStorage.setItem('user_id', result.user.uid);
      
      // Add a longer delay to ensure authentication state and DOM are fully ready
      // This prevents the race condition during navigation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Use window.location for a full page refresh instead of navigate
      // This ensures a clean DOM state and prevents the race condition
      window.location.href = '/';
    } catch (error) {
      console.error('Login error:', error);
      setError('Failed to log in: ' + (error.message || 'Please try again'));
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
                disabled={loading}
              >
                {loading ? 'Signing in...' : 'Sign in'}
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
