// File: models/Item.js
import mongoose from "mongoose";

const itemSchema = new mongoose.Schema({
  item_name: { type: String, required: true },
  item_type: { type: String, enum: ["PRODUCT", "SERVICE"], required: true },
  sku: String,
  part_number: Number,
  status: { type: Boolean, default: true },
  description: String,
  category: String,
  brand_name: String,
  tax: { type: Number, min: 1, max: 99 },
  cost_price: Number,
  selling_price: Number,
  sold_quantity: { type: Number, default: 0 },
  remaining_quantity: { type: Number, default: 0 },
  isDeleted: { type: Boolean, default: false },
});

export default mongoose.model("Item", itemSchema);
