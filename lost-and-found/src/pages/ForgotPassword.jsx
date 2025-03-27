import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './ForgotPassword.css';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { resetPassword } = useAuth();

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setMessage('');
      setError('');
      setLoading(true);
      await resetPassword(email);
      setMessage('Check your inbox for further instructions');
    } catch (error) {
      setError('Failed to reset password: ' + error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="forgot-password-page">
      <div className="forgot-password-container">
        <h1>Reset Password</h1>
        <p className="subtitle">Enter your email to reset your password</p>

        {error && <div className="alert alert-error">{error}</div>}
        {message && <div className="alert alert-success">{message}</div>}
        
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

          <button 
            type="submit" 
            className="reset-button"
            disabled={loading}
          >
            {loading ? 'Sending...' : 'Reset Password'}
          </button>

          <div className="back-link">
            <Link to="/">Back to Login</Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ForgotPassword;
