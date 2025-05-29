const mongoose = require("mongoose");
const express = require("express");
const Invoice = require("../models/invoice");
const Item = require("../models/item");
const { generateInvoicePDF } = require("../utils/puppeteer");

const router = express.Router();

router.get("/list", async (req, res) => {
  const invoices = await Invoice.find({ isDeleted: false }).populate(
    "customerId items.item"
  );
  res.json(invoices);
});

router.post("/add", async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { items = [] } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      throw new Error("Invoice must contain at least one item.");
    }

    // Validate each item entry
    for (const item of items) {
      if (!item.item || item.quantity <= 0) {
        throw new Error("Each item must have a valid ID and quantity > 0.");
      }

      const itemInDb = await Item.findOne({
        _id: item.item,
        isDeleted: false,
      }).session(session);
      if (!itemInDb) {
        throw new Error(
          `Item with ID ${item.item} not found or has been deleted.`
        );
      }

      if (itemInDb.remaining_quantity < item.quantity) {
        throw new Error(
          `Insufficient stock for item ${itemInDb.item_name}. Available: ${itemInDb.remaining_quantity}, Requested: ${item.quantity}`
        );
      }
    }

    // Save invoice
    const invoice = new Invoice(req.body);
    await invoice.save({ session });

    // Recalculate sold and remaining quantities
    const affectedItemIds = [...new Set(items.map((i) => i.item.toString()))];

    for (const itemId of affectedItemIds) {
      const allInvoices = await Invoice.find({
        "items.item": itemId,
        isDeleted: false,
      })
        .select("items")
        .session(session);

      let totalUsed = 0;
      for (const invoice of allInvoices) {
        for (const i of invoice.items) {
          if (i.item.toString() === itemId) {
            totalUsed += i.quantity;
          }
        }
      }

      const itemDoc = await Item.findById(itemId).session(session);
      if (itemDoc) {
        itemDoc.sold_quantity = totalUsed;
        itemDoc.remaining_quantity = Math.max(0, itemDoc.quantity - totalUsed);
        await itemDoc.save({ session });
      }
    }

    await session.commitTransaction();
    res.status(201).json(invoice);
  } catch (error) {
    await session.abortTransaction();
    console.error("Error adding invoice:", error);
    res.status(400).json({ error: error.message });
  } finally {
    session.endSession();
  }
});

router.put("/update/:id", async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const invoiceId = req.params.id;

    if (Object.keys(req.body).length === 0) {
      await session.abortTransaction();
      return res.status(400).json({ error: "Please enter data to update!" });
    }

    const originalInvoice = await Invoice.findById(invoiceId).session(session);
    if (!originalInvoice) {
      await session.abortTransaction();
      return res.status(404).json({ error: "Invoice not found!" });
    }

    const updatedInvoice = await Invoice.findOneAndUpdate(
      { _id: originalInvoice._id },
      { $set: req.body },
      { new: true, session }
    ).populate("customerId");

    // === Qty Management Starts ===

    const originalItemIds = originalInvoice.items.map((i) => i.item.toString());
    const updatedItemIds = updatedInvoice.items.map((i) => i.item.toString());

    const allInvolvedItemIds = [
      ...new Set([...originalItemIds, ...updatedItemIds]),
    ];

    for (const itemId of allInvolvedItemIds) {
      const allInvoices = await Invoice.find({
        "items.item": itemId,
        isDeleted: false,
      })
        .select("items")
        .session(session);

      let totalUsedQuantity = 0;

      for (const invoice of allInvoices) {
        for (const invoiceItem of invoice.items) {
          if (invoiceItem.item.toString() === itemId) {
            totalUsedQuantity += invoiceItem.quantity;
          }
        }
      }

      const itemDoc = await Item.findById(itemId).session(session);
      if (itemDoc) {
        itemDoc.sold_quantity = totalUsedQuantity;
        itemDoc.remaining_quantity = Math.max(
          0,
          itemDoc.quantity - totalUsedQuantity
        );
        await itemDoc.save({ session });
      }
    }

    // === Qty Management Ends ===

    await session.commitTransaction();
    res.status(200).json(updatedInvoice);
  } catch (error) {
    await session.abortTransaction();
    console.error("Error updating invoice:", error);
    res.status(500).json({ error: error.message });
  } finally {
    session.endSession();
  }
});

router.delete("/delete/:id", async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const invoiceId = req.params.id;
    const invoice = await Invoice.findById(invoiceId).session(session);

    if (!invoice || invoice.isDeleted) {
      return res
        .status(404)
        .json({ error: "Invoice not found or already deleted." });
    }

    // Mark invoice as deleted
    await Invoice.findByIdAndUpdate(
      invoiceId,
      { $set: { isDeleted: true } },
      { new: true, session }
    );

    // Collect unique item IDs
    const affectedItemIds = [
      ...new Set(invoice.items.map((item) => item.item.toString())),
    ];

    // Recalculate sold/remaining quantities for each affected item
    for (const itemId of affectedItemIds) {
      const allInvoices = await Invoice.find({
        "items.item": itemId,
        isDeleted: false,
      })
        .select("items")
        .session(session);

      let totalSoldQty = 0;
      for (const inv of allInvoices) {
        for (const i of inv.items) {
          if (i.item.toString() === itemId) {
            totalSoldQty += i.quantity;
          }
        }
      }

      const itemDoc = await Item.findById(itemId).session(session);
      if (itemDoc) {
        itemDoc.sold_quantity = totalSoldQty;
        itemDoc.remaining_quantity = Math.max(
          0,
          itemDoc.quantity - totalSoldQty
        );
        await itemDoc.save({ session });
      }
    }

    await session.commitTransaction();
    res
      .status(200)
      .json({ message: "Invoice deleted and item quantities updated." });
  } catch (error) {
    await session.abortTransaction();
    console.error("Error deleting invoice:", error);
    res.status(500).json({ error: error.message });
  } finally {
    session.endSession();
  }
});

router.get("/invoicePdf/:id", async (req, res) => {
  try {
    const pdfBuffer = await generateInvoicePDF(req.params.id);
    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": "attachment; filename=invoice.pdf",
    });
    res.send(pdfBuffer);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error generating PDF");
  }
});

module.exports = router;
