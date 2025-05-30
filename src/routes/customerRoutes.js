// File: routes/customerRoutes.js
const express = require("express");
const Customer = require("../models/customer");
const router = express.Router();

router.get("/list", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Default to page 1
    const limit = parseInt(req.query.limit) || 10; // Default to 10 items per page
    const skip = (page - 1) * limit;

    const [customers, total] = await Promise.all([
      Customer.find({ isDeleted: false }).skip(skip).limit(limit),
      Customer.countDocuments({ isDeleted: false }),
    ]);
    console.log("customers are calling");
    res.json({
      data: customers,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error("Failed to fetch customers:", err);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/add", async (req, res) => {
  try {
    const existingCustomer = await Customer.findOne({
      name: { $regex: `^${req.body.name}$`, $options: "i" },
      isDeleted: false,
    });

    if (existingCustomer) {
      return res.status(400).json({
        error: "Customer name must be unique. This name already exists.",
      });
    }

    const newCustomer = new Customer(req.body);
    await newCustomer.save();
    res.status(201).json(newCustomer);
  } catch (error) {
    console.error("Error adding customer:", error);
    res.status(500).json({ error: error.message });
  }
});

router.put("/update/:id", async (req, res) => {
  try {
    const customerId = req.params.id;

    if (Object.keys(req.body).length === 0) {
      return res.json({ error: "Please enter data to update!" });
    }
    const { name, number, email, address } = req.body;

    const customer = await Customer.findById(customerId);

    if (!customer) {
      return res.json({ error: "Customer not found!" });
    }
    // Check if another item (with different _id) has same item_name
    const existingCustomerWithSameName = await Customer.findOne({
      name: { $regex: `^${name}$`, $options: "i" },
      _id: { $ne: customerId },
      isDeleted: false,
    });

    if (existingCustomerWithSameName) {
      return res.status(400).json({
        error: "Customer name must be unique. This name already exists.",
      });
    }

    const newCustomer = await Customer.findOneAndUpdate(
      { _id: customer._id },
      { $set: { name, number, email, address } },
      { new: true }
    );

    res.status(200).json(newCustomer);
  } catch (error) {
    console.error("Error updating customer:", error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE /customer/delete/:id
router.delete("/delete/:id", async (req, res) => {
  const customerId = req.params.id;
  try {
    const customer = await Customer.findByIdAndUpdate(
      { _id: customerId },
      {
        $set: { isDeleted: true },
      },
      { new: true }
    );

    if (!customer) {
      return res.status(404).json({ error: "Customer not found!" });
    }
    res.status(200).json({ message: "Customer deleted successfully." });
  } catch (error) {
    console.error("Error deleting customer:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
