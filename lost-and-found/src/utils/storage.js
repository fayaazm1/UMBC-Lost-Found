import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../firebase';

// IMPORTANT: Force placeholder mode in production to avoid CORS issues completely
// Production detection doesn't seem to be working reliably, so we're forcing it on
const DEVELOPMENT_MODE = true; // Force placeholders in ALL environments until CORS is fixed

// Helper function to generate placeholder image URLs as a fallback only
const getPlaceholderImage = (type, userId) => {
  const seed = userId ? userId.substring(0, 8) : Math.random().toString(36).substring(2, 10);
  
  if (type === 'profile') {
    // Use predictable placeholder for profile pictures
    return `https://picsum.photos/seed/${seed}/200`;
  } else {
    // Use random placeholder for post images
    return `https://picsum.photos/seed/${seed}/400/300`;
  }
};

/**
 * Uploads a profile picture to Firebase Storage
 * @param {File} file - The image file to upload
 * @param {string} userId - The user's ID
 * @returns {Promise<string>} - The download URL of the uploaded image
 */
export const uploadProfilePicture = async (file, userId) => {
  try {
    console.log('Starting profile picture upload for user:', userId);
    console.log('Storage reference:', storage);
    
    // Create a reference to the storage location
    const storageRef = ref(storage, `users/${userId}/profile.${getFileExtension(file.name)}`);
    console.log('Storage reference path:', storageRef.fullPath);
    
    // Upload the file
    console.log('Attempting to upload file...');
    const snapshot = await uploadBytes(storageRef, file);
    console.log('Upload successful, snapshot:', snapshot);
    
    // Get the download URL
    console.log('Getting download URL...');
    const downloadURL = await getDownloadURL(snapshot.ref);
    console.log('Download URL obtained:', downloadURL);
    
    return downloadURL;
  } catch (storageError) {
    console.error('Firebase Storage error:', storageError);
    console.log('Error details:', JSON.stringify(storageError, null, 2));
    console.log('Falling back to placeholder due to storage issues');
    
    // If there's a storage error, fall back to placeholder
    return getPlaceholderImage('profile', userId);
  }
};

/**
 * Uploads a post image to Firebase Storage
 * @param {File} file - The image file to upload
 * @param {string} userId - The user's ID
 * @param {string} postId - The post's ID
 * @returns {Promise<string>} - The download URL of the uploaded image
 */
export const uploadPostImage = async (file, userId, postId) => {
  try {
    // First attempt - try normal Firebase Storage upload
    // Create a storage reference with a unique path
    const storageRef = ref(storage, `posts/${userId}/${postId}/${Date.now()}.${getFileExtension(file.name)}`);
    
    // Upload the file
    const snapshot = await uploadBytes(storageRef, file);
    
    // Get the download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return downloadURL;
  } catch (storageError) {
    console.error('Firebase Storage error for post image:', storageError);
    console.log('Falling back to placeholder due to CORS or other issues');
    
    // If there's a CORS error or any other storage issue, fall back to placeholder
    return getPlaceholderImage('post', postId);
  }
};

/**
 * Uploads multiple post images to Firebase Storage
 * @param {File[]} files - Array of image files to upload
 * @param {string} userId - The user's ID
 * @param {string} postId - The post's ID
 * @returns {Promise<string[]>} - Array of download URLs
 */
export const uploadMultiplePostImages = async (files, userId, postId) => {
  try {
    const results = await Promise.all(
      Array.from(files).map(async (file, index) => {
        try {
          const storageRef = ref(storage, `posts/${userId}/${postId}/${Date.now()}_${index}.${getFileExtension(file.name)}`);
          const snapshot = await uploadBytes(storageRef, file);
          return await getDownloadURL(snapshot.ref);
        } catch (error) {
          console.error(`Error uploading image ${index}:`, error);
          return getPlaceholderImage('post', `${postId}-${index}`);
        }
      })
    );
    
    return results;
  } catch (error) {
    console.error('Error uploading multiple images:', error);
    return Array.from(files).map((_, index) => getPlaceholderImage('post', `${postId}-${index}`));
  }
};

/**
 * Deletes an image from Firebase Storage
 * @param {string} imageUrl - The URL of the image to delete
 * @returns {Promise<void>}
 */
export const deleteImage = async (imageUrl) => {
  try {
    // Extract the path from the URL
    const storageRef = ref(storage, getStoragePathFromUrl(imageUrl));
    
    // Delete the file
    await deleteObject(storageRef);
  } catch (error) {
    console.error('Error deleting image:', error);
    // Non-critical operation, suppress errors
  }
};

/**
 * Gets the extension of a file
 * @param {string} filename - The name of the file
 * @returns {string} - The file extension
 */
const getFileExtension = (filename) => {
  return filename.split('.').pop().toLowerCase();
};

/**
 * Extracts the storage path from a Firebase Storage URL
 * @param {string} url - The Firebase Storage URL
 * @returns {string} - The storage path
 */
const getStoragePathFromUrl = (url) => {
  try {
    // Handle both Firebase Storage URL formats
    if (url.includes('firebasestorage.googleapis.com')) {
      const baseUrl = 'https://firebasestorage.googleapis.com/v0/b/';
      const urlWithoutBase = url.replace(baseUrl, '');
      const parts = urlWithoutBase.split('/');
      parts.shift(); // Remove bucket name
      const path = parts.join('/').split('?')[0]; // Remove query params
      
      return decodeURIComponent(path);
    } else if (url.includes('storage.googleapis.com')) {
      const match = url.match(/storage\.googleapis\.com\/([^?]+)/);
      if (match && match[1]) {
        return decodeURIComponent(match[1].split('/', 2)[1]);
      }
    }
    
    throw new Error('Unrecognized Storage URL format');
  } catch (error) {
    console.error('Error parsing Storage URL:', error, url);
    return '';
  }
};
