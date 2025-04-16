import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import ImageUpload from '../components/ImageUpload';
import { uploadProfilePicture } from '../utils/storage';
import './Profile.css';

function Profile() {
  const { currentUser, dbUser, updateUserProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    phone: '',
    bio: '',
    avatar: ''
  });

  // Update form data when user data changes
  useEffect(() => {
    if (currentUser) {
      setFormData({
        displayName: currentUser.displayName || '',
        email: currentUser.email || '',
        phone: dbUser?.phone || '',
        bio: dbUser?.bio || '',
        avatar: currentUser.photoURL || ''
      });
    }
  }, [currentUser, dbUser]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = async (file) => {
    if (!currentUser) return;
    
    try {
      // Upload to Firebase Storage
      const downloadURL = await uploadProfilePicture(file, currentUser.uid);
      
      // Update formData with the new avatar URL
      setFormData(prev => ({
        ...prev,
        avatar: downloadURL
      }));
      
      return downloadURL;
    } catch (error) {
      console.error('Error in handleImageUpload:', error);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await updateUserProfile({
        displayName: formData.displayName,
        photoURL: formData.avatar,
        phoneNumber: formData.phone,
        bio: formData.bio
      });
      setIsEditing(false);
    } catch (error) {
      setError('Failed to update profile: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const toggleEdit = () => {
    if (isEditing) {
      // Reset form data if canceling edit
      if (currentUser) {
        setFormData({
          displayName: currentUser.displayName || '',
          email: currentUser.email || '',
          phone: dbUser?.phone || '',
          bio: dbUser?.bio || '',
          avatar: currentUser.photoURL || ''
        });
      }
    }
    setIsEditing(!isEditing);
    setError('');
  };

  return (
    <div className="profile-page">
      <Navbar />
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
                CANCEL
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
            {isEditing ? (
              <ImageUpload 
                onImageUpload={handleImageUpload}
                currentImageUrl={formData.avatar}
                buttonText="Upload Profile Image"
              />
            ) : (
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
