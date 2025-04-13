// File: routes/customerRoutes.js
import express from "express";
import Customer from "../models/customer.js";
const router = express.Router();

router.get("/list", async (req, res) => {
  const customers = await Customer.find({ isDeleted: false });
  res.json(customers);
});

router.post("/add", async (req, res) => {
  try {
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

export default router;
