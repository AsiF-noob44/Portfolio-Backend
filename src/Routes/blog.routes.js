import express from "express";
import {
  createBlog,
  getAllBlogs,
  getBlogById,
  updateBlogById,
  deleteBlogById,
} from "../Controllers/blog.controller.js";
import { validateUser } from "../middlewares/validation.middleware.js";

const router = express.Router();

// Blog Routes
// Base path: /api/v1/blogs

// Public routes
router.get("/", getAllBlogs);
router.get("/:id", getBlogById);

// Protected routes
router.post("/", validateUser, createBlog);
router.put("/:id", validateUser, updateBlogById);
router.delete("/:id", validateUser, deleteBlogById);

export default router;
