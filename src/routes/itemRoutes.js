// File: routes/itemRoutes.js
const express = require("express");
const Item = require("../models/item");
const Invoice = require("../models/invoice");

const router = express.Router();

router.get("/list", async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    Item.find({ isDeleted: false }).skip(skip).limit(limit),
    Item.countDocuments({ isDeleted: false }),
  ]);

  res.json({
    data: items,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
});

router.post("/add", async (req, res) => {
  try {
    const existingItem = await Item.findOne({
      item_name: { $regex: `^${req.body.item_name}$`, $options: "i" },
      isDeleted: false,
    });

    if (existingItem) {
      return res
        .status(400)
        .json({ error: "Item name must be unique. This name already exists." });
    }

    const item = { ...req.body, remaining_quantity: req.body.quantity };
    const newItem = new Item(item);
    await newItem.save();
    res.status(201).json(newItem);
  } catch (error) {
    console.error("Error adding item:", error);
    res.status(500).json({ error: error.message });
  }
});

router.put("/update/:id", async (req, res) => {
  try {
    const itemId = req.params.id;

    if (Object.keys(req.body).length === 0) {
      return res.json({ error: "Please enter data to update!" });
    }

    const {
      item_name,
      item_type,
      sku,
      part_number,
      status,
      description,
      category,
      brand_name,
      tax,
      cost_price,
      selling_price,
      quantity,
      sold_quantity,
    } = req.body;

    const itemInDb = await Item.findById(itemId);
    if (!itemInDb) {
      return res.json({ error: "Item not found!" });
    }

    // Case-insensitive uniqueness check (excluding current item)
    const existingItemWithSameName = await Item.findOne({
      _id: { $ne: itemId },
      item_name: { $regex: `^${item_name}$`, $options: "i" },
      isDeleted: false,
    });

    if (existingItemWithSameName) {
      return res.status(400).json({
        error:
          "Item name must be unique (case-insensitive). This name already exists.",
      });
    }

    if (quantity < itemInDb.sold_quantity) {
      return res
        .status(400)
        .json({ error: "Quantity cannot be less than sold quantity!" });
    }

    let remaining_quantity = itemInDb.remaining_quantity;
    if (itemInDb.quantity != quantity) {
      remaining_quantity = quantity - itemInDb.sold_quantity;
    }

    if (
      !item_name ||
      !item_type ||
      !sku ||
      !part_number ||
      !description ||
      !category ||
      !brand_name ||
      !tax ||
      !cost_price ||
      !selling_price ||
      !quantity
    ) {
      return res
        .status(400)
        .json({ error: "Please enter all required fields!" });
    }

    const updatedItem = await Item.findByIdAndUpdate(
      itemId,
      {
        $set: {
          item_name,
          item_type,
          sku,
          part_number,
          status,
          description,
          category,
          brand_name,
          tax,
          cost_price,
          selling_price,
          remaining_quantity,
          quantity,
        },
      },
      { new: true }
    );

    if (!updatedItem) {
      return res.json({ error: "Item not found!" });
    }

    res.status(200).json(updatedItem);
  } catch (error) {
    console.error("Error updating item:", error);
    res.status(500).json({ error: error.message });
  }
});

router.delete("/delete/:id", async (req, res) => {
  try {
    const itemId = req.params.id;

    // Check if item exists in any active invoice
    const isUsedInInvoice = await Invoice.exists({
      "items.item": itemId,
      isDeleted: false,
    });

    if (isUsedInInvoice) {
      return res.status(400).json({
        error: "Cannot delete this item. It is used in active invoices.",
      });
    }

    // Soft delete the item
    const item = await Item.findByIdAndUpdate(
      itemId,
      { $set: { isDeleted: true } },
      { new: true }
    );

    if (!item) {
      return res
        .status(404)
        .json({ error: "Item not found or may be deleted." });
    }

    res.status(200).json({ message: "Item deleted successfully." });
  } catch (error) {
    console.error("Error deleting item:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
