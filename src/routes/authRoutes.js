// File: routes/authRoutes.js
const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const bcrypt = require('bcrypt');

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const user = new User(req.body); // No need to hash manually
    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(201).send({ message: "User registered", accessToken: token, user });
  } catch (err) {
    res.status(400).send({ error: err.message });
  }
});



router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).send({ error: "Invalid credentials" });
  }
  const token = jwt.sign(
    { id: user._id, role: user.role, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );
  res.send({ accessToken: token, user });
});

module.exports = router