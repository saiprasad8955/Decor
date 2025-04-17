// File: models/Invoice.js
import mongoose from "mongoose";

const invoiceSchema = new mongoose.Schema({
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
  isDeleted: { type: Boolean, defaultL: false },
});

export default mongoose.model("Invoice", invoiceSchema);
