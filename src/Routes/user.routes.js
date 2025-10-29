import express from "express";
import { registerUser } from "../Controllers/user.controller.js";
const router = express.Router();

// User Routes
// Base path: /api/v1/users

// User Registration
router.post("/register", registerUser);

export default router;
