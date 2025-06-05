// File: models/Item.js
const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema({
  item_name: { type: String, required: true },
  item_type: { type: String, enum: ["PRODUCT", "SERVICE"], required: true },
  sku: String,
  part_number: String,
  status: { type: Boolean, default: true },
  description: String,
  category: String,
  brand_name: String,
  tax: { type: Number, min: 1, max: 99 },
  cost_price: Number,
  selling_price: Number,
  quantity: { type: Number, default: 0 },
  sold_quantity: { type: Number, default: 0 },
  remaining_quantity: { type: Number, default: 0 },
  isDeleted: { type: Boolean, default: false },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

module.exports = mongoose.model('Item', itemSchema);

