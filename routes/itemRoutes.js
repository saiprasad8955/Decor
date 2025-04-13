
// File: routes/itemRoutes.js
import express from "express";
import Item from "../models/item.js";
const router = express.Router();

router.get("/list", async (req, res) => {
  const items = await Item.find();
  res.json(items);
});

router.post("/add", async (req, res) => {
  const newItem = new Item(req.body);
  await newItem.save();
  res.status(201).json(newItem);
});

router.put("/update/:id", async (req, res) => {
  const updatedItem = await Item.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updatedItem);
});

router.delete("/delete/:id", async (req, res) => {
  await Item.findByIdAndDelete(req.params.id);
  res.json({ message: "Item deleted" });
});

export default router;

