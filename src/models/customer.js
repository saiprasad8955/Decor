// File: models/Customer.js
const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  number: { type: String, required: true },
  email: String,
  address: String,
  isDeleted: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model('Customer', customerSchema);

