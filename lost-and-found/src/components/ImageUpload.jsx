import React, { useState, useRef } from 'react';
import './ImageUpload.css';

const ImageUpload = ({ onImageUpload, currentImageUrl, buttonText = "Upload Image" }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [previewUrl, setPreviewUrl] = useState(currentImageUrl || '');
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Please select a valid image file (JPEG, PNG, GIF, WEBP)');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = () => {
      setPreviewUrl(reader.result);
    };
    reader.readAsDataURL(file);

    setError('');
    setIsLoading(true);

    try {
      // Call the upload handler passed from parent
      await onImageUpload(file);
    } catch (error) {
      setError('Failed to upload image: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="image-upload-container">
      <div className="image-preview">
        {previewUrl ? (
          <img 
            src={previewUrl} 
            alt="Preview" 
            className="preview-image"
            onError={() => setPreviewUrl('')}
          />
        ) : (
          <div className="no-image">
            <span>👤</span>
          </div>
        )}
      </div>
      
      {error && <div className="upload-error">{error}</div>}
      
      <div className="upload-controls">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/jpeg,image/png,image/gif,image/webp"
          style={{ display: 'none' }}
        />
        <button 
          type="button" 
          onClick={triggerFileInput}
          disabled={isLoading}
          className="upload-button"
        >
          {isLoading ? 'Uploading...' : buttonText}
        </button>
      </div>
    </div>
  );
};

export default ImageUpload;
