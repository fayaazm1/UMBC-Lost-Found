// CORS Proxy utility for development
import axios from 'axios';

// Deployed backend URL
const BACKEND_URL = 'https://umbc-lost-found-2-backend.onrender.com';

// Alternative CORS proxies (in case one fails)
const CORS_PROXIES = [
  'https://corsproxy.io/?',
  'https://api.allorigins.win/raw?url=',
  'https://cors-proxy.htmldriven.com/?url=',
  'https://thingproxy.freeboard.io/fetch/',
  'https://cors-anywhere.herokuapp.com/'
];

// Helper function to try multiple CORS proxies until one works
const tryMultipleProxies = async (method, endpoint, data = null) => {
  // Remove leading slash if present
  const path = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;
  const fullUrl = `${BACKEND_URL}/${path}`;
  
  // Try each proxy in sequence
  for (const proxy of CORS_PROXIES) {
    try {
      const proxyUrl = `${proxy}${encodeURIComponent(fullUrl)}`;
      console.log(`CORS Proxy: ${method.toUpperCase()} ${proxyUrl}`);
      
      const config = {
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      };
      
      let response;
      if (method === 'get') {
        response = await axios.get(proxyUrl, config);
      } else if (method === 'post') {
        response = await axios.post(proxyUrl, data, config);
      } else if (method === 'put') {
        response = await axios.put(proxyUrl, data, config);
      } else if (method === 'delete') {
        response = await axios.delete(proxyUrl, config);
      }
      
      return response;
    } catch (error) {
      console.warn(`CORS Proxy ${proxy} failed:`, error.message);
      // Continue to next proxy if this one fails
    }
  }
  
  // If all proxies fail, throw an error
  throw new Error(`All CORS proxies failed for ${method.toUpperCase()} ${fullUrl}`);
};

// Create a proxy function that adds CORS headers
const corsProxy = {
  get: async (endpoint) => {
    try {
      return await tryMultipleProxies('get', endpoint);
    } catch (error) {
      console.error('CORS Proxy Error:', error);
      throw error;
    }
  },
  
  post: async (endpoint, data) => {
    try {
      return await tryMultipleProxies('post', endpoint, data);
    } catch (error) {
      console.error('CORS Proxy Error:', error);
      throw error;
    }
  },
  
  put: async (endpoint, data) => {
    try {
      return await tryMultipleProxies('put', endpoint, data);
    } catch (error) {
      console.error('CORS Proxy Error:', error);
      throw error;
    }
  },
  
  delete: async (endpoint) => {
    try {
      return await tryMultipleProxies('delete', endpoint);
    } catch (error) {
      console.error('CORS Proxy Error:', error);
      throw error;
    }
  }
};

export default corsProxy;
