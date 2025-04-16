import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../firebase';

// Set to production mode for deployment
const DEVELOPMENT_MODE = false; // Using real Firebase Storage in production

/**
 * Uploads a profile picture to Firebase Storage
 * @param {File} file - The image file to upload
 * @param {string} userId - The user's ID
 * @returns {Promise<string>} - The download URL of the uploaded image
 */
export const uploadProfilePicture = async (file, userId) => {
  try {
    // TEMPORARY: In development mode, skip actual upload and return a placeholder
    if (DEVELOPMENT_MODE) {
      console.log('DEV MODE: Skipping Firebase upload, using placeholder URL');
      // Use a random placeholder image that matches the user's file type
      return file.type.includes('image') 
        ? `https://picsum.photos/200?random=${Math.random()}`
        : 'https://via.placeholder.com/200';
    }
    
    // Real implementation for production
    // Create a reference to the storage location
    const storageRef = ref(storage, `users/${userId}/profile.${getFileExtension(file.name)}`);
    
    // Upload the file
    const snapshot = await uploadBytes(storageRef, file);
    
    // Get the download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return downloadURL;
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    throw error;
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
    // TEMPORARY: In development mode, skip actual upload and return a placeholder
    if (DEVELOPMENT_MODE) {
      console.log('DEV MODE: Skipping Firebase upload, using placeholder URL');
      // Use a random placeholder image that matches the user's file type
      return file.type.includes('image') 
        ? `https://picsum.photos/400/300?random=${Math.random()}`
        : 'https://via.placeholder.com/400x300';
    }
    
    // Real implementation for production
    // Create a storage reference with a unique path
    const storageRef = ref(storage, `posts/${userId}/${postId}/${Date.now()}.${getFileExtension(file.name)}`);
    
    // Upload the file
    const snapshot = await uploadBytes(storageRef, file);
    
    // Get the download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return downloadURL;
  } catch (error) {
    console.error('Error uploading post image:', error);
    throw error;
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
    // TEMPORARY: In development mode, skip actual upload and return placeholders
    if (DEVELOPMENT_MODE) {
      console.log('DEV MODE: Skipping Firebase upload, using placeholder URLs');
      return Array.from(files).map((file, index) => 
        file.type.includes('image') 
          ? `https://picsum.photos/400/300?random=${Math.random()}`
          : 'https://via.placeholder.com/400x300'
      );
    }
    
    // Real implementation for production
    const uploadPromises = Array.from(files).map((file, index) => {
      const storageRef = ref(storage, `posts/${userId}/${postId}/${Date.now()}_${index}.${getFileExtension(file.name)}`);
      return uploadBytes(storageRef, file).then(snapshot => getDownloadURL(snapshot.ref));
    });
    
    return Promise.all(uploadPromises);
  } catch (error) {
    console.error('Error uploading multiple images:', error);
    throw error;
  }
};

/**
 * Deletes an image from Firebase Storage
 * @param {string} imageUrl - The URL of the image to delete
 * @returns {Promise<void>}
 */
export const deleteImage = async (imageUrl) => {
  try {
    // Skip deletion in development mode
    if (DEVELOPMENT_MODE) {
      console.log('DEV MODE: Skipping Firebase deletion');
      return;
    }
    
    // Extract the path from the URL
    const storageRef = ref(storage, getStoragePathFromUrl(imageUrl));
    
    // Delete the file
    await deleteObject(storageRef);
  } catch (error) {
    console.error('Error deleting image:', error);
    throw error;
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
  // This is a simple approach that might need to be adjusted based on your actual URL format
  const baseUrl = 'https://firebasestorage.googleapis.com/v0/b/';
  const urlWithoutBase = url.replace(baseUrl, '');
  const parts = urlWithoutBase.split('/');
  parts.shift(); // Remove bucket name
  const path = parts.join('/').split('?')[0]; // Remove query params
  
  return decodeURIComponent(path);
};
