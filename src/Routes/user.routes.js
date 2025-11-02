import express from "express";
import {
  registerUser,
  loginUser,
  getAllUsers,
  logoutUser,
  updateUser,
} from "../Controllers/user.controller.js";
import { validateUser } from "../middlewares/validation.middleware.js";

const router = express.Router();

// User Routes
// Base path: /api/v1/users

// Public routes
router.post("/register", registerUser);
router.post("/login", loginUser);

// Protected routes (require authentication)
router.get("/", validateUser, getAllUsers);
router.post("/logout", validateUser, logoutUser);
router.put("/update", validateUser, updateUser);

export default router;
