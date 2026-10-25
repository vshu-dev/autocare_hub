const db = require("./config/db");
const bcrypt = require("bcryptjs");

const services = [
  {
    name: "Engine Oil Change",
    description: "Complete engine oil replacement with premium synthetic or semi-synthetic oil. Includes oil filter replacement and multi-point inspection.",
    price: 999,
    duration: "45-60 min",
    category: "Maintenance",
    icon: "🛢",
    isActive: true,
  },
  {
    name: "Brake Pad Replacement",
    description: "Full brake pad replacement with high-quality pads. Includes brake disc inspection and brake fluid check.",
    price: 2499,
    duration: "1-2 hours",
    category: "Repair",
    icon: "🔴",
    isActive: true,
  },
  {
    name: "Full Car Service",
    description: "Comprehensive vehicle service covering oil change, filter replacement, spark plugs, belts, and 50+ point inspection.",
    price: 4999,
    duration: "3-4 hours",
    category: "Maintenance",
    icon: "⚙️",
    isActive: true,
  },
  {
    name: "AC Service & Gas Refill",
    description: "Full AC system inspection, cleaning, gas refill, and performance optimization. Includes compressor check.",
    price: 1499,
    duration: "1-2 hours",
    category: "Repair",
    icon: "❄️",
    isActive: true,
  },
  {
    name: "Tire Rotation & Balancing",
    description: "Complete tyre rotation for even wear, wheel balancing, and tyre pressure check. Extends tyre life significantly.",
    price: 799,
    duration: "45-60 min",
    category: "Tires",
    icon: "🔄",
    isActive: true,
  },
  {
    name: "Battery Replacement",
    description: "Battery health test and replacement with OEM or aftermarket battery. Includes alternator and charging system check.",
    price: 3499,
    duration: "30-45 min",
    category: "Electrical",
    icon: "🔋",
    isActive: true,
  },
  {
    name: "Car Wash & Detailing",
    description: "Premium exterior and interior detailing, foam wash, wax polish, dashboard cleaning, and vacuum cleaning.",
    price: 1299,
    duration: "2-3 hours",
    category: "Cleaning",
    icon: "🧽",
    isActive: true,
  },
  {
    name: "Pre-Purchase Inspection",
    description: "Thorough inspection report for used vehicles. Covers engine, transmission, brakes, suspension, body, and electrical systems.",
    price: 1999,
    duration: "2-3 hours",
    category: "Inspection",
    icon: "🔍",
    isActive: true,
  },
  {
    name: "Suspension Check & Repair",
    description: "Complete suspension system inspection, shock absorber testing, alignment check, and necessary repairs.",
    price: 3999,
    duration: "2-4 hours",
    category: "Repair",
    icon: "🔩",
    isActive: true,
  },
  {
    name: "Wheel Alignment",
    description: "Computer-aided 4-wheel alignment for optimal handling and reduced tyre wear. Includes steering check.",
    price: 899,
    duration: "1 hour",
    category: "Tires",
    icon: "🎯",
    isActive: true,
  },
  {
    name: "Windshield Repair",
    description: "Professional windshield crack and chip repair or full replacement. Includes rain sensor recalibration if needed.",
    price: 2999,
    duration: "1-3 hours",
    category: "Repair",
    icon: "🪟",
    isActive: true,
  },
  {
    name: "Electrical Diagnostics",
    description: "Advanced OBD scanner diagnostics, fault code reading, electrical system testing and repair.",
    price: 1499,
    duration: "1-2 hours",
    category: "Electrical",
    icon: "⚡",
    isActive: true,
  },
];

async function seed() {
  try {
    console.log("🌱 Starting SQLite Database seed...");

    // ---- Seed Services ----
    db.prepare("DELETE FROM services").run();
    console.log("🗑 Cleared existing services table");

    const stmt = db.prepare(`
      INSERT INTO services (name, description, price, duration, category, icon, isActive)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    try {
      db.exec("BEGIN TRANSACTION");
      for (const s of services) {
        stmt.run(s.name, s.description, s.price, s.duration, s.category, s.icon, s.isActive ? 1 : 0);
      }
      db.exec("COMMIT");
    } catch (txErr) {
      db.exec("ROLLBACK");
      throw txErr;
    }
    console.log(`✅ Seeded ${services.length} services`);

    // ---- Seed Fixed Admin Account ----
    const ADMIN_EMAIL    = "admin@autocare.com";
    const ADMIN_PASSWORD = "Admin@1234";
    const ADMIN_NAME     = "Super Admin";

    db.prepare("DELETE FROM users WHERE email = ?").run(ADMIN_EMAIL);

    const hashed = await bcrypt.hash(ADMIN_PASSWORD, 10);
    db.prepare(`
      INSERT INTO users (name, email, password, phone, role, isActive)
      VALUES (?, ?, ?, ?, 'admin', 1)
    `).run(ADMIN_NAME, ADMIN_EMAIL, hashed, "+91 9999999999");

    console.log("\n🔐 Admin Account Created:");
    console.log("   📧 Email    : " + ADMIN_EMAIL);
    console.log("   🔒 Password : " + ADMIN_PASSWORD);
    console.log("\n✅ SQLite database seeded successfully!");
    console.log("🚀 Now start the server: npm run dev\n");
  } catch (err) {
    console.error("❌ Seed error:", err.message);
  } finally {
    process.exit(0);
  }
}

seed();
