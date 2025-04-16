import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { uploadProfilePicture } from '../utils/storage';
import './Profile.css';
import Navbar from "../components/Navbar";
import ImageUpload from "../components/ImageUpload";

const Profile = () => {
  const { currentUser, updateUserProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    displayName: currentUser?.displayName || '',
    email: currentUser?.email || '',
    phoneNumber: currentUser?.phoneNumber || '',
    bio: currentUser?.bio || ''
  });

  const handleEdit = () => {
    setIsEditing(!isEditing);
  };

  const handleSave = async () => {
    setIsEditing(false);
    try {
      await updateUserProfile({
        displayName: profile.displayName,
        phoneNumber: profile.phoneNumber,
        bio: profile.bio
      });
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      console.log('Profile: Starting image upload process', file);
      console.log('Profile: Current user ID:', currentUser.uid);
      
      const photoURL = await uploadProfilePicture(file, currentUser.uid);
      console.log('Profile: Received photo URL:', photoURL);
      
      setProfile(prev => ({ ...prev, photoURL }));
      
      // Update Firebase profile with the new photo URL
      console.log('Profile: Updating user profile with new photo URL');
      await updateUserProfile({ photoURL });
      console.log('Profile: User profile updated successfully');
    } catch (error) {
      console.error('Failed to upload image:', error);
    }
  };

  return (
    <div className="profile-page">
      <Navbar />
      <div className="main-content">
        <div className="hero-section">
          <h1>
            LOST &<br />
            FOUND
          </h1>
          <div className="hero-subtext">
            <p>"Lost Something?</p>
            <p>Found Something?</p>
            <p>We've Got You Covered!"</p>
          </div>
          <p className="hero-tagline">Because even lost things deserve a second chance.</p>
        </div>

        <div className="profile-card">
          <div className="profile-header">
            <h2>Profile Details</h2>
            <button className={`edit-button ${isEditing ? 'cancel' : ''}`} onClick={handleEdit}>
              <span className="icon">{isEditing ? '✕' : '✎'}</span>
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>

          <div className="profile-content">
            <div className="profile-avatar-section">
              <div className="avatar-container">
                {currentUser?.photoURL ? (
                  <img 
                    src={currentUser.photoURL}
                    alt="Profile" 
                    className="avatar-placeholder"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/default-avatar.png';
                    }}
                  />
                ) : (
                  <div className="avatar-placeholder">
                    {currentUser?.displayName ? currentUser.displayName[0].toUpperCase() : 'N'}
                  </div>
                )}
                {isEditing && (
                  <label className="avatar-upload">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <span className="upload-icon">📷</span>
                  </label>
                )}
              </div>
            </div>

            <form className="profile-form">
              <div className="form-group">
                <label>DISPLAY NAME</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="displayName"
                    value={profile.displayName}
                    onChange={handleChange}
                  />
                ) : (
                  <div className="profile-value">{profile.displayName || 'Not provided'}</div>
                )}
              </div>

              <div className="form-group">
                <label>EMAIL</label>
                <div className="profile-value">{profile.email || 'Not provided'}</div>
              </div>

              <div className="form-group">
                <label>PHONE NUMBER</label>
                {isEditing ? (
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={profile.phoneNumber}
                    onChange={handleChange}
                    placeholder="Enter your phone number"
                  />
                ) : (
                  <div className={`profile-value ${!profile.phoneNumber && 'empty-value'}`}>
                    {profile.phoneNumber || 'Not provided'}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label>BIO</label>
                {isEditing ? (
                  <textarea
                    name="bio"
                    value={profile.bio}
                    onChange={handleChange}
                    placeholder="Tell us about yourself"
                  />
                ) : (
                  <div className={`profile-value ${!profile.bio && 'empty-value'}`}>
                    {profile.bio || 'Not provided'}
                  </div>
                )}
              </div>

              {isEditing && (
                <button type="button" className="save-button" onClick={handleSave}>
                  Save Changes
                </button>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
