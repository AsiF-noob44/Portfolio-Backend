import express from "express";
import {
  createBlog,
  getAllBlogs,
  getBlogById,
} from "../Controllers/blog.controller.js";
const router = express.Router();

// Blog Routes
router.post("/blogs", createBlog);

// Get all blogs
router.get("/blogs", getAllBlogs);

// Get single blog by ID (increments views)
router.get("/blogs/:id", getBlogById);

export default router;
