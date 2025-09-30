import dotenv from "dotenv";
dotenv.config();
import express from "express";
import connectDB from "./config/db.js";
import Package from "./models/Package.js";
import cors from "cors";

// Connect to database
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// Test endpoint
app.get("/api/user/packages", async (req, res) => {
  try {
    const packages = await Package.find({ isActive: true }).sort({ createdAt: -1 });
    console.log("Packages found:", packages.length);
    res.json(packages);
  } catch (err) {
    console.error("Error fetching packages:", err);
    res.status(500).json({ message: "Server error" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
  console.log(`Packages endpoint: http://localhost:${PORT}/api/user/packages`);
});