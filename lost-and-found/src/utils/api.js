// Import our API configuration
import api from './apiConfig';
import { getAuth } from 'firebase/auth';

export async function getUserByEmail(email) {
  try {
    const response = await api.get(`/api/users/email/${email}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user:', error);
    if (error.response && error.response.status === 404) {
      return null;
    }
    return null;
  }
}

export async function createDbUser(userData) {
  try{
    console.log('Creating database user:', userData);
    const response = await api.post('/api/users', userData);
    console.log('Successfully created user:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

// Post API functions
export async function createPost(postData) {
  try {
    const response = await api.post('/api/posts', postData);
    return response.data;
  } catch (error) {
    console.error('Error creating post:', error);
    throw error;
  }
}

export async function getPosts(filter) {
  try {
    let url = '/api/posts';
    if (filter === 'lost') {
      url = '/api/posts/lost';
    } else if (filter === 'found') {
      url = '/api/posts/found';
    } else if (filter === 'user') {
      // Get current user's posts
      const auth = getAuth();
      const currentUser = auth.currentUser;
      if (!currentUser) return [];
      url = `/api/posts/user/${currentUser.uid}`;
    }
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching posts:', error);
    return [];
  }
}

export async function getPost(postId) {
  try {
    const response = await api.get(`/api/posts/${postId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching post ${postId}:`, error);
    throw error;
  }
}

// Claim API functions
export async function createClaim(claimData) {
  try {
    const response = await api.post('/api/claims', claimData);
    return response.data;
  } catch (error) {
    console.error('Error creating claim:', error);
    throw error;
  }
}

export async function getClaims(filter) {
  try {
    let url = '/api/claims';
    if (filter === 'user') {
      // Get current user's claims
      const auth = getAuth();
      const currentUser = auth.currentUser;
      if (!currentUser) return [];
      url = `/api/claims/user/${currentUser.uid}`;
    } else if (filter && filter.postId) {
      url = `/api/claims/post/${filter.postId}`;
    }
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching claims:', error);
    return [];
  }
}

export async function getClaim(claimId) {
  try {
    const response = await api.get(`/api/claims/${claimId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching claim ${claimId}:`, error);
    throw error;
  }
}
