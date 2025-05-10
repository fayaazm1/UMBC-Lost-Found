// Import our enhanced API configuration
import apiWithFallback from './apiConfig';
import { createPost, getPosts, getPost } from './mockPostApi';
import { createClaim, getClaims, getClaim } from './mockClaimsApi';

// Determine if we should use mock data
const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
// Only use mock data in local development, not in production
const useMockData = isLocalhost && !window.location.hostname.includes('render.com');

export async function getUserByEmail(email) {
  try {
    const response = await (useMockData ? 
      getClaims().then(claims => claims.find(claim => claim.email === email)) : 
      apiWithFallback.get(`/api/users/email/${email}`));
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
    const response = await apiWithFallback.post('/api/users', userData);
    console.log('Successfully created user:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}
