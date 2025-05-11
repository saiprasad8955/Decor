// File: routes/itemRoutes.js
const express = require("express");
const Item = require("../models/item");

const router = express.Router();

router.get("/list", async (req, res) => {
  const items = await Item.find({ isDeleted: false });
  res.status(200).json(items);
});

router.post("/add", async (req, res) => {
  try {
    const newItem = new Item(req.body);
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
    } = req.body;

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
      !selling_price
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
    const item = await Item.findByIdAndUpdate(
      { _id: itemId },
      {
        $set: { isDeleted: true },
      },
      { new: true }
    );

    if (!item) {
      return res.json({ error: "Item not found or may be deleted." });
    }

    res.status(200).json({ message: "Item deleted" });
  } catch (error) {
    console.error("Error deleting item:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router