import File from "../Models/file.model.js";
import cloudinary from "../Config/cloudinary.config.js";

export const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const { title, description } = req.body;

    const newFile = new File({
      filename: req.file.originalname,
      url: req.file.path,
      cloudinary_id: req.file.filename,
      title,
      description,
    });

    await newFile.save();

    res.status(201).json({
      message: "File uploaded successfully",
      file: newFile,
    });
  } catch (error) {
    console.error("File upload error:", error);
    res.status(500).json({
      message: "File upload failed",
      error: error.message,
    });
  }
};

// Get all files
export const getAllFiles = async (req, res) => {
  try {
    const files = await File.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: files.length,
      files,
    });
  } catch (error) {
    console.error("Error fetching files:", error);
    res.status(500).json({
      message: "Failed to fetch files",
      error: error.message,
    });
  }
};

// Delete a file
export const deleteFile = async (req, res) => {
  try {
    const { id } = req.params;

    const file = await File.findById(id);

    if (!file) {
      return res.status(404).json({
        success: false,
        message: "File not found",
      });
    }

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(file.cloudinary_id);

    // Delete from database
    await File.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "File deleted successfully",
      file,
    });
  } catch (error) {
    console.error("Error deleting file:", error);
    res.status(500).json({
      message: "Failed to delete file",
      error: error.message,
    });
  }
};
