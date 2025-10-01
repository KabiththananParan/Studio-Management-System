import express from "express";
import dotenv from "dotenv";
dotenv.config();
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/user.js";
import cors from "cors";
import router from "./routes/userRoutes.js";
import adminUsersRoutes from "./routes/adminUsers.js";
import adminPackagesRoutes from "./routes/adminPackages.js";
import adminDashboardRoutes from "./routes/adminDashboard.js";
import adminSlotsRoutes from "./routes/adminSlots.js";
import adminRoutes from "./routes/adminRoutes.js";



connectDB();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);

app.use("/api/admin/users", adminUsersRoutes);
app.use("/api/admin/packages", adminPackagesRoutes);
app.use("/api/admin/dashboard", adminDashboardRoutes);
app.use("/api/admin/slots", adminSlotsRoutes);

app.use("/api/auth/admin", adminRoutes);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
