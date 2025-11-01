import express from "express";
import upload from "../Config/multer.config.js";
import {
  uploadFile,
  getAllFiles,
  deleteFile,
} from "../Controllers/file.controller.js";
import { validateUser } from "../middlewares/validation.middleware.js";

const router = express.Router();

// File Routes
// Base path: /api/v1/files

// Public routes
router.get("/", getAllFiles);

// Protected routes (require authentication)
router.post("/upload", validateUser, upload.single("file"), uploadFile);
router.delete("/:id", validateUser, deleteFile);

export default router;
