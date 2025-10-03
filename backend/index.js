import express from "express";
import dotenv from "dotenv";
dotenv.config();
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/user.js";
import userSlotsRoutes from "./routes/userSlots.js";
import userBookingsRoutes from "./routes/userBookings.js";
import cors from "cors";
import router from "./routes/userRoutes.js";
import adminUsersRoutes from "./routes/adminUsers.js";
import adminPackagesRoutes from "./routes/adminPackages.js";
import adminDashboardRoutes from "./routes/adminDashboard.js";
import adminSlotsRoutes from "./routes/adminSlots.js";
import adminBookingsRoutes from "./routes/adminBookings.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import refundRoutes from "./routes/refundRoutes.js";
import adminRefundRoutes from "./routes/adminRefundRoutes.js";
import userReviews from "./routes/userReviews.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import userComplaints from "./routes/userComplaints.js";
import adminReviews from "./routes/adminReviews.js";
import adminComplaints from "./routes/adminComplaints.js";
import adminInventoryRoutes from "./routes/adminInventory.js";
import adminInventoryBookingsRoutes from "./routes/adminInventoryBookings.js";
import userInventoryBookings from "./routes/userInventoryBookings.js";
import adminSettingsRoutes from "./routes/adminSettings.js";
import testRoutes from "./routes/testRoutes.js";



// Initialize app first
const app = express();

// Connect to database (async)
connectDB().catch(console.error);
app.use(cors());
app.use(express.json());

// Health check route
app.get('/', (req, res) => {
  res.json({ message: 'Server is running!', timestamp: new Date() });
});

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/user/slots", userSlotsRoutes);
app.use("/api/user/bookings", userBookingsRoutes);
app.use("/api/user/refunds", refundRoutes);
app.use("/api/user/reviews", userReviews);
app.use("/api/user/complaints", userComplaints);
app.use("/api/user/inventory-bookings", userInventoryBookings);

app.use("/api/admin/users", adminUsersRoutes);
app.use("/api/admin/packages", adminPackagesRoutes);
app.use("/api/admin/dashboard", adminDashboardRoutes);
app.use("/api/admin/slots", adminSlotsRoutes);
app.use("/api/admin/bookings", adminBookingsRoutes);
app.use("/api/admin/refunds", adminRefundRoutes);
app.use("/api/admin/reviews", adminReviews);
app.use("/api/admin/complaints", adminComplaints);
app.use("/api/admin/inventory", adminInventoryRoutes);
app.use("/api/admin/inventory-bookings", adminInventoryBookingsRoutes);
app.use("/api/admin/settings", adminSettingsRoutes);

// Debug: Add logging for payment routes
console.log("Registering payment routes at /api/payments");
app.use("/api/payments", paymentRoutes);

// Register general refund routes for eligibility checks
console.log("Registering general refund routes at /api/refunds");
app.use("/api/refunds", refundRoutes);

// Register public review routes
console.log("Registering review routes at /api/reviews");
app.use("/api/reviews", reviewRoutes);

// Test routes for debugging
app.use("/api/test", testRoutes);

app.use("/api/auth/admin", adminRoutes);


const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Server available at http://localhost:${PORT}`);
});

server.on('error', (err) => {
  console.error('Server error:', err);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  server.close(() => {
    process.exit(1);
  });
});
