// Simple CORS Proxy Server for local development
const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

// Enable CORS for all routes
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Log all requests
app.use((req, res, next) => {
  console.log(`[CORS Proxy] ${req.method} ${req.url}`);
  next();
});

// Proxy all requests to the backend
const apiProxy = createProxyMiddleware({
  target: 'https://umbc-lost-found-2-backend.onrender.com',
  changeOrigin: true,
  pathRewrite: {
    '^/api': '/api', // Keep the /api prefix
  },
  onProxyRes: (proxyRes, req, res) => {
    // Add CORS headers to the response
    proxyRes.headers['Access-Control-Allow-Origin'] = '*';
    proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
    proxyRes.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, X-Requested-With';
    
    console.log(`[CORS Proxy] Response: ${proxyRes.statusCode}`);
  },
  onError: (err, req, res) => {
    console.error('[CORS Proxy] Error:', err);
    res.status(500).send('Proxy Error');
  }
});

// Apply the proxy middleware to all routes starting with /api
app.use('/api', apiProxy);

// Default route
app.get('/', (req, res) => {
  res.send('UMBC Lost & Found CORS Proxy Server is running');
});

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`CORS Proxy Server running on port ${PORT}`);
  console.log(`Proxying requests to https://umbc-lost-found-2-backend.onrender.com`);
  console.log(`Access your API through http://localhost:${PORT}/api/...`);
});
