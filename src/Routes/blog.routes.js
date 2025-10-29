import express from "express";
import {
  createBlog,
  getAllBlogs,
  getBlogById,
  updateBlogById,
  deleteBlogById,
} from "../Controllers/blog.controller.js";
const router = express.Router();

// Blog Routes
// Base path: /api/v1/blogs

// Create a new blog
router.post("/", createBlog);

// Get all blogs
router.get("/", getAllBlogs);

// Get single blog by ID
router.get("/:id", getBlogById);

// Update blog by ID
router.put("/:id", updateBlogById);

// Delete blog by ID
router.delete("/:id", deleteBlogById);

export default router;
