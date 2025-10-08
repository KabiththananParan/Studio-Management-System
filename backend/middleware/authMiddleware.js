import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Admin from "../models/Admin.js";

export const protect = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]; // Expect "Bearer TOKEN"
  console.log('🔐 Auth middleware - Token present:', !!token);
  console.log('🔐 Request path:', req.path);
  if (!token) {
    console.log('❌ No token provided');
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
      req.user = { id: admin._id.toString(), email: admin.email, role: "admin", isAdmin: true };
    } else {
      // Fetch regular user from DB
      const user = await User.findById(decoded.id);
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }
      // Attach user info to request
      req.user = { id: user._id.toString(), email: user.email, role: "user", isAdmin: false };
    }
    
    next();
  } catch (error) {
    console.log('❌ Auth error:', error.message);
    return res.status(401).json({ message: "Not authorized, token invalid" });
  }
};

// Admin middleware - checks if user is admin
export const admin = (req, res, next) => {
  console.log('🔐 Admin middleware - User role:', req.user?.role, 'IsAdmin:', req.user?.isAdmin);
  if (req.user && (req.user.isAdmin || req.user.role === "admin")) {
    console.log('✅ Admin access granted');
    next();
  } else {
    console.log('❌ Admin access denied');
    res.status(403).json({ message: "Not authorized as admin" });
  }
};
