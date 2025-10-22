import express from "express";
import Package from "../models/Package.js";
import Booking from "../models/Booking.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Get all packages - Admin only
router.get("/", protect, admin, async (req, res) => {
  try {
    const packages = await Package.find().sort({ createdAt: -1 });
    res.json(packages);
  } catch (err) {
    console.error("Error fetching packages:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Generate packages report (CSV/JSON)
// GET /api/admin/packages/report?from=YYYY-MM-DD&to=YYYY-MM-DD&format=csv|json&activeOnly=true
router.get("/report", protect, admin, async (req, res) => {
  try {
    const { from, to, format = "csv", activeOnly } = req.query;

    // Fetch all packages (optionally only active)
    const pkgFilter = {};
    if (activeOnly === "true") pkgFilter.isActive = true;
    const pkgs = await Package.find(pkgFilter).lean();

    // Build booking date filter
    const bookingMatch = {};
    if (from || to) {
      bookingMatch.bookingDate = {};
      if (from) bookingMatch.bookingDate.$gte = new Date(from);
      if (to) bookingMatch.bookingDate.$lte = new Date(to);
    }

    // Aggregate booking stats by package
    const stats = await Booking.aggregate([
      { $match: { ...bookingMatch } },
      {
        $group: {
          _id: "$packageId",
          packageName: { $first: "$packageName" },
          totalBookings: { $sum: 1 },
          completed: { $sum: { $cond: [{ $eq: ["$bookingStatus", "completed"] }, 1, 0] } },
          cancelled: { $sum: { $cond: [{ $eq: ["$bookingStatus", "cancelled"] }, 1, 0] } },
          revenue: { $sum: "$totalAmount" },
          avgAmount: { $avg: "$totalAmount" },
          lastBookingAt: { $max: "$createdAt" },
        },
      },
    ]);

    const statsMap = new Map(stats.map((s) => [String(s._id), s]));

    // Compose rows
    const rows = pkgs.map((p) => {
      const s = statsMap.get(String(p._id));
      return {
        PackageName: p.name,
        Price: p.price,
        DurationHours: p.duration,
        Active: p.isActive ? "Yes" : "No",
        TotalBookings: s?.totalBookings || 0,
        Completed: s?.completed || 0,
        Cancelled: s?.cancelled || 0,
        Revenue: s?.revenue || 0,
        AverageBookingValue: s?.avgAmount ? Number(s.avgAmount.toFixed(2)) : 0,
        LastBookingAt: s?.lastBookingAt ? new Date(s.lastBookingAt).toISOString() : "",
        CreatedAt: p.createdAt?.toISOString?.() || "",
      };
    });

    if (format === "csv") {
      // Build CSV manually to avoid extra deps
      const headers = Object.keys(rows[0] || {
        PackageName: "",
        Price: "",
        DurationHours: "",
        Active: "",
        TotalBookings: "",
        Completed: "",
        Cancelled: "",
        Revenue: "",
        AverageBookingValue: "",
        LastBookingAt: "",
        CreatedAt: "",
      });

      const escapeVal = (v) => {
        if (v === null || v === undefined) return "";
        const str = String(v);
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return '"' + str.replace(/"/g, '""') + '"';
        }
        return str;
      };

      const csv = [headers.join(",")]
        .concat(rows.map((r) => headers.map((h) => escapeVal(r[h])).join(",")))
        .join("\n");

      const filename = `packages_report_${new Date().toISOString().slice(0, 10)}.csv`;
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", `attachment; filename=${filename}`);
      return res.status(200).send(csv);
    }

    // Default: JSON
    return res.json({ generatedAt: new Date(), count: rows.length, rows });
  } catch (err) {
    console.error("Error generating packages report:", err);
    res.status(500).json({ message: "Server error generating report" });
  }
});

// Get a single package by ID - Admin only
router.get("/:id", protect, admin, async (req, res) => {
  try {
    const pkg = await Package.findById(req.params.id);
    if (!pkg) {
      return res.status(404).json({ message: "Package not found" });
    }
    res.json(pkg);
  } catch (err) {
    console.error("Error fetching package:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Create a new package - Admin only
router.post("/", protect, admin, async (req, res) => {
  try {
    const { name, description, price, duration, features, image, isActive } = req.body;

    // Validation
    if (!name || !description || !price || !duration) {
      return res.status(400).json({ 
        message: "Name, description, price, and duration are required" 
      });
    }

    if (price <= 0 || duration <= 0) {
      return res.status(400).json({ 
        message: "Price and duration must be positive numbers" 
      });
    }

    // Check if package name already exists
    const existingPackage = await Package.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
    if (existingPackage) {
      return res.status(400).json({ message: "Package name already exists" });
    }

    const newPackage = new Package({
      name: name.trim(),
      description: description.trim(),
      price: parseFloat(price),
      duration: parseInt(duration),
      features: Array.isArray(features) ? features.filter(f => f.trim() !== '') : [],
      image: image ? image.trim() : "",
      isActive: typeof isActive === 'boolean' ? isActive : true
    });

    const savedPackage = await newPackage.save();
    res.status(201).json(savedPackage);
  } catch (err) {
    console.error("Error creating package:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Update a package by ID - Admin only
router.put("/:id", protect, admin, async (req, res) => {
  try {
    const { name, description, price, duration, features, image, isActive } = req.body;

    const pkg = await Package.findById(req.params.id);
    if (!pkg) {
      return res.status(404).json({ message: "Package not found" });
    }

    // Check if new name conflicts with existing package (excluding current one)
    if (name && name !== pkg.name) {
      const existingPackage = await Package.findOne({ 
        name: { $regex: new RegExp(`^${name}$`, 'i') },
        _id: { $ne: req.params.id }
      });
      if (existingPackage) {
        return res.status(400).json({ message: "Package name already exists" });
      }
    }

    // Update fields
    if (name !== undefined) pkg.name = name.trim();
    if (description !== undefined) pkg.description = description.trim();
    if (price !== undefined) {
      const parsedPrice = parseFloat(price);
      if (parsedPrice <= 0) {
        return res.status(400).json({ message: "Price must be a positive number" });
      }
      pkg.price = parsedPrice;
    }
    if (duration !== undefined) {
      const parsedDuration = parseInt(duration);
      if (parsedDuration <= 0) {
        return res.status(400).json({ message: "Duration must be a positive number" });
      }
      pkg.duration = parsedDuration;
    }
    if (features !== undefined) {
      pkg.features = Array.isArray(features) ? features.filter(f => f.trim() !== '') : [];
    }
    if (image !== undefined) pkg.image = image ? image.trim() : "";
    if (typeof isActive === 'boolean') pkg.isActive = isActive;

    const updatedPackage = await pkg.save();
    res.json(updatedPackage);
  } catch (err) {
    console.error("Error updating package:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete a package by ID - Admin only
router.delete("/:id", protect, admin, async (req, res) => {
  try {
    const pkg = await Package.findById(req.params.id);
    if (!pkg) {
      return res.status(404).json({ message: "Package not found" });
    }

    await pkg.deleteOne();
    res.json({ message: "Package deleted successfully" });
  } catch (err) {
    console.error("Error deleting package:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Toggle package status (activate/deactivate) - Admin only
router.patch("/:id/status", protect, admin, async (req, res) => {
  try {
    const pkg = await Package.findById(req.params.id);
    if (!pkg) {
      return res.status(404).json({ message: "Package not found" });
    }

    pkg.isActive = !pkg.isActive;
    const updatedPackage = await pkg.save();
    
    res.json({
      message: `Package ${updatedPackage.isActive ? 'activated' : 'deactivated'} successfully`,
      package: updatedPackage
    });
  } catch (err) {
    console.error("Error toggling package status:", err);
    res.status(500).json({ message: "Server error" });
  }
});
export default router;