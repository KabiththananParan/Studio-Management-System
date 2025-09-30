import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Admin from "../models/Admin.js";

export const protect = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]; // Expect "Bearer TOKEN"
  if (!token) {
    return res.status(401).json({ message: "Not authorized, token missing" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if token has role information
    if (decoded.role === "admin") {
      // Fetch admin from DB
      const admin = await Admin.findById(decoded.id);
      if (!admin) {
        return res.status(401).json({ message: "Admin not found" });
      }
      // Attach admin info to request
      req.user = { id: admin._id, role: "admin", isAdmin: true };
    } else {
      // Fetch regular user from DB
      const user = await User.findById(decoded.id);
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }
      // Attach user info to request
      req.user = { id: user._id, role: "user", isAdmin: false };
    }
    
    next();
  } catch (error) {
    return res.status(401).json({ message: "Not authorized, token invalid" });
  }
};

// Admin middleware - checks if user is admin
export const admin = (req, res, next) => {
  if (req.user && (req.user.isAdmin || req.user.role === "admin")) {
    next();
  } else {
    res.status(403).json({ message: "Not authorized as admin" });
  }
};
