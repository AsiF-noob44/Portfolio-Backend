import Blog from "../Models/blog.model.js";
import cloudinary from "../Config/cloudinary.config.js";

export const createBlog = async (req, res) => {
  try {
    const { title, category, description, short_description } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        message: "Title and description are required",
      });
    }

    const existingBlog = await Blog.findOne({ title: title.trim() });
    if (existingBlog) {
      return res.status(409).json({
        message: "Blog with this title already exists",
      });
    }

    const imgUrl = req.file ? req.file.path : req.body.img;

    const newBlog = new Blog({
      title,
      img: imgUrl,
      category,
      description,
      short_description,
    });

    await newBlog.save();

    res.status(201).json({
      message: "Blog created successfully",
      blog: newBlog,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Validation error",
        errors: Object.values(error.errors).map((e) => e.message),
      });
    }

    res.status(500).json({
      message: "Error creating blog",
      error: error.message,
    });
  }
};

export const getAllBlogs = async (req, res) => {
  try {
    // Pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Filtering by category
    const matchStage = req.query.category
      ? { $match: { category: req.query.category.toLowerCase() } }
      : { $match: {} };

    const facetStage = {
      $facet: {
        totalCount: [{ $count: "count" }],
        blogs: [
          { $sort: { createdAt: -1 } },
          { $skip: skip },
          { $limit: limit },
          {
            $project: {
              title: 1,
              img: 1,
              category: 1,
              description: 1,
              short_description: 1,
              views: 1,
              createdAt: 1,
              updatedAt: 1,
            },
          },
        ],
      },
    };

    const blogs = await Blog.aggregate([matchStage, facetStage]);

    const totalCount = blogs[0]?.totalCount[0]?.count || 0;
    const totalPages = Math.ceil(totalCount / limit);

    res.status(200).json({
      success: true,
      totalBlogs: totalCount,
      currentPage: page,
      totalPages: totalPages,
      limit: limit,
      blogs: blogs[0].blogs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching blogs",
      error: error.message,
    });
  }
};

// Get single blog by ID
export const getBlogById = async (req, res) => {
  try {
    // Validation for MongoDB ObjectId format
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid blog ID format",
      });
    }

    const blog = await Blog.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } }, // Increment views by 1
      { new: true } // Return updated document
    );

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    res.status(200).json({
      success: true,
      blog: blog,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching blog",
      error: error.message,
    });
  }
};

// Update Blog by ID
export const updateBlogById = async (req, res) => {
  try {
    // Validate MongoDB ObjectId format
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid blog ID format",
      });
    }

    const { title, category, description, short_description } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: "Title and description are required",
      });
    }

    // Find existing blog
    const existingBlog = await Blog.findById(req.params.id);
    if (!existingBlog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    // Checking if blog with same title already exists (excluding current blog)
    const duplicateBlog = await Blog.findOne({
      title: title.trim(),
      _id: { $ne: req.params.id },
    });
    if (duplicateBlog) {
      return res.status(409).json({
        success: false,
        message: "Blog with this title already exists",
      });
    }

    // Handle image update
    let imgUrl = existingBlog.img; // Keep existing image by default

    if (req.file) {
      // New image uploaded
      imgUrl = req.file.path;

      // Delete old image from Cloudinary if it exists and is not default
      if (
        existingBlog.img &&
        existingBlog.img !== "default-image.jpg" &&
        existingBlog.img.includes("cloudinary.com")
      ) {
        try {
          // Extract public_id from old Cloudinary URL
          const urlParts = existingBlog.img.split("/");
          const uploadIndex = urlParts.indexOf("upload");
          if (uploadIndex !== -1) {
            const publicIdWithExtension = urlParts
              .slice(uploadIndex + 2)
              .join("/");
            const publicId = publicIdWithExtension.replace(/\.[^/.]+$/, "");
            await cloudinary.uploader.destroy(publicId);
          }
        } catch (cloudinaryError) {
          console.error(
            "Error deleting old image from Cloudinary:",
            cloudinaryError
          );
        }
      }
    } else if (req.body.img) {
      // Image URL provided in body
      imgUrl = req.body.img;
    }

    const updatedBlog = await Blog.findByIdAndUpdate(
      req.params.id,
      {
        title,
        img: imgUrl,
        category,
        description,
        short_description,
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "Blog updated successfully",
      blog: updatedBlog,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: Object.values(error.errors).map((e) => e.message),
      });
    }

    res.status(500).json({
      success: false,
      message: "Error updating blog",
      error: error.message,
    });
  }
};

// Delete blog by ID
export const deleteBlogById = async (req, res) => {
  try {
    // Validate MongoDB ObjectId format
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid blog ID format",
      });
    }

    // Find the blog first to get image info
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    // Delete image from Cloudinary if it's not the default image
    if (blog.img && blog.img !== "default-image.jpg") {
      // Check if it's a Cloudinary URL
      if (blog.img.includes("cloudinary.com")) {
        try {
          // Extract public_id from Cloudinary URL
          const urlParts = blog.img.split("/");
          const uploadIndex = urlParts.indexOf("upload");
          if (uploadIndex !== -1) {
            // Get everything after /upload/v{timestamp}/
            const publicIdWithExtension = urlParts
              .slice(uploadIndex + 2)
              .join("/");

            const publicId = publicIdWithExtension.replace(/\.[^/.]+$/, "");

            await cloudinary.uploader.destroy(publicId);
          }
        } catch (cloudinaryError) {
          console.error("Error deleting from Cloudinary:", cloudinaryError);
        }
      }
    }

    const deletedBlog = await Blog.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Blog deleted successfully",
      blog: deletedBlog,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting blog",
      error: error.message,
    });
  }
};
