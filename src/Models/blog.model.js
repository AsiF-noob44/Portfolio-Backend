import mongoose from "mongoose";

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 5,
      maxlength: 200,
    },
    img: {
      type: String,
      default: "default-image.jpg",
    },
    category: {
      type: String,
      lowercase: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },
    short_description: {
      type: String,
      maxlength: [150, "Short description cannot exceed 150 characters"],
    },
    views: {
      type: Number,
      default: 0,
      min: 0,
      max: 1000000,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const Blog = mongoose.model("Blog", blogSchema);

export default Blog;
