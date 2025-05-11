const express = require("express");
const Invoice = require("../models/invoice");
const Item = require("../models/item");  // Import Item model

const router = express.Router();

router.get("/list", async (req, res) => {
  const invoices = await Invoice.find({ isDeleted: false }).populate(
    "customerId items.item"
  );
  res.json(invoices);
});

router.post("/add", async (req, res) => {
  try {
    const invoice = new Invoice(req.body);
    
    await invoice.save();

    for (const item of invoice.items) {
      const itemInDb = await Item.findById(item.item);
      if (itemInDb) {
        itemInDb.sold_quantity += item.quantity;
        itemInDb.remaining_quantity -= item.quantity;

        await itemInDb.save();
      }
    }

    res.status(201).json(invoice);
  } catch (error) {
    console.error("Error adding invoice:", error);
    res.status(500).json({ error: error.message });
  }
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

    const updatedInvoice = await Invoice.findOneAndUpdate(
      { _id: invoice._id },
      { $set: req.body },
      { new: true }
    ).populate("customerId");

    for (const item of updatedInvoice.items) {
      const itemInDb = await Item.findById(item.item);
      if (itemInDb) {
        itemInDb.sold_quantity += item.quantity;
        itemInDb.remaining_quantity -= item.quantity;

        await itemInDb.save();
      }
    }

    res.status(200).json(updatedInvoice);
  } catch (error) {
    console.error("Error updating invoice:", error);
    res.status(500).json({ error: error.message });
  }
});

router.delete("/delete/:id", async (req, res) => {
  const invoiceId = req.params.id;
  try {
    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) {
      return res.status(404).json({ error: "Invoice not found!" });
    }

    await Invoice.findByIdAndUpdate(invoiceId, { $set: { isDeleted: true } }, { new: true });

    for (const item of invoice.items) {
      const itemInDb = await Item.findById(item.item);
      if (itemInDb) {
        itemInDb.sold_quantity -= item.quantity;
        itemInDb.remaining_quantity += item.quantity;

        await itemInDb.save();
      }
    }

    res.status(200).json({ message: "Invoice deleted successfully." });
  } catch (error) {
    console.error("Error deleting invoice:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
