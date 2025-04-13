// File: models/Customer.js
import mongoose from "mongoose";

const customerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  number: { type: String, required: true },
  email: String,
  address: String,
});

export default mongoose.model("Customer", customerSchema);
