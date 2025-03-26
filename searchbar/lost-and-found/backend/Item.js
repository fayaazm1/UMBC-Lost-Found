// backend/models/Item.js
const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { type: String, required: true },
  description: { type: String },
  category: { type: String },
  foundDate: { type: Date, default: Date.now },
});

const Item = mongoose.model('Item', itemSchema);

module.exports = Item;
