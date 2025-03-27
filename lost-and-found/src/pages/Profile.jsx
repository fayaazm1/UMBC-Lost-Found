import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import './Profile.css';

function Profile() {
  const { currentUser, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    displayName: currentUser?.displayName || '',
    email: currentUser?.email || '',
    phone: currentUser?.phoneNumber || '',
    bio: currentUser?.bio || '',
    avatar: currentUser?.photoURL || ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await updateProfile({
        displayName: formData.displayName,
        photoURL: formData.avatar,
        phoneNumber: formData.phone,
        bio: formData.bio
      });
      setIsEditing(false);
    } catch (error) {
      setError('Failed to update profile: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleEdit = () => {
    if (isEditing) {
      // Reset form data if canceling edit
      setFormData({
        displayName: currentUser?.displayName || '',
        email: currentUser?.email || '',
        phone: currentUser?.phoneNumber || '',
        bio: currentUser?.bio || '',
        avatar: currentUser?.photoURL || ''
      });
    }
    setIsEditing(!isEditing);
    setError('');
  };

  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-header">
          <h1>Profile Details</h1>
          <button 
            className={`edit-button ${isEditing ? 'cancel' : ''}`}
            onClick={toggleEdit}
          >
            {isEditing ? (
              <>
                <span className="button-icon">✕</span>
                Cancel
              </>
            ) : (
              <>
                <span className="button-icon">✏️</span>
                Edit Profile
              </>
            )}
          </button>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <div className="profile-content">
          <div className="profile-avatar-section">
            <div className="avatar-container">
              {formData.avatar ? (
                <img 
                  src={formData.avatar}
                  alt="Profile" 
                  className="avatar-image"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/default-avatar.png';
                  }}
                />
              ) : (
                <div className="avatar-placeholder">
                  👤
                </div>
              )}
            </div>
            {isEditing && (
              <div className="form-group">
                <label>Profile Picture URL</label>
                <input
                  type="text"
                  name="avatar"
                  value={formData.avatar}
                  onChange={handleInputChange}
                  placeholder="Enter image URL"
                  className="avatar-input"
                />
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="profile-form">
            <div className="form-group">
              <label>Display Name</label>
              {isEditing ? (
                <input
                  type="text"
                  name="displayName"
                  value={formData.displayName}
                  onChange={handleInputChange}
                  placeholder="Enter your display name"
                  required
                />
              ) : (
                <p className="profile-value">{formData.displayName || 'Not set'}</p>
              )}
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={formData.email}
                disabled
                className="profile-value"
              />
            </div>

            <div className="form-group">
              <label>Phone Number</label>
              {isEditing ? (
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Enter phone number"
                  pattern="[0-9]{10}"
                  title="Please enter a valid 10-digit phone number"
                />
              ) : (
                <p className="profile-value">{formData.phone || 'Not provided'}</p>
              )}
            </div>

            <div className="form-group">
              <label>Bio</label>
              {isEditing ? (
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  placeholder="Tell us about yourself"
                  rows="4"
                />
              ) : (
                <p className="profile-value">{formData.bio || 'No bio provided'}</p>
              )}
            </div>

            {isEditing && (
              <div className="form-actions">
                <button 
                  type="submit" 
                  className="save-button"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

export default Profile;
