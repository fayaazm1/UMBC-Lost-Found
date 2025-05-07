// CORS Proxy utility for development
import axios from 'axios';

// Deployed backend URL
const BACKEND_URL = 'https://umbc-lost-found-2-backend.onrender.com';

// Create a proxy function that adds CORS headers
const corsProxy = {
  get: async (endpoint) => {
    try {
      // Remove leading slash if present
      const path = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;
      
      // For development, use a CORS proxy
      const proxyUrl = `https://cors-anywhere.herokuapp.com/${BACKEND_URL}/${path}`;
      
      console.log(`CORS Proxy: Requesting ${proxyUrl}`);
      
      const response = await axios.get(proxyUrl, {
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          'Origin': window.location.origin
        }
      });
      
      return response;
    } catch (error) {
      console.error('CORS Proxy Error:', error);
      throw error;
    }
  },
  
  post: async (endpoint, data) => {
    try {
      // Remove leading slash if present
      const path = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;
      
      // For development, use a CORS proxy
      const proxyUrl = `https://cors-anywhere.herokuapp.com/${BACKEND_URL}/${path}`;
      
      console.log(`CORS Proxy: Posting to ${proxyUrl}`);
      
      const response = await axios.post(proxyUrl, data, {
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          'Content-Type': 'application/json',
          'Origin': window.location.origin
        }
      });
      
      return response;
    } catch (error) {
      console.error('CORS Proxy Error:', error);
      throw error;
    }
  },
  
  put: async (endpoint, data) => {
    try {
      // Remove leading slash if present
      const path = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;
      
      // For development, use a CORS proxy
      const proxyUrl = `https://cors-anywhere.herokuapp.com/${BACKEND_URL}/${path}`;
      
      console.log(`CORS Proxy: Putting to ${proxyUrl}`);
      
      const response = await axios.put(proxyUrl, data, {
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          'Content-Type': 'application/json',
          'Origin': window.location.origin
        }
      });
      
      return response;
    } catch (error) {
      console.error('CORS Proxy Error:', error);
      throw error;
    }
  },
  
  delete: async (endpoint) => {
    try {
      // Remove leading slash if present
      const path = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;
      
      // For development, use a CORS proxy
      const proxyUrl = `https://cors-anywhere.herokuapp.com/${BACKEND_URL}/${path}`;
      
      console.log(`CORS Proxy: Deleting from ${proxyUrl}`);
      
      const response = await axios.delete(proxyUrl, {
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          'Origin': window.location.origin
        }
      });
      
      return response;
    } catch (error) {
      console.error('CORS Proxy Error:', error);
      throw error;
    }
  }
};

export default corsProxy;
