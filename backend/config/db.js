const { DatabaseSync } = require("node:sqlite");
const path = require("path");
const fs = require("fs");

// Ensure data directory exists
const dataDir = path.join(__dirname, "../data");
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const DB_PATH = path.join(dataDir, "autocare.db");
const db = new DatabaseSync(DB_PATH);

// Performance settings
db.exec("PRAGMA journal_mode = WAL");
db.exec("PRAGMA foreign_keys = ON");

// ─── Create Tables ───────────────────────────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    name      TEXT    NOT NULL,
    email     TEXT    UNIQUE NOT NULL,
    password  TEXT    NOT NULL,
    phone     TEXT    DEFAULT '',
    role      TEXT    DEFAULT 'user',
    isActive  INTEGER DEFAULT 1,
    createdAt TEXT    DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS services (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT    NOT NULL,
    description TEXT    NOT NULL,
    price       REAL    NOT NULL,
    duration    TEXT    NOT NULL,
    category    TEXT    DEFAULT 'Maintenance',
    icon        TEXT    DEFAULT '🔧',
    isActive    INTEGER DEFAULT 1,
    createdAt   TEXT    DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS bookings (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    userId        INTEGER NOT NULL,
    serviceId     INTEGER,
    serviceIds    TEXT    DEFAULT '[]',
    vehicleNumber TEXT    NOT NULL,
    vehicleBrand  TEXT    NOT NULL,
    vehicleModel  TEXT    DEFAULT '',
    bookingDate   TEXT    NOT NULL,
    timeSlot      TEXT    DEFAULT '09:00 AM',
    status        TEXT    DEFAULT 'pending',
    totalAmount   REAL    DEFAULT 0,
    notes         TEXT    DEFAULT '',
    adminNotes    TEXT    DEFAULT '',
    createdAt     TEXT    DEFAULT (datetime('now'))
  );
`);

// Migration to add serviceIds if it doesn't exist
try {
  db.prepare("SELECT serviceIds FROM bookings LIMIT 1").get();
} catch (err) {
  db.exec("ALTER TABLE bookings ADD COLUMN serviceIds TEXT DEFAULT '[]'");
  try {
    db.exec("UPDATE bookings SET serviceIds = json_array(serviceId) WHERE serviceId IS NOT NULL");
  } catch(e) {} // Ignore if json_array isn't supported in this sqlite version, it'll just stay '[]'
}

console.log("✅ SQLite Database ready (built-in node:sqlite):", DB_PATH);
module.exports = db;