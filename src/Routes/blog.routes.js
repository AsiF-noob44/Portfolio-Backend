import express from "express";
import {
  createBlog,
  getAllBlogs,
  getBlogById,
  updateBlogById,
  deleteBlogById,
} from "../Controllers/blog.controller.js";
import { validateUser } from "../middlewares/validation.middleware.js";
import upload from "../Config/multer.config.js";

const router = express.Router();

// Blog Routes
// Base path: /api/v1/blogs

// Public routes
router.get("/", getAllBlogs);
router.get("/:id", getBlogById);

// Protected routes (with optional image upload)
router.post("/", validateUser, upload.single("img"), createBlog);
router.put("/:id", validateUser, upload.single("img"), updateBlogById);
router.delete("/:id", validateUser, deleteBlogById);

export default router;
