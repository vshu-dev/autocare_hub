const express = require("express");
const router = express.Router();
const db = require("../config/db");

const fmt = (s) => ({
  _id: String(s.id), id: s.id,
  name: s.name, description: s.description,
  price: s.price, duration: s.duration,
  category: s.category, icon: s.icon,
  isActive: Boolean(s.isActive), createdAt: s.createdAt,
});

// GET all active services
router.get("/", (req, res) => {
  try {
    const services = db.prepare("SELECT * FROM services WHERE isActive = 1 ORDER BY category, name").all();
    res.json({ success: true, services: services.map(fmt) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET single service
router.get("/:id", (req, res) => {
  try {
    const s = db.prepare("SELECT * FROM services WHERE id = ?").get(req.params.id);
    if (!s) return res.status(404).json({ success: false, message: "Service not found" });
    res.json({ success: true, service: fmt(s) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;