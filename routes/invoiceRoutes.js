
// File: routes/invoiceRoutes.js
import express from "express";
import Invoice from "../models/invoice.js";
const router = express.Router();

router.get("/list", async (req, res) => {
  const invoices = await Invoice.find().populate("customerId items.item");
  res.json(invoices);
});

router.post("/add", async (req, res) => {
  const invoice = new Invoice(req.body);
  await invoice.save();
  res.status(201).json(invoice);
});

export default router;
