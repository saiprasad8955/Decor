
// File: routes/customerRoutes.js
import express from "express";
import Customer from "../models/customer.js";
const router = express.Router();

router.get("/list", async (req, res) => {
  const customers = await Customer.find();
  res.json(customers);
});

router.post("/add", async (req, res) => {
  const newCustomer = new Customer(req.body);
  await newCustomer.save();
  res.status(201).json(newCustomer);
});

export default router;


