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

// Allow requests from your local frontend and from Vercel
const allowedOrigins = [
  "http://localhost:3033",
  "https://decor-pdu8pdld4-saiprasad8955s-projects.vercel.app/",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true, // Only needed if you're using cookies/auth headers
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
