// File: routes/invoiceRoutes.js
import express from "express";
import Invoice from "../models/invoice.js";
const router = express.Router();

router.get("/list", async (req, res) => {
  const invoices = await Invoice.find({ isDeleted: false }).populate(
    "customerId items.item"
  );
  console.log("🚀 ~ router.get ~ invoices:", invoices)
  res.json(invoices);
});

router.post("/add", async (req, res) => {
  const invoice = new Invoice(req.body);
  await invoice.save();
  res.status(201).json(invoice);
});

router.put("/update/:id", async (req, res) => {
  try {
    const invoiceId = req.params.id;

    if (Object.keys(req.body).length === 0) {
      return res.json({ error: "Please enter data to update!" });
    }

    const invoice = await Invoice.findById(invoiceId);

    if (!invoice) {
      return res.json({ error: "Invoice not found!" });
    }

    const newInvoice = await Invoice.findOneAndUpdate(
      { _id: invoice._id },
      { $set: req.body },
      { new: true }
    ).populate("customerId");

    res.status(200).json(newInvoice);
  } catch (error) {
    console.error("Error updating invoice:", error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE /customer/delete/:id
router.delete("/delete/:id", async (req, res) => {
  const invoiceId = req.params.id;
  try {
    const invoice = await Invoice.findByIdAndUpdate(
      { _id: invoiceId },
      {
        $set: { isDeleted: true },
      },
      { new: true }
    );

    if (!invoice) {
      return res.status(404).json({ error: "Invoice not found!" });
    }
    res.status(200).json({ message: "Invoice deleted successfully." });
  } catch (error) {
    console.error("Error deleting invoice:", error);
    res.status(500).json({ error: error.message });
  }
});
export default router;
