// API configuration
const API_CONFIG = {
    local: {
        baseURL: 'http://localhost:8002/api',
    },
    production: {
        baseURL: 'https://umbc-lost-found-2-backend.onrender.com/api',
    }
};

// Get environment from localStorage or default to production
export const getEnvironment = () => {
    return localStorage.getItem('apiEnvironment') || 'production';
};

// Set environment
export const setEnvironment = (env) => {
    if (env !== 'local' && env !== 'production') {
        throw new Error('Invalid environment');
    }
    localStorage.setItem('apiEnvironment', env);
};

// Get base URL based on current environment
export const getBaseURL = () => {
    const env = getEnvironment();
    return API_CONFIG[env].baseURL;
};

export default {
    getBaseURL,
    getEnvironment,
    setEnvironment,
};
