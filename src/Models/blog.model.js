import mongoose from "mongoose";

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true, // Field is mandatory
      trim: true, // Remove whitespace from both ends
      minlength: 5, // Minimum length for strings
      maxlength: 200, // Maximum length for strings
    },
    img: {
      type: String,
      default: "default-image.jpg", // Default value if not provided
    },
    category: {
      type: String, // Only allow specific values
      lowercase: true, // Convert to lowercase
    },
    description: {
      type: String,
      required: [true, "Description is required"], // Custom error message
      trim: true,
    },
    short_description: {
      type: String,
      maxlength: 150,
    },
    views: {
      type: Number,
      default: 0, // Default number
      min: 0, // Minimum value for numbers
      max: 1000000, // Maximum value for numbers
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const Blog = mongoose.model("Blog", blogSchema);

export default Blog;
