// mockPostApi.js
// This file provides a mock implementation of the post API for testing purposes

import { getAuth } from 'firebase/auth';

// In-memory storage for posts
let posts = JSON.parse(localStorage.getItem('mockPosts') || '[]');

// Save posts to localStorage
const savePosts = () => {
  localStorage.setItem('mockPosts', JSON.stringify(posts));
};

// Generate a unique ID
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Create a new post
export const createPost = async (postData) => {
  const auth = getAuth();
  const currentUser = auth.currentUser;
  
  if (!currentUser) {
    throw new Error('User must be logged in to create a post');
  }

  const newPost = {
    id: generateId(),
    report_type: postData.report_type,
    item_name: postData.item_name,
    description: postData.description,
    location: postData.location,
    contact_details: postData.contact_details,
    date: postData.date,
    time: postData.time,
    image_path: postData.image_path || null,
    verification_questions: postData.verification_questions || [],
    user_id: currentUser.uid,
    user: {
      id: currentUser.uid,
      username: currentUser.displayName || currentUser.email.split('@')[0],
      email: currentUser.email
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  posts.push(newPost);
  savePosts();

  return { message: 'Post created successfully', post: newPost };
};

// Get all posts
export const getPosts = async () => {
  return posts;
};

// Get a specific post
export const getPost = async (postId) => {
  const post = posts.find(post => post.id === postId);
  
  if (!post) {
    throw new Error('Post not found');
  }
  
  return post;
};
