import express from "express";
import Package from "../models/Package.js";
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