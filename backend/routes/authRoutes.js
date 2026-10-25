const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const db = require("../config/db");
const { protect } = require("../middleware/auth");

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

// ── Register ──────────────────────────────────────────────────────────────────
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ success: false, message: "Please fill all required fields" });

    if (phone && !/^\d{10}$/.test(phone))
      return res.status(400).json({ success: false, message: "Phone number must be exactly 10 digits" });

    const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
    if (existing)
      return res.status(400).json({ success: false, message: "Email already registered" });

    const hashed = await bcrypt.hash(password, 10);
    const info = db
      .prepare("INSERT INTO users (name, email, password, phone) VALUES (?, ?, ?, ?)")
      .run(name, email, hashed, phone || "");

    const user = db.prepare("SELECT id, name, email, phone, role FROM users WHERE id = ?").get(info.lastInsertRowid);

    res.status(201).json({
      success: true,
      message: "Registration successful",
      token: generateToken(user.id),
      user: { id: user.id, _id: String(user.id), name: user.name, email: user.email, phone: user.phone, role: user.role },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── Login ─────────────────────────────────────────────────────────────────────
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: "Please provide email and password" });

    const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
    if (!user)
      return res.status(401).json({ success: false, message: "Invalid email or password" });

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(401).json({ success: false, message: "Invalid email or password" });

    if (!user.isActive)
      return res.status(403).json({ success: false, message: "Account is deactivated. Contact admin." });

    res.json({
      success: true,
      message: "Login successful",
      token: generateToken(user.id),
      user: { id: user.id, _id: String(user.id), name: user.name, email: user.email, phone: user.phone, role: user.role },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── Get Profile ───────────────────────────────────────────────────────────────
router.get("/me", protect, (req, res) => {
  const u = req.user;
  res.json({
    success: true,
    user: { _id: u._id, name: u.name, email: u.email, phone: u.phone, role: u.role },
  });
});

module.exports = router;