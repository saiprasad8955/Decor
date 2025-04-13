// File: routes/authRoutes.js
import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/user.js";

const router = express.Router();

router.get("/me", (req, res) => {
  res.json({data: {user: req.user}});
});

router.post("/register", async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.status(201).json({ message: "User registered" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ error: "Invalid credentials" });
  }
  const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1d" });
  res.json({ data: { accessToken: token, user} });
});

export default router;
