import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../firebase';

// Set to production mode - using actual Firebase Storage
const DEVELOPMENT_MODE = false; 

// Helper function to generate placeholder image URLs (only used as fallback)
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
    // Create a reference to the storage location
    const storageRef = ref(storage, `users/${userId}/profile.${getFileExtension(file.name)}`);
    
    // Upload the file
    const snapshot = await uploadBytes(storageRef, file);
    
    // Get the download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return downloadURL;
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    // Use placeholder as fallback only if upload fails
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
    // Create a storage reference with a unique path
    const storageRef = ref(storage, `posts/${userId}/${postId}/${Date.now()}.${getFileExtension(file.name)}`);
    
    // Upload the file
    const snapshot = await uploadBytes(storageRef, file);
    
    // Get the download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return downloadURL;
  } catch (error) {
    console.error('Error uploading post image:', error);
    // Use placeholder as fallback only if upload fails
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
    // Skip deletion for placeholder images
    if (imageUrl.includes('picsum.photos')) {
      console.log('Skipping deletion of placeholder image');
      return;
    }
    
    // Extract the path from the URL
    const storageRef = ref(storage, getStoragePathFromUrl(imageUrl));
    
    // Delete the file
    await deleteObject(storageRef);
  } catch (error) {
    console.error('Error deleting image:', error);
    // Suppress errors during deletion - non-critical operation
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
