// File: server.js
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import itemRoutes from "./src/routes/itemRoutes.js";
import invoiceRoutes from "./src/routes/invoiceRoutes.js";
import customerRoutes from "./src/routes/customerRoutes.js";
import authRoutes from "./src/routes/authRoutes.js";
import { verifyToken } from "./src/middleware/auth.js";

dotenv.config();
const app = express();

const corsOrigin = ["http://localhost:3033"];

const corsOptions = {
  origin: corsOrigin,
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
};

app.use(cors(corsOptions));
app.use(express.json());

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Routes
app.use("/auth", authRoutes);
app.use("/items", verifyToken, itemRoutes);
app.use("/customers", verifyToken, customerRoutes);
app.use("/invoices", verifyToken, invoiceRoutes);
app.get("/", (req, res) => {
  res.json({ msg: "hello its working!!" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
