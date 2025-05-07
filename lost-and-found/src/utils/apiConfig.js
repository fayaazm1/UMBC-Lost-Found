// API configuration utility
import axios from 'axios';
import corsProxy from './corsProxy';

// Backend URLs
const DEPLOYED_API_URL = 'https://umbc-lost-found-2-backend.onrender.com';
const LOCAL_PROXY_URL = 'http://localhost:3001';

// Determine if we're in development mode
const isDevelopment = process.env.NODE_ENV === 'development' || 
                     window.location.hostname === 'localhost' || 
                     window.location.hostname === '127.0.0.1';

// Use the local proxy in development, deployed backend in production
export const API_BASE_URL = isDevelopment ? LOCAL_PROXY_URL : DEPLOYED_API_URL;

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

// Add request interceptor for debugging
api.interceptors.request.use(
  config => {
    console.log(`API Request: ${config.method.toUpperCase()} ${config.url}`);
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
    return response;
  },
  error => {
    if (error.response) {
      console.error(`API Error: ${error.response.status} from ${error.config.url}`, error.response.data);
    } else if (error.request) {
      console.error('API Error: No response received', error.request);
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
  console.log(`Using ${isDevelopment ? 'local proxy' : 'production'} API URL:`, API_BASE_URL);
  // Set it in the window for components that might use import.meta.env
  window.VITE_API_BASE_URL = API_BASE_URL;
}

// Export the API instance directly
export default api;
