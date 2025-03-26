// backend/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Item = require('models/Item.js');  // Import the Item model
const app = express();

// Middleware
app.use(express.json());  // to parse JSON
app.use(cors());          // allow cross-origin requests

// MongoDB connection
mongoose.connect('mongodb://localhost/lost_and_found', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log("Connected to MongoDB!");
}).catch((error) => {
  console.error("MongoDB connection error:", error);
});

// Routes
app.get('/', (req, res) => {
  res.send("Welcome to the Lost and Found API!");
});

// API endpoint to get all items
app.get('/api/items', async (req, res) => {
  try {
    const items = await Item.find(); // Fetch all items
    res.json(items);  // Send the items as JSON response
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Start server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
