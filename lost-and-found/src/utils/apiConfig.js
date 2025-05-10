// API configuration utility
import axios from 'axios';

// Backend URLs
const DEPLOYED_API_URL = 'https://umbc-lost-found-2-backend.onrender.com';
const LOCAL_PROXY_URL = 'http://localhost:3001';

// API Base URL - use the deployed backend directly
export const API_BASE_URL = DEPLOYED_API_URL;

// Determine if we're in development mode based on URL
const isDevelopment = window.location.hostname === 'localhost' || 
                     window.location.hostname === '127.0.0.1';

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





// No need for additional wrapper - use the axios instance directly

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
export default api;
