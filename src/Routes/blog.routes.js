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
router.post("/blogs", createBlog);

// Get all blogs
router.get("/blogs", getAllBlogs);

// Get single blog by ID
router.get("/blogs/:id", getBlogById);

// Update blog by ID
router.put("/blogs/:id", updateBlogById);

// Delete blog by ID
router.delete("/blogs/:id", deleteBlogById);

export default router;
