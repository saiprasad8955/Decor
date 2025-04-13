// File: server.js
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import itemRoutes from "./routes/itemRoutes.js";
import invoiceRoutes from "./routes/invoiceRoutes.js";
import customerRoutes from "./routes/customerRoutes.js"
import authRoutes from "./routes/authRoutes.js"
import { verifyToken } from "./middleware/auth.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));


// Routes
app.use("/auth", authRoutes);
app.use("/items", verifyToken, itemRoutes);
app.use("/customers", verifyToken, customerRoutes);
app.use("/invoices", verifyToken, invoiceRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

