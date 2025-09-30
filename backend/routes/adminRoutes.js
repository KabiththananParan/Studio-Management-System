import express from "express";
import { loginAdmin } from "../controllers/adminController.js";

const router = express.Router();

// Only login for now
router.post("/login", loginAdmin);

export default router;
