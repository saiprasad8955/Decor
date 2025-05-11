// File: server.js
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const itemRoutes = require("./src/routes/itemRoutes");
const invoiceRoutes = require("./src/routes/invoiceRoutes");
const customerRoutes = require("./src/routes/customerRoutes");
const authRoutes = require("./src/routes/authRoutes");
const { verifyToken } = require("./src/middleware/auth");

dotenv.config();
const app = express();

// Allow requests from your local frontend and from Vercel
const allowedOrigins = [
  "http://localhost:3033",
  "https://decor-nu.vercel.app/",
];

app.use(
  cors({
    origin: "*", // Allow all origins
    credentials: false, // Set to true only if you’re using cookies or auth headers
  })
);

app.use(express.json());

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Routes
app.use("/auth", authRoutes);

app.use("/user/me", verifyToken, (req, res) => {
  res.json({ user: req.user });
});

app.use("/item", verifyToken, itemRoutes);
app.use("/customer", verifyToken, customerRoutes);
app.use("/invoice", verifyToken, invoiceRoutes);

app.use(express.static(path.resolve(path.dirname(__filename), "client/build")));
app.get("/*", function (req, res) {
  res.sendFile(path.resolve(path.dirname(__filename), "client/build/index.html"));
});
// For static website

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
