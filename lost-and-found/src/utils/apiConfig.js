// API configuration utility
import axios from 'axios';
import corsProxy from './corsProxy';
import { mockPosts, mockNotifications, mockUsers } from './mockData';

// Backend URLs
const DEPLOYED_API_URL = 'https://umbc-lost-found-2-backend.onrender.com';
const LOCAL_PROXY_URL = 'http://localhost:3001';

// API Base URL - use the deployed backend directly
export const API_BASE_URL = DEPLOYED_API_URL;

// Determine if we're in development mode based on URL
const isDevelopment = window.location.hostname === 'localhost' || 
                     window.location.hostname === '127.0.0.1';

// Always use CORS proxy when needed to avoid CORS issues
const useCorsProxy = true;

// Create axios instance with the correct base URL
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: false, // Must be false when backend has wildcard CORS origin
  timeout: 30000, // Increase timeout for deployed backend
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Function to get mock data based on the URL
const getMockData = (url) => {
  console.log('Using mock data for:', url);
  
  // Match different API endpoints to the appropriate mock data
  if (url.includes('/api/posts')) {
    // Filter posts based on report_type if the URL has a specific filter
    if (url.includes('lost')) {
      return { data: mockPosts.filter(post => post.report_type === 'lost') };
    } else if (url.includes('found')) {
      return { data: mockPosts.filter(post => post.report_type === 'found') };
    }
    return { data: mockPosts };
  } else if (url.includes('/api/notifications/user/')) {
    return { data: mockNotifications };
  } else if (url.includes('/api/users/email/')) {
    const email = url.split('/').pop();
    const user = mockUsers.find(u => u.email === email) || mockUsers[0];
    return { data: user };
  }
  
  // Default empty response
  return { data: [] };
};

// Check if we're in development mode with a localhost URL
const isLocalDevelopment = window.location.hostname === 'localhost' || 
                          window.location.hostname === '127.0.0.1';

// Only force mock data mode for local development to avoid CORS issues
// But keep authentication calls to the real backend
const forceMockData = isLocalDevelopment && !window.location.hostname.includes('render.com');

// List of endpoints that should bypass mock data and always use real backend
const realBackendEndpoints = [
  '/api/users/email/',
  '/api/auth/'
];

// Create a wrapper for API calls that falls back to CORS proxy if direct call fails
// and uses mock data as a last resort
const apiWithFallback = {
  get: async (url, config) => {
    // Check if this endpoint should bypass mock data
    const shouldUseRealBackend = realBackendEndpoints.some(endpoint => url.startsWith(endpoint));
    
    if (forceMockData && !shouldUseRealBackend) {
      console.log(`Using mock data for: ${url}`);
      return getMockData(url);
    }
    
    try {
      return await api.get(url, config);
    } catch (error) {
      if (useCorsProxy && error.message === 'Network Error') {
        console.log('Falling back to CORS proxy for GET:', url);
        try {
          return await corsProxy.get(url);
        } catch (proxyError) {
          console.warn('CORS proxy failed, using mock data:', proxyError.message);
          return getMockData(url);
        }
      }
      
      // If all else fails, use mock data
      console.warn('API request failed, using mock data:', error.message);
      return getMockData(url);
    }
  },
  post: async (url, data, config) => {
    // If we're forcing mock data, return a success response immediately
    if (forceMockData) {
      console.log('Simulating POST success due to local development mode');
      return { data: { success: true, message: 'Operation simulated in offline mode' } };
    }
    
    try {
      return await api.post(url, data, config);
    } catch (error) {
      if (useCorsProxy && error.message === 'Network Error') {
        console.log('Falling back to CORS proxy for POST:', url);
        try {
          return await corsProxy.post(url, data);
        } catch (proxyError) {
          console.warn('CORS proxy failed for POST, using mock response:', proxyError.message);
          // Return a success response for POST requests
          return { data: { success: true, message: 'Operation simulated in offline mode' } };
        }
      }
      console.warn('POST request failed, using mock response:', error.message);
      return { data: { success: true, message: 'Operation simulated in offline mode' } };
    }
  },
  put: async (url, data, config) => {
    // If we're forcing mock data, return a success response immediately
    if (forceMockData) {
      console.log('Simulating PUT success due to local development mode');
      return { data: { success: true, message: 'Operation simulated in offline mode' } };
    }
    
    try {
      return await api.put(url, data, config);
    } catch (error) {
      if (useCorsProxy && error.message === 'Network Error') {
        console.log('Falling back to CORS proxy for PUT:', url);
        try {
          return await corsProxy.put(url, data);
        } catch (proxyError) {
          console.warn('CORS proxy failed for PUT, using mock response:', proxyError.message);
          // Return a success response for PUT requests
          return { data: { success: true, message: 'Operation simulated in offline mode' } };
        }
      }
      console.warn('PUT request failed, using mock response:', error.message);
      return { data: { success: true, message: 'Operation simulated in offline mode' } };
    }
  },
  delete: async (url, config) => {
    // If we're forcing mock data, return a success response immediately
    if (forceMockData) {
      console.log('Simulating DELETE success due to local development mode');
      return { data: { success: true, message: 'Operation simulated in offline mode' } };
    }
    
    try {
      return await api.delete(url, config);
    } catch (error) {
      if (useCorsProxy && error.message === 'Network Error') {
        console.log('Falling back to CORS proxy for DELETE:', url);
        try {
          return await corsProxy.delete(url);
        } catch (proxyError) {
          console.warn('CORS proxy failed for DELETE, using mock response:', proxyError.message);
          // Return a success response for DELETE requests
          return { data: { success: true, message: 'Operation simulated in offline mode' } };
        }
      }
      console.warn('DELETE request failed, using mock response:', error.message);
      return { data: { success: true, message: 'Operation simulated in offline mode' } };
    }
  }
};

// Add request interceptor for debugging
api.interceptors.request.use(
  config => {
    const fullUrl = `${config.baseURL || ''}${config.url}`;
    console.log(`API Request: ${config.method.toUpperCase()} ${config.url}`);
    console.log(`Full URL: ${fullUrl}`);
    console.log('Request Headers:', config.headers);
    if (config.data) {
      console.log('Request Data:', typeof config.data === 'object' ? JSON.stringify(config.data).substring(0, 200) : config.data);
    }
    return config;
  },
  error => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
api.interceptors.response.use(
  response => {
    console.log(`API Response: ${response.status} from ${response.config.url}`);
    // Log a preview of the response data for debugging
    if (response.data) {
      const dataPreview = typeof response.data === 'object' 
        ? `${JSON.stringify(response.data).substring(0, 150)}...` 
        : response.data.toString().substring(0, 150);
      console.log(`Response Data Preview: ${dataPreview}`);
    }
    return response;
  },
  error => {
    if (error.response) {
      console.error(`API Error: ${error.response.status} from ${error.config.url}`, error.response.data);
      console.error('Error Response Headers:', error.response.headers);
    } else if (error.request) {
      console.error('API Error: No response received', error.request);
      console.error('Request details:', {
        url: error.config?.url,
        method: error.config?.method,
        baseURL: error.config?.baseURL
      });
    } else {
      console.error('API Error:', error.message);
    }
    return Promise.reject(error);
  }
);

// Export environment variables for direct access
export const VITE_API_BASE_URL = API_BASE_URL;

// Make sure Vite environment variables are available
if (import.meta.env.VITE_API_BASE_URL) {
  console.log('Using API URL from environment:', import.meta.env.VITE_API_BASE_URL);
} else {
  console.log(`Using deployed API URL: ${API_BASE_URL}${useCorsProxy ? ' (with CORS proxy fallback)' : ''}`);
  console.log('Connecting directly to the deployed backend on Render');
  // Set it in the window for components that might use import.meta.env
  window.VITE_API_BASE_URL = API_BASE_URL;
}

// Export the API instance with CORS proxy fallback
export default apiWithFallback;
