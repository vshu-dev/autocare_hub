const express = require("express");
const router = express.Router();
const db = require("../config/db");
const { protect } = require("../middleware/auth");

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
    try {
      ids = JSON.parse(b.serviceIds || '[]');
    } catch(e) {}
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

// @route   POST /api/bookings
// @desc    Create a new booking
router.post("/", protect, async (req, res) => {
  try {
    const { serviceIds, vehicleNumber, vehicleBrand, vehicleModel, bookingDate, timeSlot, notes } = req.body;

    if (!serviceIds || !Array.isArray(serviceIds) || serviceIds.length === 0 || !vehicleNumber || !vehicleBrand || !bookingDate) {
      return res.status(400).json({ success: false, message: "Please fill all required fields and select at least one service" });
    }

    const placeholders = serviceIds.map(() => '?').join(',');
    const services = db.prepare(`SELECT * FROM services WHERE id IN (${placeholders}) AND isActive = 1`).all(...serviceIds);

    if (services.length !== serviceIds.length) {
      return res.status(404).json({ success: false, message: "One or more services not found or unavailable" });
    }

    const totalAmount = services.reduce((sum, s) => sum + s.price, 0);

    const info = db.prepare(`
      INSERT INTO bookings (userId, serviceId, serviceIds, vehicleNumber, vehicleBrand, vehicleModel, bookingDate, timeSlot, notes, totalAmount)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      req.user.id,
      serviceIds[0],
      JSON.stringify(serviceIds),
      vehicleNumber,
      vehicleBrand,
      vehicleModel || "",
      bookingDate,
      timeSlot || "09:00 AM",
      notes || "",
      totalAmount
    );

    // Fetch newly created booking
    const allUserBookings = fetchPopulatedBookings(req.user.id);
    const newBooking = allUserBookings.find(b => b.id === info.lastInsertRowid);

    res.status(201).json({
      success: true,
      message: "Booking created successfully",
      booking: newBooking,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/bookings/my
// @desc    Get logged-in user's bookings
router.get("/my", protect, async (req, res) => {
  try {
    const bookings = fetchPopulatedBookings(req.user.id);
    res.json({ success: true, count: bookings.length, bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/bookings/:id
// @desc    Cancel a booking (user can only cancel pending bookings)
router.delete("/:id", protect, async (req, res) => {
  try {
    const booking = db.prepare("SELECT * FROM bookings WHERE id = ?").get(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    if (booking.userId !== req.user.id) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    if (!["pending", "confirmed"].includes(booking.status)) {
      return res.status(400).json({ success: false, message: "Cannot cancel this booking" });
    }

    db.prepare("UPDATE bookings SET status = 'cancelled' WHERE id = ?").run(req.params.id);

    res.json({ success: true, message: "Booking cancelled successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;