const express = require("express");
const router = express.Router();

// 1. Total Sales Today
router.get("/sales/today", async (req, res) => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);

  const sales = await Invoice.aggregate([
    { $match: { invoice_date: { $gte: start, $lte: end }, isDeleted: false } },
    { $group: { _id: null, total: { $sum: "$final_amount" } } },
  ]);

  res.send({ totalSalesToday: sales[0]?.total || 0 });
});

// 2. Monthly Sales Trend
router.get("/sales/monthly", async (req, res) => {
  const year = new Date().getFullYear();
  const startOfYear = new Date(`${year}-01-01T00:00:00Z`);
  const endOfYear = new Date(`${year}-12-31T23:59:59Z`);

  const sales = await Invoice.aggregate([
    {
      $match: {
        invoice_date: { $gte: startOfYear, $lte: endOfYear },
        isDeleted: false,
      },
    },
    {
      $group: {
        _id: { $month: "$invoice_date" },
        total: { $sum: "$final_amount" },
      },
    },
    { $sort: { "_id": 1 } }
  ]);

  res.send(sales);
});

// 3. Top 5 Selling Items
router.get("/items/top", async (req, res) => {
  const items = await Item.find({ isDeleted: false })
    .sort({ sold_quantity: -1 })
    .limit(5);
  res.send(items);
});

// 4. Low Stock Alert
router.get("/items/low-stock", async (req, res) => {
  const items = await Item.find({ remaining_quantity: { $lt: 5 }, isDeleted: false });
  res.send(items);
});

// 5. Total Inventory Value
router.get("/inventory/value", async (req, res) => {
  const values = await Item.aggregate([
    {
      $group: {
        _id: null,
        costValue: { $sum: { $multiply: ["$cost_price", "$quantity"] } },
        retailValue: { $sum: { $multiply: ["$selling_price", "$quantity"] } },
      },
    },
  ]);
  res.send(values[0] || { costValue: 0, retailValue: 0 });
});


module.exports = router;
