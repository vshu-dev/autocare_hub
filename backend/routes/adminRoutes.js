const express = require("express");
const router = express.Router();
const db = require("../config/db");
const { protect, adminOnly } = require("../middleware/auth");

const fetchPopulatedBookings = (userId = null) => {
  let query = `
    SELECT b.*, u.name AS userName, u.email AS userEmail, u.phone AS userPhone
    FROM bookings b
    JOIN users u ON b.userId = u.id
  `;
  const params = [];
  if (userId) {
    query += ` WHERE b.userId = ?`;
    params.push(userId);
  }
  query += ` ORDER BY b.createdAt DESC`;
  
  const bookingsRows = db.prepare(query).all(...params);
  
  const allServices = db.prepare("SELECT * FROM services").all();
  const serviceMap = {};
  allServices.forEach(s => serviceMap[s.id] = s);

  return bookingsRows.map(b => {
    let ids = [];
    try { ids = JSON.parse(b.serviceIds || '[]'); } catch(e) {}
    if (ids.length === 0 && b.serviceId) ids = [b.serviceId];

    const selectedServices = ids.map(id => serviceMap[id]).filter(Boolean).map(s => ({
      _id: String(s.id),
      id: s.id,
      name: s.name,
      price: s.price,
      duration: s.duration,
      category: s.category,
      icon: s.icon,
    }));

    return {
      _id: String(b.id),
      id: b.id,
      user: { _id: String(b.userId), id: b.userId, name: b.userName, email: b.userEmail, phone: b.userPhone },
      services: selectedServices,
      vehicleNumber: b.vehicleNumber,
      vehicleBrand: b.vehicleBrand,
      vehicleModel: b.vehicleModel,
      bookingDate: b.bookingDate,
      timeSlot: b.timeSlot,
      status: b.status,
      totalAmount: b.totalAmount,
      notes: b.notes,
      adminNotes: b.adminNotes,
      createdAt: b.createdAt,
    };
  });
};

// Get all bookings
router.get("/bookings", protect, adminOnly, (req, res) => {
  try {
    const formatted = fetchPopulatedBookings();
    res.json({ success: true, bookings: formatted });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update booking status
router.put("/bookings/:id", protect, adminOnly, (req, res) => {
  try {
    const { status, adminNotes } = req.body;
    db.prepare("UPDATE bookings SET status = ?, adminNotes = ? WHERE id = ?").run(status, adminNotes, req.params.id);
    res.json({ success: true, message: "Booking updated successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get dashboard stats
router.get("/stats", protect, adminOnly, (req, res) => {
  try {
    const totalUsers = db.prepare("SELECT COUNT(*) as count FROM users").get().count;
    const totalBookings = db.prepare("SELECT COUNT(*) as count FROM bookings").get().count;
    const pendingBookings = db.prepare("SELECT COUNT(*) as count FROM bookings WHERE status = 'pending'").get().count;
    const revenue = db.prepare("SELECT SUM(totalAmount) as total FROM bookings WHERE status = 'completed'").get().total || 0;
    
    res.json({
      success: true,
      stats: {
        totalUsers,
        totalBookings,
        pendingBookings,
        revenue
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
