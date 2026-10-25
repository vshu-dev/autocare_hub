const jwt = require("jsonwebtoken");
const db = require("../config/db");

const protect = (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization?.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }
    if (!token)
      return res.status(401).json({ success: false, message: "Not authorized, no token" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = db
      .prepare("SELECT id, name, email, phone, role, isActive FROM users WHERE id = ?")
      .get(decoded.id);

    if (!user)
      return res.status(401).json({ success: false, message: "User not found" });

    req.user = { ...user, _id: String(user.id), isActive: Boolean(user.isActive) };
    next();
  } catch {
    return res.status(401).json({ success: false, message: "Not authorized, token invalid" });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user?.role !== "admin")
    return res.status(403).json({ success: false, message: "Admin access required" });
  next();
};

module.exports = { protect, adminOnly };
