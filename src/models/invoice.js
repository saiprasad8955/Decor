// File: models/Invoice.js
const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema({
  invoice_number: { type: String, unique: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" },
  sales_person: String,
  invoice_date: Date,
  delivery_date: Date,
  description: String,
  items: [
    {
      item: { type: mongoose.Schema.Types.ObjectId, ref: "Item" },
      quantity: Number,
      rate: Number,
      tax: Number,
      total: Number,
    },
  ],
  discount: Number,
  subtotal: Number,
  final_amount: Number,
  isDeleted: { type: Boolean, default: false },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

module.exports = mongoose.model('Invoice', invoiceSchema);

